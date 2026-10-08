import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import { Section } from "@/components/section";
import { TerminalPanel } from "@/components/terminal-panel";

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "The monthly Technocrats Developer Community newsletter — event recaps, member projects and what's coming next.",
};

const issues = [
  { edition: "001", title: "Build season is here", tag: "kickoff" },
  { edition: "002", title: "Hackathon wrap + project showcase", tag: "recap" },
  { edition: "003", title: "Placements: what actually worked", tag: "careers" },
];

export default function NewsletterPage() {
  return (
    <Section className="tdc-reveal">
      <SectionHeading
        eyebrow="Newsletter"
        title="One email a month, straight to the point"
        description="No spam, no fluff. Event recaps, member projects, placement hints and what the community is building next — once a month, in your inbox."
        size="page"
        level={1}
      />

      <div className="mt-10">
        <TerminalPanel title="~/tdc/newsletter" badge="monthly" scanlines>
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xl">
              <p className="tdc-mono text-xs tracking-wide text-primary uppercase">
                $ tdc digest --subscribe
              </p>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                Every issue rounds up what the community shipped, the sessions we
                ran, the opportunities worth applying to and a look at what is
                coming next month.
              </p>
            </div>

            <div className="tdc-frame w-full rounded-[4px] border bg-card p-5 md:max-w-xs">
              <p className="tdc-mono-label">past issues</p>
              <ul className="tdc-stagger mt-4 flex flex-col gap-3">
                {issues.map((issue) => (
                  <li
                    key={issue.edition}
                    className="flex items-center gap-3 border-b border-dashed pb-3 last:border-0 last:pb-0"
                  >
                    <span className="tdc-mono text-sm font-semibold text-primary">
                      #{issue.edition}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-card-foreground">
                        {issue.title}
                      </p>
                      <p className="tdc-mono-label">{issue.tag}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="tdc-mono mt-8 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-dashed pt-4 text-xs text-muted-foreground">
            <span aria-hidden="true" className="text-primary">
              $
            </span>
            <span className="text-foreground">
              manage your preference on your profile
            </span>
            <Link
              href="/profile"
              className="tdc-underline text-primary transition-opacity hover:opacity-80"
            >
              ~/profile
            </Link>
          </p>
        </TerminalPanel>
      </div>
    </Section>
  );
}