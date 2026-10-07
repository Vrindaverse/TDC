"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { friendlyAuthError } from "@/lib/auth/errors";
import {
  clearResetEmailCookie,
  getResetEmail,
  setResetEmailCookie,
} from "@/lib/auth/guards";
import { auth } from "@/lib/auth/server";
import {
  fieldErrorsFromZod,
  resetPasswordSchema,
  type FieldErrors,
} from "@/lib/validation/auth";
import { validateCsrfToken } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/rate-limit";

export type ResetPasswordState = {
  error?: string;
  fieldErrors?: FieldErrors;
} | null;

async function resendResetCodeActionInternal(formData: FormData) {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    redirect("/forgot-password");
  }

  const rateLimit = await checkRateLimit("auth:resend");
  if (!rateLimit.success) {
    redirect("/reset-password?error=resend");
    return;
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/forgot-password");
  }

  try {
    const result = await auth.emailOtp.sendVerificationOtp({
      email,
      type: "forget-password",
    });
    if (result.error) {
      console.error(
        "[reset-password] resend failed:",
        result.error.code ?? result.error.message
      );
      redirect("/reset-password?error=resend");
      return;
    }
    await setResetEmailCookie(email);
  } catch (err) {
    console.error("[reset-password] resend unexpected error:", err);
    redirect("/reset-password?error=resend");
    return;
  }

  revalidatePath("/reset-password");
  redirect("/reset-password?resent=1");
}

export { resendResetCodeActionInternal as resendResetCodeAction };

async function resetPasswordActionInternal(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    return { error: "Invalid request. Please refresh and try again." };
  }

  const rateLimit = await checkRateLimit("auth:reset-password");
  if (!rateLimit.success) {
    return { error: rateLimit.error ?? "Too many reset attempts. Please try again later." };
  }

  const email = await getResetEmail();
  if (!email) {
    redirect("/forgot-password");
  }

  const parsed = resetPasswordSchema.safeParse({
    otp: formData.get("otp"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  try {
    const result = await auth.emailOtp.resetPassword({
      email,
      otp: parsed.data.otp,
      password: parsed.data.password,
    });
    if (result.error) {
      console.error(
        "[reset-password] emailOtp.resetPassword failed:",
        result.error.code ?? result.error.message
      );
      return { error: friendlyAuthError(result.error) };
    }
  } catch (err) {
    console.error("[reset-password] unexpected error:", err);
    return {
      error:
        "Something went wrong while resetting your password. Please try again.",
    };
  }

  await clearResetEmailCookie();
  redirect("/login?reset=1");
}

export { resetPasswordActionInternal as resetPasswordAction };