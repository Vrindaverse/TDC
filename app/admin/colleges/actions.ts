"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { recordAudit } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/auth/guards";
import { db, sql } from "@/lib/db";
import { colleges } from "@/lib/db/schema";
import { collegeSchema } from "@/lib/validation/colleges";
import { fieldErrorsFromZod, type FieldErrors } from "@/lib/validation/auth";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type CollegeFormState = {
  error?: string;
  fieldErrors?: FieldErrors;
} | null;

function parseForm(formData: FormData) {
  return collegeSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
  });
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "23505"
  );
}

export async function createCollegeAction(
  _prev: CollegeFormState,
  formData: FormData
): Promise<CollegeFormState> {
  const { profile } = await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  let collegeId: string;
  try {
    const [inserted] = await db
      .insert(colleges)
      .values(parsed.data)
      .returning({ id: colleges.id });
    collegeId = inserted.id;
  } catch (err) {
    if (isUniqueViolation(err)) {
      return {
        fieldErrors: { code: "A college with that code already exists." },
      };
    }
    console.error("[admin/colleges] create failed:", err);
    return { error: "We couldn't save the college. Please try again." };
  }

  await recordAudit({
    actorId: profile.id,
    actorName: profile.name,
    action: "college.create",
    targetType: "college",
    targetId: collegeId,
    detail: `${parsed.data.name} (${parsed.data.code})`,
  });

  revalidatePath("/admin/colleges");
  revalidatePath("/admin/users");
  redirect("/admin/colleges?created=1");
}

export async function updateCollegeAction(
  _prev: CollegeFormState,
  formData: FormData
): Promise<CollegeFormState> {
  const { profile } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) {
    return { error: "That college no longer exists." };
  }

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  try {
    const existing = await db
      .select({ id: colleges.id, name: colleges.name, code: colleges.code })
      .from(colleges)
      .where(eq(colleges.id, id))
      .limit(1);
    if (existing.length === 0) {
      return { error: "That college no longer exists." };
    }

    await db.update(colleges).set(parsed.data).where(eq(colleges.id, id));

    const changes: string[] = [];
    if (existing[0].name !== parsed.data.name) {
      changes.push(`name "${existing[0].name}" → "${parsed.data.name}"`);
    }
    if (existing[0].code !== parsed.data.code) {
      changes.push(`code "${existing[0].code}" → "${parsed.data.code}"`);
    }

    if (changes.length) {
      await recordAudit({
        actorId: profile.id,
        actorName: profile.name,
        action: "college.update",
        targetType: "college",
        targetId: id,
        detail: changes.join(", "),
      });
    }
  } catch (err) {
    if (isUniqueViolation(err)) {
      return {
        fieldErrors: { code: "A college with that code already exists." },
      };
    }
    console.error("[admin/colleges] update failed:", err);
    return { error: "We couldn't save the college. Please try again." };
  }

  revalidatePath("/admin/colleges");
  revalidatePath("/admin/users");
  redirect("/admin/colleges?updated=1");
}

export async function toggleCollegeAction(formData: FormData) {
  const { profile } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const value = formData.get("value") === "true";
  if (!UUID_PATTERN.test(id)) {
    redirect("/admin/colleges?error=not_found");
  }

  let outcome: "ok" | "not_found" | "failed" = "ok";
  try {
    const [existing] = await db
      .select({ id: colleges.id, name: colleges.name, isActive: colleges.isActive })
      .from(colleges)
      .where(eq(colleges.id, id))
      .limit(1);
    if (!existing) {
      outcome = "not_found";
    } else if (existing.isActive !== value) {
      await db
        .update(colleges)
        .set({ isActive: value })
        .where(eq(colleges.id, id));

      await recordAudit({
        actorId: profile.id,
        actorName: profile.name,
        action: "college.toggle",
        targetType: "college",
        targetId: id,
        detail: `${existing.name} set to ${value ? "active" : "inactive"}`,
      });
    }
  } catch (err) {
    console.error("[admin/colleges] toggle failed:", err);
    outcome = "failed";
  }

  if (outcome === "not_found") redirect("/admin/colleges?error=not_found");
  if (outcome === "failed") redirect("/admin/colleges?error=update");

  revalidatePath("/admin/colleges");
  revalidatePath("/admin/users");
  redirect("/admin/colleges?toggled=1");
}

export async function deleteCollegeAction(formData: FormData) {
  const { profile } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) {
    redirect("/admin/colleges?error=not_found");
  }

  let outcome: "ok" | "not_found" | "in_use" | "failed" = "ok";
  try {
    const [existing] = await db
      .select({
        id: colleges.id,
        name: colleges.name,
        code: colleges.code,
      })
      .from(colleges)
      .where(eq(colleges.id, id))
      .limit(1);
    if (!existing) {
      outcome = "not_found";
    } else {
      const [countRow] = await sql`
        select count(*)::int as n from public.profiles where college_id = ${id}
      `;
      if (Number(countRow?.n ?? 0) > 0) {
        outcome = "in_use";
      } else {
        await db.delete(colleges).where(eq(colleges.id, id));
        await recordAudit({
          actorId: profile.id,
          actorName: profile.name,
          action: "college.delete",
          targetType: "college",
          targetId: id,
          detail: `${existing.name} (${existing.code})`,
        });
      }
    }
  } catch (err) {
    console.error("[admin/colleges] delete failed:", err);
    outcome = "failed";
  }

  if (outcome === "not_found") redirect("/admin/colleges?error=not_found");
  if (outcome === "in_use") redirect("/admin/colleges?error=in_use");
  if (outcome === "failed") redirect("/admin/colleges?error=delete");

  revalidatePath("/admin/colleges");
  revalidatePath("/admin/users");
  redirect("/admin/colleges?deleted=1");
}
