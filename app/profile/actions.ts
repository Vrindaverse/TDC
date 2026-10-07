"use server";

import { revalidatePath } from "next/cache";

import { friendlyAuthError } from "@/lib/auth/errors";
import { requireProfile } from "@/lib/auth/guards";
import { auth } from "@/lib/auth/server";
import {
  changePasswordSchema,
  fieldErrorsFromZod,
  type FieldErrors,
} from "@/lib/validation/auth";
import { validateCsrfToken } from "@/lib/csrf";

export type ChangePasswordState = {
  success?: boolean;
  error?: string;
  fieldErrors?: FieldErrors;
} | null;

async function changePasswordActionInternal(
  _prev: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    return { error: "Invalid request. Please refresh and try again." };
  }

  await requireProfile();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  try {
    const result = await auth.changePassword({
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
      revokeOtherSessions: true,
    });
    if (result.error) {
      console.error(
        "[profile] changePassword failed:",
        result.error.code ?? result.error.message
      );
      return { error: friendlyAuthError(result.error) };
    }
  } catch (err) {
    console.error("[profile] changePassword unexpected error:", err);
    return {
      error: "We couldn't change your password. Please try again.",
    };
  }

  revalidatePath("/profile");
  return { success: true };
}

export { changePasswordActionInternal as changePasswordAction };