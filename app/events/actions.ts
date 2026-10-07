"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireProfile } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { events, registrations, profiles } from "@/lib/db/schema";
import { validateCsrfToken } from "@/lib/csrf";
import { logger } from "@/lib/logger";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type RegisterEventState = {
  success?: boolean;
  error?: string;
} | null;

async function registerForEventActionInternal(
  _prev: RegisterEventState,
  formData: FormData
): Promise<RegisterEventState> {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    return { error: "Invalid request. Please refresh and try again." };
  }

  const { profile } = await requireProfile();

  const eventId = String(formData.get("eventId") ?? "").trim();
  if (!UUID_PATTERN.test(eventId)) {
    return { error: "Invalid event." };
  }

  try {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return { error: "Event not found." };
    }

    if (event.registrationStatus === "closed") {
      return { error: "Registration is closed for this event." };
    }

    const now = new Date();
    if (event.startsAt < now) {
      return { error: "This event has already started." };
    }

    const [existing] = await db
      .select()
      .from(registrations)
      .where(and(eq(registrations.profileId, profile.id), eq(registrations.eventId, eventId)))
      .limit(1);

    if (existing) {
      return { error: "You're already registered for this event." };
    }

    await db.insert(registrations).values({
      profileId: profile.id,
      eventId,
      name: profile.name,
      email: null,
      mobile: profile.mobile,
      enrollmentNumber: profile.enrollmentNumber,
      semester: null,
    });

    logger.info("Event registration", { 
      action: "register", 
      eventId, 
      profileId: profile.id 
    });

    revalidatePath("/events");
    revalidatePath("/profile");
  } catch (err) {
    logger.error("Event registration failed", { 
      action: "register", 
      eventId, 
      profileId: profile.id,
      error: String(err) 
    });
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/profile?registered=1");
}

export { registerForEventActionInternal as registerForEventAction };

async function cancelRegistrationActionInternal(formData: FormData) {
  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");
  if (!valid) {
    redirect("/profile?error=csrf");
  }

  const { profile } = await requireProfile();

  const registrationId = String(formData.get("registrationId") ?? "").trim();
  if (!UUID_PATTERN.test(registrationId)) {
    redirect("/profile?error=invalid_registration");
  }

  try {
    const [registration] = await db
      .select({ eventId: registrations.eventId })
      .from(registrations)
      .where(and(eq(registrations.id, registrationId), eq(registrations.profileId, profile.id)))
      .limit(1);

    if (!registration) {
      redirect("/profile?error=not_found");
    }

    const [event] = await db
      .select({ startsAt: events.startsAt })
      .from(events)
      .where(eq(events.id, registration.eventId))
      .limit(1);

    if (event && event.startsAt < new Date()) {
      redirect("/profile?error=event_started");
    }

    await db.delete(registrations).where(eq(registrations.id, registrationId));

    logger.info("Registration cancelled", { 
      action: "cancel", 
      registrationId, 
      profileId: profile.id 
    });

    revalidatePath("/profile");
    revalidatePath("/events");
  } catch (err) {
    logger.error("Cancel registration failed", { 
      action: "cancel", 
      registrationId, 
      profileId: profile.id,
      error: String(err) 
    });
  }

  redirect("/profile?cancelled=1");
}

export { cancelRegistrationActionInternal as cancelRegistrationAction };