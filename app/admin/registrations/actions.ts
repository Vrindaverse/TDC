"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { recordAudit } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { registrations } from "@/lib/db/schema";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function withParam(path: string, key: string, value: string) {
  return `${path}${path.includes("?") ? "&" : "?"}${key}=${value}`;
}

export async function deleteRegistrationAction(formData: FormData) {
  const { profile } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const back = String(formData.get("back") ?? "");
  const safeBack =
    back.startsWith("/admin/registrations") && !back.includes("://")
      ? back
      : "/admin/registrations";

  if (!UUID_PATTERN.test(id)) {
    redirect(withParam(safeBack, "error", "not_found"));
  }

  let outcome: "ok" | "not_found" | "failed" = "ok";
  let detail: string | null = null;
  try {
    const [existing] = await db
      .select({
        id: registrations.id,
        email: registrations.email,
        name: registrations.name,
      })
      .from(registrations)
      .where(eq(registrations.id, id))
      .limit(1);
    if (!existing) {
      outcome = "not_found";
    } else {
      await db.delete(registrations).where(eq(registrations.id, id));
      detail = existing.email ?? existing.name ?? id;
    }
  } catch (err) {
    console.error("[admin/registrations] delete failed:", err);
    outcome = "failed";
  }

  if (outcome === "not_found") {
    redirect(withParam(safeBack, "error", "not_found"));
  }
  if (outcome === "failed") {
    redirect(withParam(safeBack, "error", "delete"));
  }

  await recordAudit({
    actorId: profile.id,
    actorName: profile.name,
    action: "registration.delete",
    targetType: "registration",
    targetId: id,
    detail,
  });

  revalidatePath("/admin/registrations");
  revalidatePath("/admin/events");
  redirect(withParam(safeBack, "deleted", "1"));
}
