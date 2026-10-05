import type { Metadata } from "next";
import { Eye, Target } from "lucide-react";

import { DomainCard } from "@/components/domain-card";
import { SectionHeading } from "@/components/section-heading";
import { MutedBand, Section } from "@/components/section";
import { StatList } from "@/components/stat-card";
import { communityStats, communityValues, domains, team } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "About",
  description:
    "Purpose, mission, vision, domains and core team of the Technocrats Developer Community.",
};

export default function AboutPage() {
  return (
    <>
      <Section>
        <SectionHeading
          eyebrow="About TDC"
          title="A student-led community for building with technology"
          description="Technocrats Developer Community exists so that students at Technocrats can get serious about software without waiting for a degree, a job or permission. We organise the time, the peer group and the projects — you bring the curiosity."
          size="page"
          level={1}
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <p className="text-base leading-relaxed text-muted-foreground">
            Membership is open to anyone at Technocrats who wants to learn
            programming, development, AI/ML, cybersecurity or open source. No
            prior experience is expected — just curiosity and a willingness to
            show up.
          </p>
          <p className="text-base leading-relaxed text-muted-foreground">
            We meet every week, and most members arrive as beginners and leave
            as people who have shipped something they can point at.
          </p>
        </div>
      </Section>

      {/* Community */}
      <Section>
        <SectionHeading
          eyebrow="Community"
          title="Where we are today"
          description="Placeholder figures for now — these update as the community grows."
          className="mb-10"
        />
        <StatList stats={communityStats} />
      </Section>

      {/* Mission & Vision */}
      <MutedBand>
        <Section>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-card p-6">
              <span className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Target className="size-4.5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold tracking-tight text-card-foreground">
                Our Mission
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                To help students learn technology through practical
                development — real projects, real code review, real events and
                peer learning. We would rather you finish a small thing than
                plan a large one, because that is how skills actually stick.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <span className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Eye className="size-4.5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold tracking-tight text-card-foreground">
                Our Vision
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                A strong, student-led developer ecosystem where anyone can
                learn, build, collaborate and contribute — and where students
                leave with a body of work they are proud to show.
              </p>
            </div>
          </div>
        </Section>
      </MutedBand>

      {/* Domains */}
      <Section id="domains">
        <SectionHeading
          eyebrow="Domains"
          title="Where we work"
          description="The areas the community actively runs projects, sessions and study groups in."
          className="mb-10"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {domains.map((domain) => (
            <DomainCard key={domain.slug} domain={domain} anchorable />
          ))}
        </div>
      </Section>

      {/* Community Values */}
      <MutedBand>
        <Section id="values">
          <SectionHeading
            eyebrow="Community Values"
            title="How we work together"
            description="Four principles that decide how we run sessions, reviews and projects."
            className="mb-10"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {communityValues.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.id} className="rounded-lg border bg-card p-5">
                  <span className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-card-foreground">
                    {value.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Section>
      </MutedBand>

      {/* Team */}
      <Section id="team">
        <SectionHeading
          eyebrow="Team"
          title="Who runs TDC"
          description="Placeholder profiles for now — swap these for real core team members later."
          className="mb-10"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <div key={member.id} className="rounded-lg border bg-card p-5">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold text-muted-foreground"
                >
                  {member.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </span>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">
                    {member.name}
                  </p>
                  <p className="text-sm text-primary">{member.role}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {member.department}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}