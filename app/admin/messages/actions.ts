"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";

export async function markMessageReadAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    await db
      .update(contactMessages)
      .set({
        status: "read",
        readAt: new Date(),
      })
      .where(eq(contactMessages.id, id));
  } catch (err) {
    console.error("[admin/messages] mark read failed:", err);
  }

  redirect("/admin/messages");
}

export async function deleteMessageAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
  } catch (err) {
    console.error("[admin/messages] delete failed:", err);
  }

  redirect("/admin/messages");
}