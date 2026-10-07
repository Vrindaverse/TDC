"use server";

import { revalidatePath } from "next/cache";

import { eq, and } from "drizzle-orm";
import { friendlyAuthError } from "@/lib/auth/errors";
import { requireProfile } from "@/lib/auth/guards";
import { auth } from "@/lib/auth/server";
import {
  changePasswordSchema,
  fieldErrorsFromZod,
  type FieldErrors,
} from "@/lib/validation/auth";
import { validateCsrfToken } from "@/lib/csrf";
import { db } from "@/lib/db";
import { colleges, events, profiles, registrations, teamPosts } from "@/lib/db/schema";
import { editProfileSchema, teamPostSchema } from "@/lib/validation/profile";

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
export type ProfileFormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: FieldErrors;
} | null;

async function updateProfileActionInternal(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    return { error: "Invalid request. Please refresh and try again." };
  }

  const { profile } = await requireProfile();

  const parsed = editProfileSchema.safeParse({
    name: formData.get("name"),
    mobile: formData.get("mobile"),
    collegeId: formData.get("collegeId"),
    enrollmentNumber: formData.get("enrollmentNumber"),
    bio: formData.get("bio") ?? "",
    skills: formData.get("skills") ?? "",
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const collegeRows = await db
    .select({ id: colleges.id })
    .from(colleges)
    .where(and(eq(colleges.id, parsed.data.collegeId), eq(colleges.isActive, true)))
    .limit(1);
  if (collegeRows.length === 0) {
    return { fieldErrors: { collegeId: "Select a valid college." } };
  }

  const skillList = (parsed.data.skills ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 15);

  try {
    const mobileRows = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.mobile, parsed.data.mobile))
      .limit(2);
    if (mobileRows.some((row) => row.id !== profile.id)) {
      return { fieldErrors: { mobile: "This mobile number is already registered." } };
    }

    const enrollmentRows = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.enrollmentNumber, parsed.data.enrollmentNumber))
      .limit(2);
    if (enrollmentRows.some((row) => row.id !== profile.id)) {
      return {
        fieldErrors: { enrollmentNumber: "This enrollment number is already registered." },
      };
    }

    await db
      .update(profiles)
      .set({
        name: parsed.data.name,
        mobile: parsed.data.mobile,
        collegeId: parsed.data.collegeId,
        enrollmentNumber: parsed.data.enrollmentNumber,
        bio: parsed.data.bio || null,
        skills: skillList,
      })
      .where(eq(profiles.id, profile.id));
  } catch (err) {
    console.error("[profile] update failed:", err);
    return { error: "We couldn't save your profile. Please try again." };
  }

  revalidatePath("/profile");
  return { success: true };
}

export { updateProfileActionInternal as updateProfileAction };

export type SimpleActionState = { error?: string; success?: boolean } | null;

async function cancelRegistrationActionInternal(
  _prev: SimpleActionState,
  formData: FormData
): Promise<SimpleActionState> {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    return { error: "Invalid request. Please refresh and try again." };
  }

  const { profile } = await requireProfile();
  const registrationId = formData.get("registrationId");
  if (typeof registrationId !== "string" || !registrationId) {
    return { error: "Missing registration." };
  }

  try {
    await db
      .delete(registrations)
      .where(
        and(
          eq(registrations.id, registrationId),
          eq(registrations.profileId, profile.id)
        )
      );
  } catch (err) {
    console.error("[profile] cancel registration failed:", err);
    return { error: "We couldn't cancel that registration." };
  }

  revalidatePath("/profile");
  return { success: true };
}

export { cancelRegistrationActionInternal as cancelRegistrationAction };

async function createTeamPostActionInternal(
  _prev: SimpleActionState,
  formData: FormData
): Promise<SimpleActionState> {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    return { error: "Invalid request. Please refresh and try again." };
  }

  const { profile } = await requireProfile();

  const parsed = teamPostSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    eventId: formData.get("eventId") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid post." };
  }

  try {
    await db.insert(teamPosts).values({
      profileId: profile.id,
      eventId: parsed.data.eventId || null,
      title: parsed.data.title,
      body: parsed.data.body,
      status: "pending",
    });
  } catch (err) {
    console.error("[profile] create team post failed:", err);
    return { error: "We couldn't post that. Please try again." };
  }

  revalidatePath("/profile");
  return { success: true };
}

export { createTeamPostActionInternal as createTeamPostAction };
