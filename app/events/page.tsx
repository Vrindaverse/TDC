import type { Metadata } from "next";
import { asc, desc, gt, lte } from "drizzle-orm";
import { cacheLife } from "next/cache";

import { EventCard } from "@/components/event-card";
import { SectionHeading } from "@/components/section-heading";
import { MutedBand, Section } from "@/components/section";
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

  return (
    <>
      <Section>
        <SectionHeading
          eyebrow="Events"
          title="Workshops, build sessions and hackathons"
          description="Everything here is student-run and open to all Technocrats students."
          size="page"
          level={1}
        />
      </Section>

      <MutedBand>
        <Section id="upcoming">
          <SectionHeading
            eyebrow="Upcoming Events"
            title="What's coming up"
            description={
              upcomingEvents.length > 0
                ? "Events are created by the TDC admin team. Details will be shared soon."
                : "No upcoming events yet. Check back soon for the next session."
            }
            className="mb-10"
          />
          {upcomingEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  showTime
                  showRegistration={true}
                  action={
                    canRegister &&
                    event.registrationStatus === "open" &&
                    new Date(`${event.date}T${event.time}`) > new Date()
                      ? {
                          label: "Register",
                          href: "#",
                          onClick: (e: React.MouseEvent) => {
                            e.preventDefault();
                            const form = document.createElement("form");
                            form.method = "POST";
                            form.action = "/api/events/register";
                            const input = document.createElement("input");
                            input.type = "hidden";
                            input.name = "eventId";
                            input.value = event.id;
                            form.appendChild(input);
                            document.body.appendChild(form);
                            form.submit();
                          },
                        }
                      : null
                  }
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border bg-card/60 px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                Nothing scheduled right now. The next event will appear here as
                soon as it&apos;s announced.
              </p>
            </div>
          )}
        </Section>
      </MutedBand>

      <Section id="past">
        <SectionHeading
          eyebrow="Past Events"
          title="What we've already run"
          description={
            pastEvents.length > 0
              ? "Events we've hosted so far. Looking for recaps? Reach out through the contact page."
              : "No past events yet."
          }
          className="mb-10"
        />
        {pastEvents.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} showTime past />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No past events yet.
          </p>
        )}
      </Section>
    </>
  );
}