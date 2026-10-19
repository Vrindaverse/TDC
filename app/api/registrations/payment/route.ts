import { and, eq, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import {
  clearJoinShadowCookie,
  getJoinVerifiedEmail,
  getProfile,
  getSession,
} from "@/lib/auth/guards";
import {
  MAX_PAYMENT_SCREENSHOT_BYTES,
  extensionForMime,
  putPaymentScreenshotObject,
} from "@/lib/avatar";
import { db } from "@/lib/db";
import { events, registrations } from "@/lib/db/schema";
import { fieldErrorsFromZod } from "@/lib/validation/auth";
import { joinSchema, joinSemesterSchema } from "@/lib/validation/join";

export const maxDuration = 30;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function uploadScreenshot(file: File, ext: "png" | "jpg" | "webp" | "gif" | "avif") {
  try {
    const key = await putPaymentScreenshotObject(
      ext,
      new Uint8Array(await file.arrayBuffer()),
      file.type
    );
    return { key, error: null as string | null };
  } catch (err) {
    if (err instanceof Error && err.message.includes("magic bytes")) {
      return {
        key: null,
        error:
          "The file content does not match its type. Please upload a valid image.",
      };
    }
    console.error("[registrations/payment] screenshot upload failed:", err);
    return { key: null, error: "The upload failed. Please try again." };
  }
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("screenshot");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Please attach your payment screenshot." },
      { status: 400 }
    );
  }

  const ext = extensionForMime(file.type);
  if (!ext) {
    return NextResponse.json(
      {
        error:
          "Unsupported image type. Use a PNG, JPG, WebP, GIF, or AVIF file.",
      },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { error: "The screenshot appears to be empty." },
      { status: 400 }
    );
  }

  if (file.size > MAX_PAYMENT_SCREENSHOT_BYTES) {
    return NextResponse.json(
      { error: "The screenshot must be smaller than 5 MB." },
      { status: 400 }
    );
  }

  const eventId = String(form.get("eventId") ?? "").trim();
  if (!UUID_PATTERN.test(eventId)) {
    return NextResponse.json({ error: "Invalid event." }, { status: 400 });
  }

  const [event] = await db
    .select({
      id: events.id,
      fee: events.fee,
      registrationStatus: events.registrationStatus,
      startsAt: events.startsAt,
    })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  if (!event) {
    return NextResponse.json(
      { error: "That event is no longer available." },
      { status: 404 }
    );
  }
  if (event.registrationStatus === "closed") {
    return NextResponse.json(
      { error: "Registration for that event just closed." },
      { status: 409 }
    );
  }
  if (event.startsAt < new Date()) {
    return NextResponse.json(
      { error: "That event has already started." },
      { status: 409 }
    );
  }
  if ((event.fee ?? 0) <= 0) {
    return NextResponse.json(
      { error: "This event is free — no payment is needed." },
      { status: 409 }
    );
  }

  const parsedSemester = joinSemesterSchema.safeParse(form.get("semester"));
  if (!parsedSemester.success) {
    return NextResponse.json(
      { error: "Please choose your current semester." },
      { status: 400 }
    );
  }
  const semester = parsedSemester.data;

  const session = await getSession();
  const profile = session?.user ? await getProfile(session.user.id) : null;

  let values: typeof registrations.$inferInsert;

  if (profile) {
    const [existing] = await db
      .select({ id: registrations.id })
      .from(registrations)
      .where(
        and(
          eq(registrations.eventId, event.id),
          eq(registrations.profileId, profile.id)
        )
      )
      .limit(1);
    if (existing) {
      return NextResponse.json(
        { error: "You're already registered for this event." },
        { status: 409 }
      );
    }

    values = {
      profileId: profile.id,
      eventId: event.id,
      name: profile.name,
      email: session!.user.email?.toLowerCase() ?? null,
      mobile: profile.mobile,
      enrollmentNumber: profile.enrollmentNumber,
      semester,
      paymentStatus: "paid",
    };
  } else {
    const parsed = joinSchema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      mobile: form.get("mobile"),
      enrollmentNumber: form.get("enrollmentNumber"),
      semester: form.get("semester"),
    });
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Please fill in your name, email, mobile and enrollment number.",
          fieldErrors: fieldErrorsFromZod(parsed.error),
        },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const email = input.email.toLowerCase();

    const verifiedEmail = await getJoinVerifiedEmail();
    if (!verifiedEmail || verifiedEmail !== email) {
      return NextResponse.json(
        {
          error:
            "Email verification expired. Request a new code and verify again.",
        },
        { status: 401 }
      );
    }

    const [duplicate] = await db
      .select({ id: registrations.id })
      .from(registrations)
      .where(
        and(
          eq(registrations.eventId, event.id),
          or(
            sql`lower(${registrations.email}) = ${email}`,
            eq(registrations.mobile, input.mobile),
            eq(registrations.enrollmentNumber, input.enrollmentNumber)
          )
        )
      )
      .limit(1);
    if (duplicate) {
      return NextResponse.json(
        { error: "You're already registered for this event." },
        { status: 409 }
      );
    }

    values = {
      eventId: event.id,
      name: input.name,
      email,
      mobile: input.mobile,
      enrollmentNumber: input.enrollmentNumber,
      semester: input.semester,
      paymentStatus: "paid",
    };
  }

  const upload = await uploadScreenshot(file, ext);
  if (!upload.key) {
    return NextResponse.json(
      { error: upload.error ?? "The upload failed. Please try again." },
      { status: 400 }
    );
  }

  try {
    const insert = db.insert(registrations).values({
      ...values,
      paymentScreenshotKey: upload.key,
    });

    // Member: conflict on the (profile_id, event_id) unique index.
    // Guest: bare do-nothing — for a profileId-less row the only unique
    // constraint that can fire is the partial guest (event_id, lower(email))
    // index, and expression targets aren't supported by onConflictDoNothing.
    const inserted = profile
      ? await insert.onConflictDoNothing({
          target: [registrations.profileId, registrations.eventId],
        })
      : await insert.onConflictDoNothing();

    if (inserted.rowCount === 0) {
      return NextResponse.json(
        { error: "You're already registered for this event." },
        { status: 409 }
      );
    }

    if (!profile) {
      try {
        await clearJoinShadowCookie();
      } catch {
        // Non-fatal: the shadow user is already gone after OTP verification.
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[registrations/payment] failed:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
