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
import { validateCsrfToken } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/rate-limit";

export type RequestResetState = {
  error?: string;
  fieldErrors?: FieldErrors;
} | null;

async function requestResetCodeActionInternal(
  _prev: RequestResetState,
  formData: FormData
): Promise<RequestResetState> {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    return { error: "Invalid request. Please refresh and try again." };
  }

  const rateLimit = await checkRateLimit("auth:forgot-password");
  if (!rateLimit.success) {
    return { error: rateLimit.error ?? "Too many requests. Please try again later." };
  }

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

export { requestResetCodeActionInternal as requestResetCodeAction };