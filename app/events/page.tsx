import type { Metadata } from "next";
import Link from "next/link";
import { asc, desc, gt, lte } from "drizzle-orm";
import { cacheLife } from "next/cache";
import { ArrowRight } from "lucide-react";

import { EventCard } from "@/components/event-card";
import { MutedBand, Section } from "@/components/section";
import { TerminalPanel } from "@/components/terminal-panel";
import { Button } from "@/components/ui/button";
import { getSession, getProfile } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { dbEventToItem } from "@/lib/events";
import { registerForEventAction } from "@/app/events/actions";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Workshops, build sessions, hackathons and talks run by the Technocrats Developer Community.",
};

export const instant = false;

async function getEventsData() {
  "use cache";
  cacheLife("minutes");

  const now = new Date();

  const [upcomingRows, pastRows] = await Promise.all([
    db
      .select()
      .from(events)
      .where(gt(events.startsAt, now))
      .orderBy(asc(events.startsAt))
      .limit(24),
    db
      .select()
      .from(events)
      .where(lte(events.startsAt, now))
      .orderBy(desc(events.startsAt))
      .limit(24),
  ]);

  return {
    upcoming: upcomingRows.map(dbEventToItem),
    past: pastRows.map(dbEventToItem),
  };
}

export default async function EventsPage() {
  const session = await getSession();
  const profile = session?.user ? await getProfile(session.user.id) : null;
  const { upcoming: upcomingEvents, past: pastEvents } = await getEventsData();

  const canRegister = profile !== null;
  const tracks = new Set(
    [...upcomingEvents, ...pastEvents].map((event) => event.domain)
  ).size;

  return (
    <>
      {/* Header terminal */}
      <Section className="tdc-reveal">
        <TerminalPanel
          title="tdc@technocrats — ~/events"
          badge={`${upcomingEvents.length} scheduled`}
          scanlines
        >
          <p className="tdc-mono truncate text-xs text-muted-foreground">
            <span aria-hidden="true" className="text-primary">
              $
            </span>{" "}
            tdc events --help
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Workshops, build sessions and hackathons
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Everything here is student-run and open to all Technocrats students.
            Pick a session, show up, and leave with something working.
          </p>

          <dl className="tdc-mono mt-8 flex flex-wrap gap-x-8 gap-y-4 border-t pt-6 text-xs">
            <Stat label="upcoming" value={upcomingEvents.length} />
            <Stat label="archived" value={pastEvents.length} />
            <Stat label="tracks" value={tracks} />
          </dl>

          <div className="tdc-mono mt-6 flex flex-wrap items-center gap-2 text-xs">
            <a
              href="#upcoming"
              className="rounded-md border bg-primary/5 px-2.5 py-1 text-foreground transition-colors hover:bg-primary/10"
            >
              [ --upcoming ]
            </a>
            <a
              href="#past"
              className="rounded-md border px-2.5 py-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              [ --past ]
            </a>
            {!canRegister ? (
              <Button asChild size="xs" className="ml-auto">
                <Link href="/join">
                  join to register
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            ) : null}
          </div>
        </TerminalPanel>
      </Section>

      {/* Upcoming */}
      <MutedBand>
        <Section id="upcoming">
          <TerminalPanel
            title="~/tdc/events --upcoming"
            badge={upcomingEvents.length > 0 ? "live" : "idle"}
          >
            <p className="tdc-mono mb-6 flex items-center gap-2 text-xs text-muted-foreground">
              <span aria-hidden="true" className="text-primary">
                $
              </span>
              tdc events --list --upcoming
              <span aria-hidden="true" className="tdc-caret text-primary" />
            </p>

            {upcomingEvents.length > 0 ? (
              <div className="tdc-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    showTime
                    showRegistration
                    formAction={
                      canRegister &&
                      (event.registrationStatus === "open" ||
                        event.registrationStatus === "closing") &&
                      new Date(event.startsAt) > new Date()
                        ? registerForEventAction
                        : undefined
                    }
                    action={
                      !canRegister
                        ? { label: "Register your details", href: "/join" }
                        : null
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                command="tdc events --list --upcoming"
                message="no upcoming events. the next session appears here the moment it's announced."
              />
            )}
          </TerminalPanel>
        </Section>
      </MutedBand>

      {/* Past */}
      <Section id="past" className="tdc-reveal">
        <TerminalPanel
          title="~/tdc/events --past"
          badge={pastEvents.length > 0 ? "archived" : "empty"}
        >
          <p className="tdc-mono mb-6 flex items-center gap-2 text-xs text-muted-foreground">
            <span aria-hidden="true" className="text-primary">
              $
            </span>
            tdc events --list --archived
            <span aria-hidden="true" className="tdc-caret text-primary" />
          </p>

          {pastEvents.length > 0 ? (
            <div className="tdc-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} showTime past />
              ))}
            </div>
          ) : (
            <EmptyState
              command="tdc events --list --archived"
              message="no archived events yet. this timeline fills up as sessions wrap."
            />
          )}
        </TerminalPanel>
      </Section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold text-foreground">
        {String(value).padStart(2, "0")}
      </dd>
    </div>
  );
}

function EmptyState({ command, message }: { command: string; message: string }) {
  return (
    <div className="tdc-mono rounded-md border border-dashed bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
      <p>
        <span aria-hidden="true" className="text-primary">
          $
        </span>{" "}
        {command}
      </p>
      <p className="mt-2">
        {message}
        <span aria-hidden="true" className="tdc-caret" />
      </p>
    </div>
  );
}
