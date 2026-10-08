import type { Metadata } from "next";
import { Eye, Target } from "lucide-react";

import ThreeDImagePageflip from "@/components/lightswind/3d-image-pageflip";
import type { PageFlipLeaf } from "@/components/lightswind/3d-image-pageflip";
import { DomainCard } from "@/components/domain-card";
import { SectionHeading } from "@/components/section-heading";
import { MutedBand, Section } from "@/components/section";
import { StatList } from "@/components/stat-card";
import { TerminalPanel } from "@/components/terminal-panel";
import { communityStats, communityValues, domains, team } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "About",
  description:
    "Purpose, mission, vision, domains and core team of the Technocrats Developer Community.",
};

const storyLeaves: PageFlipLeaf[] = [
  {
    id: 1,
    frontImage:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    backImage:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    frontTitle: "Technocrats Developer Community",
    frontSubtitle: "our story, told in leaves",
    frontBadge: "cover",
    backTitle: "Chapter 01 · the beginning",
    backSubtitle: "Annand Soni, Ankit Kumar & Ankit Sharma",
    backBadge: "cp.01",
  },
  {
    id: 2,
    frontImage:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    backImage:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    frontTitle: "Chapter 02 · the why",
    frontSubtitle: "juniors deserve real guidance from seniors",
    frontBadge: "cp.02",
    backTitle: "Chapter 03 · what we teach",
    backSubtitle: "web · apps · ai/ml · security · dsa",
    backBadge: "cp.03",
  },
  {
    id: 3,
    frontImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    backImage:
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=800&q=80",
    frontTitle: "Chapter 04 · how we work",
    frontSubtitle: "workshops, sprints and honest code review",
    frontBadge: "cp.04",
    backTitle: "Chapter 05 · placement prep",
    backSubtitle: "dsa, mock interviews and practice rounds",
    backBadge: "cp.05",
  },
  {
    id: 4,
    frontImage:
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    backImage:
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80",
    frontTitle: "Chapter 06 · the community",
    frontSubtitle: "open study groups and demo nights",
    frontBadge: "cp.06",
    backTitle: "Endplate · your turn",
    backSubtitle: "bring a laptop and an idea — join us",
    backBadge: "endplate",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Intro */}
      <Section className="tdc-reveal">
        <SectionHeading
          eyebrow="About TDC"
          title="A student-led community for building with technology"
          description="Technocrats Developer Community exists so that students at Technocrats can get serious about software without waiting for a degree, a job or permission. We organise the time, the peer group and the projects — you bring the curiosity."
          size="page"
          level={1}
        />

        <div className="mt-10">
          <TerminalPanel title="~/tdc/about/README" badge="open source" scanlines>
            <div className="grid gap-6 lg:grid-cols-2">
              <p className="text-base leading-relaxed text-muted-foreground">
                Membership is open to anyone at Technocrats who wants to learn
                programming, development, AI/ML, cybersecurity or open source.
                No prior experience is expected — just curiosity and a
                willingness to show up.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                We meet every week, and most members arrive as beginners and
                leave as people who have shipped something they can point at.
              </p>
            </div>
            <div className="tdc-mono mt-6 flex items-center gap-3 border-t border-dashed pt-4 text-xs text-muted-foreground">
              <p>
                <span aria-hidden="true" className="text-primary">
                  $
                </span>{" "}
                <span className="tdc-caret text-foreground">
                  open to all technocrats
                </span>
              </p>
              <p className="ml-auto hidden items-center gap-1.5 sm:flex">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-primary"
                />
                active
              </p>
            </div>
          </TerminalPanel>
        </div>
      </Section>

      {/* Story notebook */}
      <Section id="story" className="tdc-reveal">
        <SectionHeading
          eyebrow="Notebook"
          title="Our story, page by page"
          description="Flip through how TDC came to be, what we teach and where it is headed."
          className="mb-10"
        />
        <TerminalPanel title="~/tdc/story --open" badge="[ 4 leaves ]" scanlines>
          <div className="overflow-x-auto">
            <ThreeDImagePageflip
              pages={storyLeaves}
              pageWidth={250}
              pageHeight={350}
              perspective={1400}
              duration={0.7}
              peekAngle={14}
              autoplay
              autoplayInterval={5000}
            />
          </div>
        </TerminalPanel>
      </Section>

      {/* Community */}
      <Section id="community" className="tdc-reveal">
        <SectionHeading
          eyebrow="Community"
          title="Where we are today"
          description="The TDC at a glance."
          className="mb-10"
        />
        <TerminalPanel title="~/tdc/stats --all" badge="0x01" scanlines>
          <StatList stats={communityStats} className="tdc-stagger" />
        </TerminalPanel>
      </Section>

      {/* Mission & Vision */}
      <MutedBand>
        <Section className="tdc-reveal">
          <div className="grid gap-6 lg:grid-cols-2">
            <TerminalPanel title="~/tdc/mission" badge="readme" scanlines>
              <Target className="size-5 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold tracking-tight text-card-foreground">
                Our Mission
              </h2>
              <p className="tdc-mono mt-3 text-sm leading-relaxed text-muted-foreground">
                To help students learn technology through practical development —
                real projects, real code review, real events and peer learning.
                We would rather you finish a small thing than plan a large one,
                because that is how skills actually stick.
              </p>
            </TerminalPanel>

            <TerminalPanel title="~/tdc/vision" badge="roadmap" scanlines>
              <Eye className="size-5 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold tracking-tight text-card-foreground">
                Our Vision
              </h2>
              <p className="tdc-mono mt-3 text-sm leading-relaxed text-muted-foreground">
                A strong, student-led developer ecosystem where anyone can learn,
                build, collaborate and contribute — and where students leave
                with a body of work they are proud to show.
              </p>
            </TerminalPanel>
          </div>
        </Section>
      </MutedBand>

      {/* Domains */}
      <Section id="domains" className="tdc-reveal">
        <SectionHeading
          eyebrow="Domains"
          title="Where we work"
          description="The areas the community actively runs projects, sessions and study groups in."
          className="mb-10"
        />
        <TerminalPanel title="~/tdc/domains --list" badge="05 tracks" scanlines>
          <div className="tdc-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {domains.map((domain) => (
              <DomainCard key={domain.slug} domain={domain} anchorable />
            ))}
          </div>
        </TerminalPanel>
      </Section>

      {/* Community Values */}
      <MutedBand>
        <Section id="values" className="tdc-reveal">
          <SectionHeading
            eyebrow="Community Values"
            title="How we work together"
            description="Four principles that decide how we run sessions, reviews and projects."
            className="mb-10"
          />
          <TerminalPanel title="~/tdc/values" badge="4 principles" scanlines>
            <div className="tdc-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {communityValues.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div
                    key={value.id}
                    className="tdc-card-hover rounded-[4px] border bg-card p-5"
                  >
                    <p className="tdc-mono text-2xl font-bold text-primary">
                      0{index + 1}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <Icon
                        aria-hidden="true"
                        className="size-4 text-muted-foreground"
                      />
                      <h3 className="text-sm font-semibold text-card-foreground">
                        {value.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </TerminalPanel>
        </Section>
      </MutedBand>

      {/* Team */}
      <Section id="team" className="tdc-reveal">
        <SectionHeading
          eyebrow="Team"
          title="Who runs TDC"
          description="The friends who started Technocrats Developer Community."
          className="mb-10"
        />
        <TerminalPanel title="~/tdc/team --list" badge="founders" scanlines>
          <div className="tdc-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <div
                key={member.id}
                className="tdc-frame tdc-card-hover rounded-[4px] border bg-card p-5"
              >
                <p className="tdc-mono-label">$ whoami</p>
                <div className="mt-3 flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="tdc-mono flex size-10 shrink-0 items-center justify-center rounded-[3px] border border-border bg-background text-xs font-bold text-primary"
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
                    <p className="tdc-mono text-xs text-primary">
                      {member.role}
                    </p>
                  </div>
                </div>
                <p className="tdc-mono-label mt-4">{member.department}</p>
              </div>
            ))}
          </div>
        </TerminalPanel>
      </Section>
    </>
  );
}