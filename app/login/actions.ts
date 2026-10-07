"use server";

import { redirect } from "next/navigation";

import { friendlyAuthError } from "@/lib/auth/errors";
import { auth } from "@/lib/auth/server";
import { fieldErrorsFromZod, loginSchema, type FieldErrors } from "@/lib/validation/auth";
import { validateCsrfToken } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/rate-limit";

export type LoginFormState = {
  error?: string;
  fieldErrors?: FieldErrors;
} | null;

async function loginActionInternal(
  _prev: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    return { error: "Invalid request. Please refresh and try again." };
  }

  const rateLimit = await checkRateLimit("auth:login");
  if (!rateLimit.success) {
    return { error: rateLimit.error ?? "Too many login attempts. Please try again later." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  try {
    const { error } = await auth.signIn.email({
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      rememberMe: true,
    });
    if (error) {
      console.error("[login] signIn.email failed:", error.code);
      return { error: friendlyAuthError(error) };
    }
  } catch (err) {
    console.error("[login] unexpected error:", err);
    return { error: "Something went wrong while signing in. Please try again." };
  }

  redirect("/post-auth");
}

export { loginActionInternal as loginAction };
