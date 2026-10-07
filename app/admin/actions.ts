"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { deleteAvatarObject } from "@/lib/avatar";
import { recordAudit } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/auth/guards";
import { db, sql } from "@/lib/db";
import { profiles, teams } from "@/lib/db/schema";
import { validateCsrfToken } from "@/lib/csrf";
import { getUserEmail, deleteUser as deleteNeonAuthUser } from "@/lib/neon-auth";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function deleteUserActionInternal(formData: FormData) {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    redirect("/admin/users?error=csrf");
  }

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
    const [rows] = await db
      .select({ count: count() })
      .from(profiles)
      .where(eq(profiles.role, "ADMIN"));
    if (Number(rows.count ?? 0) <= 1) {
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

  const email = await getUserEmail(userId);

  await deleteNeonAuthUser(userId);
  await db.delete(profiles).where(eq(profiles.userId, userId));

  await recordAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "user.delete",
    targetType: "user",
    targetId: userId,
    detail: `${profile.name} <${email ?? "unknown"}>`,
  });

  revalidatePath("/admin", "layout");
  redirect("/admin/users?deleted=1");
}

export { deleteUserActionInternal as deleteUserAction };

const USER_DETAIL_PATH = /^\/admin\/users\/[0-9a-f-]{36}$/;

async function setUserRoleActionInternal(formData: FormData) {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    redirect("/admin/users?error=csrf");
  }

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
      .set(role === "ADMIN" ? { role, status: "approved" } : { role })
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

export { setUserRoleActionInternal as setUserRoleAction };
async function setMemberStatusActionInternal(formData: FormData) {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    redirect("/admin/users?error=csrf");
  }

  const { profile: actor } = await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const back = String(formData.get("back") ?? "/admin/users");
  if (
    !UUID_PATTERN.test(userId) ||
    !["approved", "rejected", "pending"].includes(status)
  ) {
    redirect("/admin/users?error=bad_status");
  }
  if (back !== "/admin/users" && !USER_DETAIL_PATH.test(back)) {
    redirect("/admin/users");
  }

  const [target] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  if (!target) {
    redirect("/admin/users?error=not_found");
  }
  if (target.role === "ADMIN" && status !== "approved") {
    redirect("/admin/users?error=admin_status");
  }

  await db
    .update(profiles)
    .set({ status })
    .where(eq(profiles.userId, userId));

  await recordAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "user.update",
    targetType: "user",
    targetId: userId,
    detail: `${target.name}: membership → ${status}`,
  });

  revalidatePath("/admin/users");
  revalidatePath("/profile");
  redirect(back);
}

async function createTeamActionInternal(formData: FormData) {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    redirect("/admin/teams?error=csrf");
  }

  const { profile: actor } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 60) {
    redirect("/admin/teams?error=bad_name");
  }

  try {
    await db.insert(teams).values({ name });
  } catch {
    redirect("/admin/teams?error=duplicate");
  }

  await recordAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "team.create",
    targetType: "team",
    detail: `team created: ${name}`,
  });

  revalidatePath("/admin/teams");
  redirect("/admin/teams?created=1");
}

async function assignTeamActionInternal(formData: FormData) {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    redirect("/admin/teams?error=csrf");
  }

  const { profile: actor } = await requireAdmin();
  const profileId = String(formData.get("profileId") ?? "").trim();
  const teamId = String(formData.get("teamId") ?? "").trim();

  if (!UUID_PATTERN.test(profileId)) {
    redirect("/admin/teams?error=not_found");
  }
  const targetTeam =
    teamId === "" ? null : UUID_PATTERN.test(teamId) ? teamId : undefined;
  if (targetTeam === undefined) {
    redirect("/admin/teams?error=not_found");
  }

  const [target] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1);
  if (!target) {
    redirect("/admin/teams?error=not_found");
  }

  await db
    .update(profiles)
    .set({ teamId: targetTeam })
    .where(eq(profiles.id, profileId));

  await recordAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "team.assign",
    targetType: "team",
    detail: `${target.name}: team → ${targetTeam ?? "none"}`,
  });

  revalidatePath("/admin/teams");
  revalidatePath("/admin/users");
  redirect("/admin/teams?assigned=1");
}

export {
  setMemberStatusActionInternal as setMemberStatusAction,
  createTeamActionInternal as createTeamAction,
  assignTeamActionInternal as assignTeamAction,
};
