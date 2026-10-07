"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { friendlyAuthError } from "@/lib/auth/errors";
import {
  clearPendingEmailCookie,
  getSession,
  getPendingContext,
  markEmailVerifiedCookie,
} from "@/lib/auth/guards";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { pendingRegistrations, profiles } from "@/lib/db/schema";
import { findUserIdByEmail, isEmailVerified } from "@/lib/db/users";
import {
  otpSchema,
  type FieldErrors,
} from "@/lib/validation/auth";

export type VerifyFormState = {
  error?: string;
  fieldErrors?: FieldErrors;
} | null;

export type ResendFormState = {
  sent?: boolean;
  error?: string;
} | null;

async function resolveTargetEmail(): Promise<string | null> {
  const context = await getPendingContext();
  if (context) return context.email;
  const session = await getSession();
  return session?.user?.email ?? null;
}

export async function verifyEmailAction(
  _prev: VerifyFormState,
  formData: FormData
): Promise<VerifyFormState> {
  const email = await resolveTargetEmail();
  if (!email) {
    return {
      error: "We couldn't find the account to verify. Please start again.",
    };
  }

  const parsed = otpSchema.safeParse({ otp: formData.get("otp") });
  if (!parsed.success) {
    return {
      fieldErrors: {
        otp: parsed.error.issues[0]?.message ?? "Enter the 6-digit code",
      },
    };
  }

  let target = "/complete-profile";

  try {
    const result = await auth.emailOtp.verifyEmail({
      email,
      otp: parsed.data.otp,
    });
    const verified = !result.error || (await isEmailVerified(email));
    if (!verified) {
      console.error(
        "[verify] emailOtp.verifyEmail failed:",
        result.error?.code ?? result.error?.message
      );
      return { error: friendlyAuthError(result.error) };
    }
    await markEmailVerifiedCookie();

    const context = await getPendingContext();
    if (context?.pending) {
      const pending = context.pending;

      const userId = await findUserIdByEmail(email);
      if (!userId) {
        return {
          error:
            "Your email is verified but we couldn't find your account. Please sign in again.",
        };
      }

      const mobileRows = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.mobile, pending.mobile))
        .limit(1);
      if (mobileRows.length > 0) {
        return {
          error: "This mobile number is already registered to another account.",
        };
      }

      const enrollmentRows = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.enrollmentNumber, pending.enrollmentNumber))
        .limit(1);
      if (enrollmentRows.length > 0) {
        return {
          error:
            "This enrollment number is already registered to another account.",
        };
      }

      await db
        .insert(profiles)
        .values({
          userId,
          name: pending.name,
          mobile: pending.mobile,
          collegeId: pending.collegeId,
          enrollmentNumber: pending.enrollmentNumber,
          role: "USER",
        })
        .onConflictDoUpdate({
          target: profiles.userId,
          set: {
            name: pending.name,
            mobile: pending.mobile,
            collegeId: pending.collegeId,
            enrollmentNumber: pending.enrollmentNumber,
            updatedAt: new Date(),
          },
        });

      await db
        .delete(pendingRegistrations)
        .where(eq(pendingRegistrations.email, pending.email));
      await clearPendingEmailCookie();
      target = "/profile";
    }
  } catch (err) {
    console.error("[verify] unexpected error:", err);
    return {
      error: "Something went wrong while verifying your code. Please try again.",
    };
  }

  redirect(target);
}

export async function resendOtpAction(): Promise<ResendFormState> {
  const email = await resolveTargetEmail();
  if (!email) {
    return {
      error: "We couldn't find the account to verify. Please start again.",
    };
  }

  try {
    const result = await auth.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });
    if (result.error) {
      console.error(
        "[verify] sendVerificationOtp failed:",
        result.error.code ?? result.error.message
      );
      return { error: friendlyAuthError(result.error) };
    }
    return { sent: true };
  } catch (err) {
    console.error("[verify] unexpected error:", err);
    return { error: "We couldn't resend the code. Please try again." };
  }
}
