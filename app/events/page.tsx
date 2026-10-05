import type { Metadata } from "next";
import { EventCard } from "@/components/event-card";
import { SectionHeading } from "@/components/section-heading";
import { MutedBand, Section } from "@/components/section";
import { upcomingEvents, pastEvents } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Workshops, build sessions, hackathons and talks run by the Technocrats Developer Community.",
};

export default function EventsPage() {
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
            description="TDC Season 3 is on the way. More details will be shared soon."
            className="mb-10"
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showTime
              />
            ))}
          </div>
        </Section>
      </MutedBand>

      <Section id="past">
        <SectionHeading
          eyebrow="Past Events"
          title="What we've already run"
          description="Two successful seasons that set the foundation for what's next."
          className="mb-10"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pastEvents.map((event) => (
            <EventCard key={event.id} event={event} showTime past />
          ))}
        </div>
      </Section>
    </>
  );
}
