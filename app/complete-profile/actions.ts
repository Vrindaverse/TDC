"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import {
  clearPendingEmailCookie,
  getPendingRegistration,
  getProfile,
  getSession,
} from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { colleges, pendingRegistrations, profiles } from "@/lib/db/schema";
import {
  completeProfileSchema,
  fieldErrorsFromZod,
  type FieldErrors,
} from "@/lib/validation/auth";

export type CompleteProfileFormState = {
  error?: string;
  fieldErrors?: FieldErrors;
} | null;

export async function completeProfileAction(
  _prev: CompleteProfileFormState,
  formData: FormData
): Promise<CompleteProfileFormState> {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  try {
    const existing = await getProfile(session.user.id);
    if (existing) {
      redirect("/post-auth");
    }

    const parsed = completeProfileSchema.safeParse({
      mobile: formData.get("mobile"),
      collegeId: formData.get("collegeId"),
      enrollmentNumber: formData.get("enrollmentNumber"),
    });
    if (!parsed.success) {
      return { fieldErrors: fieldErrorsFromZod(parsed.error) };
    }
    const input = parsed.data;

    const collegeRows = await db
      .select({ id: colleges.id })
      .from(colleges)
      .where(and(eq(colleges.id, input.collegeId), eq(colleges.isActive, true)))
      .limit(1);
    if (collegeRows.length === 0) {
      return { fieldErrors: { collegeId: "Select a valid college." } };
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

    await db.insert(profiles).values({
      userId: session.user.id,
      name: session.user.name || "TDC Member",
      mobile: input.mobile,
      collegeId: input.collegeId,
      enrollmentNumber: input.enrollmentNumber,
      role: "USER",
    });

    const pending = await getPendingRegistration(session.user.email);
    if (pending) {
      await db
        .delete(pendingRegistrations)
        .where(eq(pendingRegistrations.email, pending.email));
      await clearPendingEmailCookie();
    }
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    console.error("[complete-profile] unexpected error:", err);
    return {
      error:
        "Something went wrong while saving your profile. Please try again.",
    };
  }

  redirect("/post-auth");
}

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
