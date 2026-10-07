"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { setPendingEmailCookie } from "@/lib/auth/guards";
import { friendlyAuthError } from "@/lib/auth/errors";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { colleges, pendingRegistrations, profiles } from "@/lib/db/schema";
import { fieldErrorsFromZod, registerSchema } from "@/lib/validation/auth";
import { validateCsrfToken } from "@/lib/csrf";
import { findUserIdByEmail } from "@/lib/db/users";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { CONFIG } from "@/lib/config";

export type RegisterFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

const PENDING_TTL_MS = CONFIG.auth.pendingTtlMs;

async function registerActionInternal(
  _prev: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    logger.warn("CSRF validation failed", { action: "register" });
    return { error: "Invalid request. Please refresh and try again." };
  }

  const rateLimit = await checkRateLimit("auth:register");
  if (!rateLimit.success) {
    logger.warn("Rate limit exceeded", { action: "register" });
    return { error: rateLimit.error ?? "Too many registration attempts. Please try again later." };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    mobile: formData.get("mobile"),
    collegeId: formData.get("collegeId"),
    enrollmentNumber: formData.get("enrollmentNumber"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    logger.warn("Registration validation failed", { action: "register", errors: parsed.error.flatten() });
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const input = parsed.data;
  const email = input.email.toLowerCase();

  try {
    const collegeRows = await db
      .select({ id: colleges.id })
      .from(colleges)
      .where(and(eq(colleges.id, input.collegeId), eq(colleges.isActive, true)))
      .limit(1);
    if (collegeRows.length === 0) {
      return { fieldErrors: { collegeId: "Select a valid college." } };
    }

    const duplicateMessages: Record<string, string> = {};

    const existingUserId = await findUserIdByEmail(email);
    if (existingUserId) {
      duplicateMessages.email = "This email is already registered.";
    }

    const pendingMobile = await db
      .select({ email: pendingRegistrations.email })
      .from(pendingRegistrations)
      .where(eq(pendingRegistrations.mobile, input.mobile))
      .limit(1);
    if (pendingMobile.length > 0) {
      duplicateMessages.mobile = "This mobile number is already registered.";
    }

    const pendingEnrollment = await db
      .select({ email: pendingRegistrations.email })
      .from(pendingRegistrations)
      .where(eq(pendingRegistrations.enrollmentNumber, input.enrollmentNumber))
      .limit(1);
    if (pendingEnrollment.length > 0) {
      duplicateMessages.enrollmentNumber =
        "This enrollment number is already registered.";
    }

    if (Object.keys(duplicateMessages).length > 0) {
      return { fieldErrors: duplicateMessages };
    }

    const mobileRows = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.mobile, input.mobile))
      .limit(1);
    if (mobileRows.length > 0) {
      return {
        fieldErrors: {
          mobile: "This mobile number is already registered.",
        },
      };
    }

    const enrollmentRows = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.enrollmentNumber, input.enrollmentNumber))
      .limit(1);
    if (enrollmentRows.length > 0) {
      return {
        fieldErrors: {
          enrollmentNumber: "This enrollment number is already registered.",
        },
      };
    }

    const { error: signUpError } = await auth.signUp.email({
      email,
      name: input.name,
      password: input.password,
    });
    if (signUpError) {
      logger.error("Neon Auth signUp failed", { action: "register", email, code: signUpError.code });
      return { error: friendlyAuthError(signUpError) };
    }

    const otpResult = await auth.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });
    if (otpResult.error) {
      logger.error("Neon Auth sendVerificationOtp failed", { action: "register", email, code: otpResult.error.code });
      return {
        error:
          "Your account was created but we could not send the verification code. Please try again.",
      };
    }

    await db
      .insert(pendingRegistrations)
      .values({
        email,
        name: input.name,
        mobile: input.mobile,
        collegeId: input.collegeId,
        enrollmentNumber: input.enrollmentNumber,
        expiresAt: new Date(Date.now() + PENDING_TTL_MS),
      })
      .onConflictDoUpdate({
        target: pendingRegistrations.email,
        set: {
          name: input.name,
          mobile: input.mobile,
          collegeId: input.collegeId,
          enrollmentNumber: input.enrollmentNumber,
          expiresAt: new Date(Date.now() + PENDING_TTL_MS),
        },
      });

    await setPendingEmailCookie(email);
    logger.info("Registration completed", { action: "register", email });
  } catch (err) {
    logger.error("Registration unexpected error", { action: "register", email, error: String(err) });
    return {
      error:
        "Something went wrong while creating your account. Please try again.",
    };
  }

  redirect("/verify");
}

export { registerActionInternal as registerAction };
