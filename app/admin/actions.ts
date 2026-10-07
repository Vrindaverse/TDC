"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { deleteAvatarObject } from "@/lib/avatar";
import { recordAudit } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/auth/guards";
import { db, sql } from "@/lib/db";
import { profiles } from "@/lib/db/schema";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function deleteUserAction(formData: FormData) {
  const { session, profile: actor } = await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  if (!UUID_PATTERN.test(userId)) {
    redirect("/admin/users?error=not_found");
  }
  if (userId === session.user.id) {
    redirect("/admin/users?error=self");
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  if (!profile) {
    redirect("/admin/users?error=not_found");
  }

  if (profile.role === "ADMIN") {
    const [rows] = await sql`
      select count(*)::int as n from public.profiles where role = 'ADMIN'
    `;
    if (Number(rows.n) <= 1) {
      redirect("/admin/users?error=last_admin");
    }
  }

  if (profile.avatarKey) {
    try {
      await deleteAvatarObject(profile.avatarKey);
    } catch (err) {
      console.error("[admin] avatar delete failed:", err);
    }
  }

  const [emailRow] = await sql`
    select email from neon_auth."user" where id = ${userId}
  `;

  await sql`delete from neon_auth."user" where id = ${userId}`;
  await db.delete(profiles).where(eq(profiles.userId, userId));

  await recordAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "user.delete",
    targetType: "user",
    targetId: userId,
    detail: `${profile.name} <${(emailRow as { email?: string } | undefined)?.email ?? "unknown"}>`,
  });

  revalidatePath("/admin", "layout");
  redirect("/admin/users?deleted=1");
}

const USER_DETAIL_PATH = /^\/admin\/users\/[0-9a-f-]{36}$/;

export async function setUserRoleAction(formData: FormData) {
  const { session, profile: actor } = await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  const role = String(formData.get("role") ?? "").toUpperCase();
  const back = String(formData.get("back") ?? "/admin/users");

  if (!UUID_PATTERN.test(userId) || (role !== "USER" && role !== "ADMIN")) {
    redirect("/admin/users?error=bad_role");
  }
  if (!back.startsWith("/admin/users") || back.includes("://")) {
    redirect("/admin/users");
  }
  if (!USER_DETAIL_PATH.test(back) && back !== "/admin/users") {
    redirect("/admin/users");
  }
  if (userId === session.user.id) {
    redirect("/admin/users?error=self_role");
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  if (!profile) {
    redirect("/admin/users?error=not_found");
  }

  if (role === "USER" && profile.role === "ADMIN") {
    const [rows] = await sql`
      select count(*)::int as n from public.profiles where role = 'ADMIN'
    `;
    if (Number(rows.n) <= 1) {
      redirect("/admin/users?error=last_admin");
    }
  }

  if (role !== profile.role) {
    await db
      .update(profiles)
      .set({ role })
      .where(eq(profiles.userId, userId));

    await recordAudit({
      actorId: actor.id,
      actorName: actor.name,
      action: "user.role",
      targetType: "user",
      targetId: userId,
      detail: `${profile.name}: ${profile.role} → ${role}`,
    });
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/profile");
  redirect(back);
}