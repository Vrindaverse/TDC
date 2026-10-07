"use server";

import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eventSchema } from "@/lib/validation/events";
import { fieldErrorsFromZod, type FieldErrors } from "@/lib/validation/auth";

export type EventFormState = {
  error?: string;
  fieldErrors?: FieldErrors;
} | null;

function parseForm(formData: FormData) {
  return eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    location: formData.get("location") ?? "",
    poster: formData.get("poster") ?? "",
    domain: formData.get("domain"),
    registrationStatus: formData.get("registrationStatus"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt") ?? "",
  });
}

export async function createEventAction(
  _prev: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  try {
    await db.insert(events).values(parsed.data);
  } catch (err) {
    console.error("[admin/events] create failed:", err);
    return { error: "We couldn't save the event. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/events");
  redirect("/admin/events");
}

export async function updateEventAction(
  _prev: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  try {
    const existing = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.id, id))
      .limit(1);
    if (existing.length === 0) {
      notFound();
    }

    await db.update(events).set(parsed.data).where(eq(events.id, id));
  } catch (err) {
    if (isNextNotFound(err)) throw err;
    console.error("[admin/events] update failed:", err);
    return { error: "We couldn't save the event. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/events");
  redirect("/admin/events");
}

export async function deleteEventAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");

  try {
    await db.delete(events).where(eq(events.id, id));
  } catch (err) {
    console.error("[admin/events] delete failed:", err);
    redirect("/admin/events?error=delete");
  }

  revalidatePath("/");
  revalidatePath("/events");
  redirect("/admin/events");
}

function isNextError(error: unknown, digest: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith(digest)
  );
}

function isNextNotFound(error: unknown): boolean {
  return isNextError(error, "NEXT_HTTP_ERROR_FALLBACK");
}
