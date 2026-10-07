"use server";

import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { recordAudit } from "@/lib/admin/audit";
import { deletePosterObject, isUploadedPoster } from "@/lib/avatar";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eventSchema } from "@/lib/validation/events";
import { fieldErrorsFromZod, type FieldErrors } from "@/lib/validation/auth";
import { validateCsrfToken } from "@/lib/csrf";

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

async function createEventActionInternal(
  _prev: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    return { error: "Invalid request. Please refresh and try again." };
  }

  const { profile } = await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  let eventId: string;
  try {
    const [inserted] = await db
      .insert(events)
      .values(parsed.data)
      .returning({ id: events.id });
    eventId = inserted.id;
  } catch (err) {
    console.error("[admin/events] create failed:", err);
    return { error: "We couldn't save the event. Please try again." };
  }

  await recordAudit({
    actorId: profile.id,
    actorName: profile.name,
    action: "event.create",
    targetType: "event",
    targetId: eventId,
    detail: parsed.data.title,
  });

  revalidatePath("/");
  revalidatePath("/events");
  redirect("/admin/events");
}

export { createEventActionInternal as createEventAction };

async function updateEventActionInternal(
  _prev: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    return { error: "Invalid request. Please refresh and try again." };
  }

  const { profile } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  let replacedPoster: string | null = null;
  try {
    const existing = await db
      .select({ id: events.id, title: events.title, poster: events.poster })
      .from(events)
      .where(eq(events.id, id))
      .limit(1);
    if (existing.length === 0) {
      notFound();
    }

    const result = await db
      .update(events)
      .set(parsed.data)
      .where(eq(events.id, id))
      .returning({ id: events.id });
    
    if (result.length === 0) {
      notFound();
    }

    const previousPoster = existing[0].poster;
    if (
      previousPoster &&
      previousPoster !== parsed.data.poster &&
      isUploadedPoster(previousPoster)
    ) {
      replacedPoster = previousPoster;
    }

    await recordAudit({
      actorId: profile.id,
      actorName: profile.name,
      action: "event.update",
      targetType: "event",
      targetId: id,
      detail:
        existing[0].title === parsed.data.title
          ? parsed.data.title
          : `"${existing[0].title}" → "${parsed.data.title}"`,
    });
  } catch (err) {
    if (isNextNotFound(err)) throw err;
    console.error("[admin/events] update failed:", err);
    return { error: "We couldn't save the event. Please try again." };
  }

  if (replacedPoster) {
    try {
      await deletePosterObject(replacedPoster);
    } catch (err) {
      console.error("[admin/events] old poster cleanup failed:", err);
    }
  }

  revalidatePath("/");
  revalidatePath("/events");
  redirect("/admin/events");
}

export { updateEventActionInternal as updateEventAction };

async function deleteEventActionInternal(formData: FormData) {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    redirect("/admin/events?error=csrf");
  }

  const { profile } = await requireAdmin();

  const id = String(formData.get("id") ?? "");

  let outcome: "ok" | "failed" = "ok";
  let detail: string | null = null;
  let uploadedPoster: string | null = null;
  try {
    const [existing] = await db
      .select({ id: events.id, title: events.title, poster: events.poster })
      .from(events)
      .where(eq(events.id, id))
      .limit(1);
    if (existing) {
      detail = existing.title;
      if (isUploadedPoster(existing.poster)) {
        uploadedPoster = existing.poster;
      }
      await db.delete(events).where(eq(events.id, id));
    }
  } catch (err) {
    console.error("[admin/events] delete failed:", err);
    outcome = "failed";
  }

  if (outcome === "failed") redirect("/admin/events?error=delete");

  if (uploadedPoster) {
    try {
      await deletePosterObject(uploadedPoster);
    } catch (err) {
      console.error("[admin/events] poster cleanup failed:", err);
    }
  }

  await recordAudit({
    actorId: profile.id,
    actorName: profile.name,
    action: "event.delete",
    targetType: "event",
    targetId: id,
    detail,
  });

  revalidatePath("/");
  revalidatePath("/events");
  redirect("/admin/events");
}

export { deleteEventActionInternal as deleteEventAction };

async function setEventRegistrationStatusActionInternal(formData: FormData) {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    redirect("/admin/events?error=csrf");
  }

  const { profile } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const registrationStatus = String(formData.get("registrationStatus") ?? "");

  if (!["open", "closing", "closed"].includes(registrationStatus)) {
    redirect("/admin/events?error=status");
  }

  let outcome: "ok" | "not_found" | "failed" = "ok";
  let detail: string | null = null;
  try {
    const [existing] = await db
      .select({ id: events.id, title: events.title, status: events.registrationStatus })
      .from(events)
      .where(eq(events.id, id))
      .limit(1);
    if (!existing) {
      outcome = "not_found";
    } else if (existing.status !== registrationStatus) {
      const result = await db
        .update(events)
        .set({ registrationStatus: registrationStatus as "open" | "closing" | "closed" })
        .where(eq(events.id, id))
        .returning({ id: events.id });
      
      if (result.length === 0) {
        outcome = "not_found";
      } else {
        detail = `${existing.title}: ${existing.status} → ${registrationStatus}`;
      }
    }
  } catch (err) {
    console.error("[admin/events] status toggle failed:", err);
    outcome = "failed";
  }

  if (outcome === "not_found") redirect("/admin/events?error=not_found");
  if (outcome === "failed") redirect("/admin/events?error=status");

  if (detail) {
    await recordAudit({
      actorId: profile.id,
      actorName: profile.name,
      action: "event.status",
      targetType: "event",
      targetId: id,
      detail,
    });
  }

  revalidatePath("/");
  revalidatePath("/events");
  redirect("/admin/events");
}

export { setEventRegistrationStatusActionInternal as setEventRegistrationStatusAction };

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
