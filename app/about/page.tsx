import type { Metadata } from "next";

import { StoryBook } from "@/components/story-book";
import type { StoryBookPage } from "@/components/story-book";
import { DomainCard } from "@/components/domain-card";
import { SectionHeading } from "@/components/section-heading";
import { MutedBand, Section } from "@/components/section";
import { StatList } from "@/components/stat-card";
import { TerminalPanel } from "@/components/terminal-panel";
import { communityStats, communityValues, domains, team } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story of the Technocrats Developer Community, told in a book — why we exist, what we teach and where we are headed.",
};

const storyPages: StoryBookPage[] = [
  {
    id: 1,
    front: {
      variant: "cover",
      kicker: "tdc / journal of a community",
      title: "Technocrats Developer Community",
      body: "a story told in pages",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    },
    back: {
      kicker: "chapter 01 · the beginning",
      title: "Three friends, one idea",
      body: "Annand Soni, Ankit Kumar and Ankit Sharma looked around and saw developers in the crowd, but no crowd of developers. They started TDC so that talent on the campus stopped staying quiet.",
    },
  },
  {
    id: 2,
    front: {
      kicker: "chapter 02 · the why",
      title: "Juniors deserve real guidance",
      body: "The gap between what a syllabus teaches and what the world runs on is wide. TDC closes it — older students hand down what actually works, in words they wish someone had said to them. No gatekeeping, no ego. Just the desk next to yours.",
    },
    back: {
      kicker: "chapter 03 · what we teach",
      title: "Web, apps, AI/ML, security, DSA",
      body: "Five tracks, one floor: web builds the front door, apps put it in a pocket, AI/ML gives it a brain, security keeps it honest and DSA sharpens the person behind it. Pick one, then show up and build.",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      caption: "a few hours of a sprint, compressed",
    },
  },
  {
    id: 3,
    front: {
      kicker: "chapter 04 · how we work",
      title: "Workshops, sprints, honest review",
      body: "Every week there is a session, and most weeks there is a build. We review code the way we would want ours reviewed — specific, kind and demanding. Small teams, real deadlines, no salvaged by the loudest voice.",
      image:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
      caption: "the workshop floor on a wednesday",
    },
    back: {
      kicker: "chapter 05 · the community",
      title: "Open study groups and demo nights",
      body: "Anyone at Technocrats can walk in and sit down. The study groups run on whoever shows up, and demo nights run on whatever got finished. Half of membership is the discipline of coming back next week.",
      image:
        "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=800&q=80",
      caption: "demo night, laptop side",
    },
  },
  {
    id: 4,
    front: {
      kicker: "chapter 06 · the vision",
      title: "A body of work to show",
      body: "By the time students leave, they should be able to open a repo or a portfolio and point at what they made. That is the whole point: we measure success in shipped things, not in certificates.",
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
      caption: "where the track heads",
    },
    back: {
      kicker: "chapter 07 · join us",
      title: "Bring a laptop and an idea",
      body: "There is no form to fill and no bar to clear. Come to a session, sit anywhere, meet the people building. Join for the projects, stay for the people, and leave the campus a little more awake than you found it.",
    },
  },
  {
    id: 5,
    front: {
      variant: "end",
      kicker: "endplate",
      title: "Your page",
      body: "This book is only half written. The next leaf belongs to someone who showed up to a workshop and never left. That person could be you.",
      image:
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    },
    back: {
      variant: "end",
      kicker: "tdc / back cover",
      title: "Built by students, for students",
      body: "Technocrats Developer Community · Technocrats Institute of Technology (Excellence), Bhopal · see you at the next session.",
      image:
        "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80",
    },
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

      {/* The story, told in a book */}
      <Section id="story" className="tdc-reveal">
        <SectionHeading
          eyebrow="About"
          title="The story of TDC, in a book"
          description="Flip through how TDC came to be, what we teach and where it is headed."
          className="mb-10"
        />
        <TerminalPanel title="~/tdc/story.pdf --flip" badge="[ 5 leaves ]" scanlines>
          <div className="overflow-x-auto">
            <StoryBook
              pages={storyPages}
              pageWidth={252}
              pageHeight={356}
              autoplay
              autoplayInterval={6000}
              pauseOnHover
              accentColor="var(--primary)"
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