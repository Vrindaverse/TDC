"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { recordAudit } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { validateCsrfToken } from "@/lib/csrf";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function safeBack(value: unknown): string {
  const back = String(value ?? "");
  return back.startsWith("/admin/messages") && !back.includes("://")
    ? back
    : "/admin/messages";
}

function withParam(path: string, key: string, value: string) {
  return `${path}${path.includes("?") ? "&" : "?"}${key}=${value}`;
}

async function setMessageStatusActionInternal(formData: FormData) {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    redirect(withParam(safeBack(formData.get("back")), "error", "csrf"));
  }

  const { profile } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const back = safeBack(formData.get("back"));

  if (!UUID_PATTERN.test(id) || (status !== "read" && status !== "unread")) {
    redirect(withParam(back, "error", "update"));
  }

  let outcome: "ok" | "not_found" | "failed" = "ok";
  let detail: string | null = null;
  try {
    const [existing] = await db
      .select({ id: contactMessages.id, subject: contactMessages.subject })
      .from(contactMessages)
      .where(eq(contactMessages.id, id))
      .limit(1);
    if (!existing) {
      outcome = "not_found";
    } else {
      const result = await db
        .update(contactMessages)
        .set(
          status === "read"
            ? { status: "read", readAt: new Date() }
            : { status: "new", readAt: null }
        )
        .where(eq(contactMessages.id, id))
        .returning({ id: contactMessages.id });

      if (result.length === 0) {
        outcome = "not_found";
      } else {
        detail = `${existing.subject} → ${status}`;
      }
    }
  } catch (err) {
    console.error("[admin/messages] status change failed:", err);
    outcome = "failed";
  }

  if (outcome === "not_found") redirect(withParam(back, "error", "not_found"));
  if (outcome === "failed") redirect(withParam(back, "error", "update"));

  await recordAudit({
    actorId: profile.id,
    actorName: profile.name,
    action: status === "read" ? "message.read" : "message.unread",
    targetType: "message",
    targetId: id,
    detail,
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/messages");
  redirect(back);
}

export { setMessageStatusActionInternal as setMessageStatusAction };

async function deleteMessageActionInternal(formData: FormData) {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    redirect(withParam(safeBack(formData.get("back")), "error", "csrf"));
  }

  const { profile } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const back = safeBack(formData.get("back"));

  if (!UUID_PATTERN.test(id)) {
    redirect(withParam(back, "error", "not_found"));
  }

  let outcome: "ok" | "not_found" | "failed" = "ok";
  let detail: string | null = null;
  try {
    const [existing] = await db
      .select({ id: contactMessages.id, subject: contactMessages.subject })
      .from(contactMessages)
      .where(eq(contactMessages.id, id))
      .limit(1);
    if (!existing) {
      outcome = "not_found";
    } else {
      const result = await db
        .delete(contactMessages)
        .where(eq(contactMessages.id, id))
        .returning({ id: contactMessages.id });

      if (result.length === 0) {
        outcome = "not_found";
      } else {
        detail = existing.subject;
      }
    }
  } catch (err) {
    console.error("[admin/messages] delete failed:", err);
    outcome = "failed";
  }

  if (outcome === "not_found") redirect(withParam(back, "error", "not_found"));
  if (outcome === "failed") redirect(withParam(back, "error", "delete"));

  await recordAudit({
    actorId: profile.id,
    actorName: profile.name,
    action: "message.delete",
    targetType: "message",
    targetId: id,
    detail,
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/messages");
  redirect(withParam(back, "deleted", "1"));
}

export { deleteMessageActionInternal as deleteMessageAction };
