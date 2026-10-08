import type { Metadata } from "next";

import { SectionHeading } from "@/components/section-heading";
import { Section } from "@/components/section";
import { TerminalPanel } from "@/components/terminal-panel";

export const metadata: Metadata = {
  title: "Forum",
  description:
    "Member discussion boards for the Technocrats Developer Community — projects, events, help and off-topic chatter.",
};

const channels = [
  { slug: "intros", topic: "say hi, tell us your stack" },
  { slug: "projects", topic: "show builds, find collaborators" },
  { slug: "events", topic: "session recaps and upcoming talks" },
  { slug: "help", topic: "stuck on code? ask here" },
  { slug: "placements", topic: "interview prep, referrals, experiences" },
  { slug: "off-topic", topic: "memes, music, everything else" },
];

export default function ForumPage() {
  return (
    <Section className="tdc-reveal">
      <SectionHeading
        eyebrow="Forum"
        title="Member discussion boards"
        description="Honest conversations for and by TDC members — ask for help, share what you built and plan the next collab."
        size="page"
        level={1}
      />

      <div className="mt-10">
        <TerminalPanel title="~/tdc/forum --channels" badge="06 boards" scanlines>
          <ol className="tdc-stagger flex flex-col gap-3">
            {channels.map((channel, index) => (
              <li
                key={channel.slug}
                className="tdc-card-hover flex items-center gap-3 rounded-[4px] border border-border bg-card px-4 py-3"
              >
                <span
                  aria-hidden="true"
                  className="tdc-mono text-xs text-primary"
                >
                  0{index + 1}
                </span>
                <span className="tdc-mono text-sm text-foreground">
                  ~/forum/{channel.slug}
                </span>
                <span className="ml-auto hidden truncate pl-4 text-sm text-muted-foreground sm:block">
                  {channel.topic}
                </span>
              </li>
            ))}
          </ol>

          <p className="tdc-mono mt-6 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-dashed pt-4 text-xs text-muted-foreground">
            <span aria-hidden="true" className="text-primary">
              $
            </span>
            <span className="tdc-caret text-foreground">
              threads &amp; replies are being set up
            </span>
          </p>
        </TerminalPanel>
      </div>
    </Section>
  );
}