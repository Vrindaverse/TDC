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
import { validateCsrfToken } from "@/lib/csrf";

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

async function createAnnouncementActionInternal(
  _prev: AnnouncementFormState,
  formData: FormData
): Promise<AnnouncementFormState> {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    return { error: "Invalid request. Please refresh and try again." };
  }

  const { profile } = await requireAdmin();

  const parsed = announcementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    audience: formData.get("audience") ?? "all",
    teamId: formData.get("teamId") ?? "",
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  if (parsed.data.audience === "team" && !parsed.data.teamId) {
    return { fieldErrors: { teamId: "Select a team." } };
  }

  let announcementId: string;
  try {
    const [inserted] = await db
      .insert(announcements)
      .values({
        title: parsed.data.title,
        body: parsed.data.body,
        audience: parsed.data.audience,
        teamId: parsed.data.audience === "team" ? parsed.data.teamId || null : null,
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

export { createAnnouncementActionInternal as createAnnouncementAction };

async function updateAnnouncementActionInternal(
  _prev: AnnouncementFormState,
  formData: FormData
): Promise<AnnouncementFormState> {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    return { error: "Invalid request. Please refresh and try again." };
  }

  const { profile } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) {
    return { error: "That announcement no longer exists." };
  }

  const parsed = announcementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    audience: formData.get("audience") ?? "all",
    teamId: formData.get("teamId") ?? "",
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  if (parsed.data.audience === "team" && !parsed.data.teamId) {
    return { fieldErrors: { teamId: "Select a team." } };
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

    const result = await db
      .update(announcements)
      .set({
        title: parsed.data.title,
        body: parsed.data.body,
        audience: parsed.data.audience,
        teamId: parsed.data.audience === "team" ? parsed.data.teamId || null : null,
      })
      .where(eq(announcements.id, id))
      .returning({ id: announcements.id });

    if (result.length === 0) {
      return { error: "That announcement no longer exists." };
    }

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

export { updateAnnouncementActionInternal as updateAnnouncementAction };

async function deleteAnnouncementActionInternal(formData: FormData) {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    redirect("/admin/announcements?error=csrf");
  }

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

export { deleteAnnouncementActionInternal as deleteAnnouncementAction };

async function toggleAnnouncementActionInternal(formData: FormData) {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    redirect("/admin/announcements?error=csrf");
  }

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
      const result = await db
        .update(announcements)
        .set(patch)
        .where(eq(announcements.id, id))
        .returning({ id: announcements.id });

      if (result.length === 0) {
        outcome = "not_found";
      } else {
        detail = `${existing.title}: ${field} → ${value}`;
      }
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

export { toggleAnnouncementActionInternal as toggleAnnouncementAction };
