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

export type ResetPasswordState = {
  error?: string;
  fieldErrors?: FieldErrors;
} | null;

export async function resendResetCodeAction(formData: FormData) {
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

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
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