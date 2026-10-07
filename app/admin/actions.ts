"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { deleteAvatarObject } from "@/lib/avatar";
import { requireAdmin } from "@/lib/auth/guards";
import { db, sql } from "@/lib/db";
import { profiles } from "@/lib/db/schema";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function deleteUserAction(formData: FormData) {
  const { session } = await requireAdmin();

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

  await sql`delete from neon_auth."user" where id = ${userId}`;
  await db.delete(profiles).where(eq(profiles.userId, userId));

  revalidatePath("/admin", "layout");
  redirect("/admin/users?deleted=1");
}