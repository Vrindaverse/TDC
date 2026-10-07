"use server";

import { redirect } from "next/navigation";

import { friendlyAuthError } from "@/lib/auth/errors";
import { auth } from "@/lib/auth/server";
import {
  fieldErrorsFromZod,
  loginSchema,
  type FieldErrors,
} from "@/lib/validation/auth";

export type LoginFormState = {
  error?: string;
  fieldErrors?: FieldErrors;
} | null;

export async function loginAction(
  _prev: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
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
