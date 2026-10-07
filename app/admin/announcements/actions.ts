"use server";

import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { announcements } from "@/lib/db/schema";
import { announcementSchema } from "@/lib/validation/announcements";
import { fieldErrorsFromZod, type FieldErrors } from "@/lib/validation/auth";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type AnnouncementFormState = {
  error?: string;
  fieldErrors?: FieldErrors;
} | null;

export async function createAnnouncementAction(
  _prev: AnnouncementFormState,
  formData: FormData
): Promise<AnnouncementFormState> {
  const { profile } = await requireAdmin();

  const parsed = announcementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  try {
    await db.insert(announcements).values({
      title: parsed.data.title,
      body: parsed.data.body,
      createdBy: profile.id,
    });
  } catch (err) {
    console.error("[admin/announcements] create failed:", err);
    return { error: "We couldn't save the announcement. Please try again." };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/");
  redirect("/admin/announcements");
}

export async function deleteAnnouncementAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) {
    redirect("/admin/announcements?error=not_found");
  }

  try {
    const existing = await db
      .select({ id: announcements.id })
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);
    if (existing.length === 0) {
      redirect("/admin/announcements?error=not_found");
    }
    await db.delete(announcements).where(eq(announcements.id, id));
  } catch (err) {
    console.error("[admin/announcements] delete failed:", err);
    redirect("/admin/announcements?error=delete");
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/");
  redirect("/admin/announcements");
}

export async function toggleAnnouncementAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const field = String(formData.get("field") ?? "");
  const value = formData.get("value") === "true";

  if (!UUID_PATTERN.test(id) || (field !== "pinned" && field !== "isActive")) {
    redirect("/admin/announcements?error=not_found");
  }

  try {
    const patch =
      field === "pinned"
        ? { pinned: value }
        : { isActive: value };
    await db
      .update(announcements)
      .set(patch)
      .where(and(eq(announcements.id, id)));
  } catch (err) {
    console.error("[admin/announcements] toggle failed:", err);
    redirect("/admin/announcements?error=update");
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/");
  redirect("/admin/announcements");
}

export async function assertAnnouncementExists(id: string) {
  const rows = await db
    .select({ id: announcements.id })
    .from(announcements)
    .where(eq(announcements.id, id))
    .limit(1);
  if (rows.length === 0) notFound();
}