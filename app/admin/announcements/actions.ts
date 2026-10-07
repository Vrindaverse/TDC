"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { recordAudit } from "@/lib/admin/audit";
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

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

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

  let announcementId: string;
  try {
    const [inserted] = await db
      .insert(announcements)
      .values({
        title: parsed.data.title,
        body: parsed.data.body,
        createdBy: profile.id,
      })
      .returning({ id: announcements.id });
    announcementId = inserted.id;
  } catch (err) {
    console.error("[admin/announcements] create failed:", err);
    return { error: "We couldn't save the announcement. Please try again." };
  }

  await recordAudit({
    actorId: profile.id,
    actorName: profile.name,
    action: "announcement.create",
    targetType: "announcement",
    targetId: announcementId,
    detail: parsed.data.title,
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/");
  redirect("/admin/announcements");
}

export async function updateAnnouncementAction(
  _prev: AnnouncementFormState,
  formData: FormData
): Promise<AnnouncementFormState> {
  const { profile } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) {
    return { error: "That announcement no longer exists." };
  }

  const parsed = announcementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  try {
    const [existing] = await db
      .select({ id: announcements.id, title: announcements.title })
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);
    if (!existing) {
      return { error: "That announcement no longer exists." };
    }

    await db
      .update(announcements)
      .set({
        title: parsed.data.title,
        body: parsed.data.body,
      })
      .where(eq(announcements.id, id));

    await recordAudit({
      actorId: profile.id,
      actorName: profile.name,
      action: "announcement.update",
      targetType: "announcement",
      targetId: id,
      detail:
        existing.title === parsed.data.title
          ? parsed.data.title
          : `"${existing.title}" → "${parsed.data.title}"`,
    });
  } catch (err) {
    console.error("[admin/announcements] update failed:", err);
    return { error: "We couldn't save the announcement. Please try again." };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/");
  redirect("/admin/announcements?updated=1");
}

export async function deleteAnnouncementAction(formData: FormData) {
  const { profile } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) {
    redirect("/admin/announcements?error=not_found");
  }

  let outcome: "ok" | "not_found" | "failed" = "ok";
  let detail: string | null = null;
  try {
    const [existing] = await db
      .select({ id: announcements.id, title: announcements.title })
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);
    if (!existing) {
      outcome = "not_found";
    } else {
      await db.delete(announcements).where(eq(announcements.id, id));
      detail = existing.title;
    }
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    console.error("[admin/announcements] delete failed:", err);
    outcome = "failed";
  }

  if (outcome === "not_found") redirect("/admin/announcements?error=not_found");
  if (outcome === "failed") redirect("/admin/announcements?error=delete");

  await recordAudit({
    actorId: profile.id,
    actorName: profile.name,
    action: "announcement.delete",
    targetType: "announcement",
    targetId: id,
    detail,
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/");
  redirect("/admin/announcements?deleted=1");
}

export async function toggleAnnouncementAction(formData: FormData) {
  const { profile } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const field = String(formData.get("field") ?? "");
  const value = formData.get("value") === "true";

  if (!UUID_PATTERN.test(id) || (field !== "pinned" && field !== "isActive")) {
    redirect("/admin/announcements?error=not_found");
  }

  let outcome: "ok" | "not_found" | "failed" = "ok";
  let detail: string | null = null;
  try {
    const [existing] = await db
      .select({ id: announcements.id, title: announcements.title })
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);
    if (!existing) {
      outcome = "not_found";
    } else {
      const patch = field === "pinned" ? { pinned: value } : { isActive: value };
      await db.update(announcements).set(patch).where(eq(announcements.id, id));
      detail = `${existing.title}: ${field} → ${value}`;
    }
  } catch (err) {
    console.error("[admin/announcements] toggle failed:", err);
    outcome = "failed";
  }

  if (outcome === "not_found") redirect("/admin/announcements?error=not_found");
  if (outcome === "failed") redirect("/admin/announcements?error=update");

  await recordAudit({
    actorId: profile.id,
    actorName: profile.name,
    action: "announcement.toggle",
    targetType: "announcement",
    targetId: id,
    detail,
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/");
  redirect("/admin/announcements");
}
