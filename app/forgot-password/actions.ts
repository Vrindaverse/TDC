"use server";

import { redirect } from "next/navigation";

import { friendlyAuthError } from "@/lib/auth/errors";
import { setResetEmailCookie } from "@/lib/auth/guards";
import { auth } from "@/lib/auth/server";
import {
  fieldErrorsFromZod,
  forgotPasswordSchema,
  type FieldErrors,
} from "@/lib/validation/auth";

export type RequestResetState = {
  error?: string;
  fieldErrors?: FieldErrors;
} | null;

export async function requestResetCodeAction(
  _prev: RequestResetState,
  formData: FormData
): Promise<RequestResetState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const email = parsed.data.email.toLowerCase();

  try {
    const result = await auth.emailOtp.sendVerificationOtp({
      email,
      type: "forget-password",
    });
    if (result.error) {
      console.error(
        "[forgot-password] sendVerificationOtp failed:",
        result.error.code ?? result.error.message
      );
      return { error: friendlyAuthError(result.error) };
    }
    await setResetEmailCookie(email);
  } catch (err) {
    console.error("[forgot-password] unexpected error:", err);
    return {
      error: "We couldn't send a reset code. Please try again.",
    };
  }

  redirect("/reset-password");
}