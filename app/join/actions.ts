"use server";

import { randomBytes } from "node:crypto";
import { and, eq, isNull, or } from "drizzle-orm";
import { redirect } from "next/navigation";

import { friendlyAuthError } from "@/lib/auth/errors";
import {
  clearJoinShadowCookie,
  getJoinShadowEmail,
  getJoinVerifiedEmail,
  getProfile,
  getSession,
  setJoinShadowCookie,
  setJoinVerifiedCookie,
} from "@/lib/auth/guards";
import { auth } from "@/lib/auth/server";
import { db, sql } from "@/lib/db";
import { events, registrations } from "@/lib/db/schema";
import { findUserIdByEmail } from "@/lib/db/users";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  fieldErrorsFromZod,
  otpSchema,
  type FieldErrors,
} from "@/lib/validation/auth";
import {
  joinSchema,
  joinSemesterSchema,
} from "@/lib/validation/join";

export type SendCodeFormState = {
  sent?: boolean;
  error?: string;
} | null;

export type VerifyCodeFormState = {
  verified?: boolean;
  error?: string;
  fieldErrors?: FieldErrors;
} | null;

export type RegisterFormState = {
  error?: string;
  reason?: "details" | "verify" | "semester" | "closed" | "duplicate";
} | null;

async function sendOtpToEmail(email: string, name: string) {
  let shadowCreated = false;
  const existingId = await findUserIdByEmail(email);
  if (!existingId) {
    const password = randomBytes(24).toString("base64url");
    const { error: signUpError } = await auth.signUp.email({
      email,
      name: name.trim().slice(0, 80) || "TDC guest",
      password,
    });
    if (signUpError) {
      console.error(
        "[join] shadow signUp.email failed:",
        signUpError.code ?? signUpError.message
      );
      return { error: friendlyAuthError(signUpError), shadowCreated };
    }
    shadowCreated = true;
  }

  const otpResult = await auth.emailOtp.sendVerificationOtp({
    email,
    type: "email-verification",
  });
  if (otpResult.error) {
    console.error(
      "[join] sendVerificationOtp failed:",
      otpResult.error.code ?? otpResult.error.message
    );
    return { error: friendlyAuthError(otpResult.error), shadowCreated };
  }
  return { error: null, shadowCreated };
}

export async function sendJoinCodeAction(
  _prev: SendCodeFormState,
  formData: FormData
): Promise<SendCodeFormState> {
  const rateLimit = await checkRateLimit("auth:join-send");
  if (!rateLimit.success) {
    return {
      error: rateLimit.error ?? "Too many requests. Please try again later.",
    };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address first." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const result = await sendOtpToEmail(email, name);
  if (result.error) return { error: result.error };
  if (result.shadowCreated) {
    await setJoinShadowCookie(email);
  }
  return { sent: true };
}

export async function verifyJoinCodeAction(
  _prev: VerifyCodeFormState,
  formData: FormData
): Promise<VerifyCodeFormState> {
  const rateLimit = await checkRateLimit("auth:join-verify");
  if (!rateLimit.success) {
    return {
      error:
        rateLimit.error ??
        "Too many verification attempts. Please try again later.",
    };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address first." };
  }

  const parsed = otpSchema.safeParse({ otp: formData.get("otp") });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  try {
    const result = await auth.emailOtp.verifyEmail({
      email,
      otp: parsed.data.otp,
    });
    if (result.error) {
      console.error(
        "[join] emailOtp.verifyEmail failed:",
        result.error.code ?? result.error.message
      );
      return { error: friendlyAuthError(result.error) };
    }
    await setJoinVerifiedCookie(email);
    const shadowEmail = await getJoinShadowEmail();
    if (shadowEmail === email) {
      try {
        // The temp account only existed to deliver the OTP. With the email
        // now verified, remove it so event registrants never become users.
        await sql`delete from neon_auth."user" where lower(email) = ${email}`;
        await clearJoinShadowCookie();
      } catch (err) {
        console.error("[join] shadow user cleanup failed:", err);
      }
    }
    return { verified: true };
  } catch (err) {
    console.error("[join] unexpected verify error:", err);
    return {
      error: "Something went wrong while verifying your code. Please try again.",
    };
  }
}

export async function registerForEventAction(
  _prev: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const eventId = String(formData.get("eventId") ?? "").trim();
  if (!eventId) {
    return { error: "Please choose an event from the list.", reason: "details" };
  }

  const [event] = await db
    .select({
      id: events.id,
      registrationStatus: events.registrationStatus,
      startsAt: events.startsAt,
    })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  if (!event) {
    return {
      error: "That event is no longer available. Pick another one below.",
      reason: "closed",
    };
  }
  if (event.registrationStatus === "closed") {
    return {
      error: "Registration for that event just closed. Pick another upcoming event.",
      reason: "closed",
    };
  }
  if (event.startsAt < new Date()) {
    return {
      error: "That event has already started. Pick an upcoming event below.",
      reason: "closed",
    };
  }

  const session = await getSession();
  const profile = session?.user ? await getProfile(session.user.id) : null;

  if (profile) {
    const parsedSemester = joinSemesterSchema.safeParse(
      formData.get("semester")
    );
    if (!parsedSemester.success) {
      return { error: "Please choose your current semester.", reason: "semester" };
    }

    const inserted = await db
      .insert(registrations)
      .values({
        profileId: profile.id,
        eventId: event.id,
        semester: parsedSemester.data,
        mobile: profile.mobile,
        enrollmentNumber: profile.enrollmentNumber,
      })
      .onConflictDoNothing();

    redirect(inserted.rowCount === 0 ? "/profile" : "/profile?registered=1");
  }

  const parsed = joinSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    mobile: formData.get("mobile"),
    enrollmentNumber: formData.get("enrollmentNumber"),
    semester: formData.get("semester"),
  });
  if (!parsed.success) {
    return {
      error: "Please fill in your name, email, mobile and enrollment numbers to register.",
      reason: "details",
    };
  }

  const input = parsed.data;
  const email = input.email.toLowerCase();

  const verifiedEmail = await getJoinVerifiedEmail();
  if (!verifiedEmail || verifiedEmail !== email) {
    return {
      error: "Email verification expired. Request a new code and enter it below.",
      reason: "verify",
    };
  }

  const [duplicate] = await db
    .select({ id: registrations.id })
    .from(registrations)
    .where(
      and(
        eq(registrations.eventId, event.id),
        or(
          eq(registrations.email, email),
          and(
            isNull(registrations.email),
            or(
              eq(registrations.mobile, input.mobile),
              eq(registrations.enrollmentNumber, input.enrollmentNumber)
            )
          )
        )
      )
    )
    .limit(1);

  if (duplicate) {
    return {
      error: "You're already registered for this event. Pick another event below.",
      reason: "duplicate",
    };
  }

  const inserted = await db
    .insert(registrations)
    .values({
      eventId: event.id,
      name: input.name,
      email,
      mobile: input.mobile,
      enrollmentNumber: input.enrollmentNumber,
      semester: input.semester,
    })
    .onConflictDoNothing();

  if (inserted.rowCount === 0) {
    return {
      error: "You're already registered for this event. Pick another event below.",
      reason: "duplicate",
    };
  }

  await clearJoinShadowCookie();
  redirect("/join?registered=1");
}