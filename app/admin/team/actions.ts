"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { recordAudit } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { teamPosts } from "@/lib/db/schema";
import { validateCsrfToken } from "@/lib/csrf";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

async function setTeamPostStatusActionInternal(formData: FormData) {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) redirect("/admin/team?error=csrf");

  const { profile } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!UUID_PATTERN.test(id) || !["approved", "rejected"].includes(status)) {
    redirect("/admin/team?error=not_found");
  }

  try {
    const [existing] = await db
      .select({ id: teamPosts.id, title: teamPosts.title })
      .from(teamPosts)
      .where(eq(teamPosts.id, id))
      .limit(1);
    if (!existing) redirect("/admin/team?error=not_found");

    await db
      .update(teamPosts)
      .set({ status })
      .where(eq(teamPosts.id, id));

    await recordAudit({
      actorId: profile.id,
      actorName: profile.name,
      action: status === "approved" ? "team_post.approve" : "team_post.reject",
      targetType: "team_post",
      targetId: id,
      detail: existing.title,
    });
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    console.error("[admin/team] status update failed:", err);
    redirect("/admin/team?error=update");
  }

  revalidatePath("/admin/team");
  revalidatePath("/profile");
  redirect("/admin/team?updated=1");
}

async function deleteTeamPostActionInternal(formData: FormData) {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) redirect("/admin/team?error=csrf");

  const { profile } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) {
    redirect("/admin/team?error=not_found");
  }

  try {
    const [existing] = await db
      .select({ id: teamPosts.id, title: teamPosts.title })
      .from(teamPosts)
      .where(eq(teamPosts.id, id))
      .limit(1);
    if (!existing) redirect("/admin/team?error=not_found");

    await db.delete(teamPosts).where(eq(teamPosts.id, id));

    await recordAudit({
      actorId: profile.id,
      actorName: profile.name,
      action: "team_post.delete",
      targetType: "team_post",
      targetId: id,
      detail: existing.title,
    });
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    console.error("[admin/team] delete failed:", err);
    redirect("/admin/team?error=delete");
  }

  revalidatePath("/admin/team");
  revalidatePath("/profile");
  redirect("/admin/team?deleted=1");
}

export {
  setTeamPostStatusActionInternal as setTeamPostStatusAction,
  deleteTeamPostActionInternal as deleteTeamPostAction,
};
