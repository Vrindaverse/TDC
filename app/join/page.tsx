import type { Metadata } from "next";
import { and, asc, gt, inArray } from "drizzle-orm";
import { CalendarDays, CheckCircle2, TriangleAlert } from "lucide-react";

import {
  GuestRegistrationForm,
  MemberRegistrationForm,
  type EventOption,
} from "@/components/join/registration-form";
import { RegistrationSuccessDialog } from "@/components/registration-success-dialog";
import { SectionHeading } from "@/components/section-heading";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getJoinVerifiedEmail,
  getProfile,
  getSession,
} from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Join us",
  description:
    "Register for an upcoming Technocrats Developer Community event.",
};

export const instant = false;

function formatEventDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

const REGISTRATION_STATUS_LABELS: Record<string, string> = {
  open: "Registration open",
  closing: "Closing soon",
};

const JOIN_ERROR_MESSAGES: Record<string, string> = {
  details:
    "Please fill in your name, email, mobile and enrollment numbers to register.",
  verify:
    "Please verify your email before registering. Request a code below and enter it to confirm.",
  semester: "Please choose your current semester.",
  closed:
    "Registration for that event just closed. Pick another upcoming event below.",
};

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{
    registered?: string;
    event?: string;
    error?: string;
  }>;
}) {
  const { registered, event: eventParam, error } = await searchParams;
  const session = await getSession();
  const profile = session?.user ? await getProfile(session.user.id) : null;
  const verifiedEmail = await getJoinVerifiedEmail();

  const openEvents = await db
    .select({
      id: events.id,
      title: events.title,
      location: events.location,
      startsAt: events.startsAt,
      registrationStatus: events.registrationStatus,
    })
    .from(events)
    .where(
      and(
        gt(events.startsAt, new Date()),
        inArray(events.registrationStatus, ["open", "closing"])
      )
    )
    .orderBy(asc(events.startsAt));

  const preselect =
    eventParam && openEvents.some((event) => event.id === eventParam)
      ? eventParam
      : openEvents[0]?.id ?? "";

  const eventOptions: EventOption[] = openEvents.map((event) => ({
    id: event.id,
    label: `${event.title} · ${formatEventDate(event.startsAt)}${
      event.location ? ` · ${event.location}` : ""
    } · ${
      REGISTRATION_STATUS_LABELS[event.registrationStatus] ??
      event.registrationStatus
    }`,
  }));

  return (
    <>
      {registered ? (
        <RegistrationSuccessDialog message="See you there — we&apos;ll email the details before the session." />
      ) : null}

      <Section>
        <SectionHeading
          eyebrow="Join us"
          title="Register for an event"
          description="Pick an upcoming session and we'll see you there. Registration is open to all Technocrats students."
          size="page"
          level={1}
        />
      </Section>

      <Section className="pb-16">
        <div className="mx-auto w-full max-w-2xl">
          {error ? (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-destructive"
              />
              <p>
                {JOIN_ERROR_MESSAGES[error] ??
                  "Something went wrong while registering. Please try again."}
              </p>
            </div>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>
                {profile ? `Hi ${profile.name.split(" ")[0]}` : "Join us"}
              </CardTitle>
              <CardDescription>
                {profile
                  ? "Choose an event below to register."
                  : "No account needed — just your details and email verification."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {registered ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2
                      aria-hidden="true"
                      className="size-7 text-primary"
                    />
                  </span>
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">Registration complete</p>
                    <p className="text-sm text-muted-foreground">
                      See you there — we&apos;ll email the details before the
                      session. Spots are confirmed for your email address.
                    </p>
                  </div>
                  <Button
                    asChild
                    size="lg"
                    className="tdc-mono mt-1 w-full cursor-target"
                  >
                    <a href="/join">Register for another event</a>
                  </Button>
                </div>
              ) : openEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No events are open for registration right now. Check back
                  soon.
                </p>
              ) : profile ? (
                <MemberRegistrationForm
                  events={eventOptions}
                  preselect={preselect}
                  name={profile.name}
                  email={session?.user.email ?? ""}
                />
              ) : (
                <GuestRegistrationForm
                  events={eventOptions}
                  preselect={preselect}
                  verifiedEmail={verifiedEmail}
                />
              )}
            </CardContent>
          </Card>

          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <CalendarDays aria-hidden="true" className="size-3.5" />
            Spots are first-come, first-served for each session.
          </p>
        </div>
      </Section>
    </>
  );
}