import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const perks = [
  {
    command: "open to all",
    description:
      "Every Technocrats student can join. No skill test, no waiting list.",
  },
  {
    command: "zero fee",
    description:
      "Free to join, free to learn. The only real cost is showing up.",
  },
  {
    command: "weekly builds",
    description:
      "Mentored sprints, demo nights and study groups every week on campus.",
  },
];

export function JoinCta() {
  return (
    <section className="tdc-reveal border-t bg-muted/10">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div>
          <p className="tdc-mono text-xs uppercase tracking-wider text-primary">
            $ tdc join --apply
          </p>
          <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Bring a laptop and a good idea. We&apos;ll handle everything else.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
            Mentors on hand, study groups that actually meet, project teams that
            finish things and a room full of people who would rather be building
            than waiting. New to any of it? That is exactly who this was made
            for.
          </p>

          <ul className="mt-8 flex flex-col gap-4">
            {perks.map((perk) => (
              <li
                key={perk.command}
                className="flex items-baseline gap-3 border-l-2 border-primary/40 pl-4"
              >
                <div>
                  <p className="tdc-mono text-sm font-semibold text-foreground">
                    ./{perk.command}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {perk.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="tdc-mono cursor-target">
              <Link href="/join">
                join tdc
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="tdc-mono cursor-target"
            >
              <Link href="/events">see upcoming</Link>
            </Button>
          </div>
        </div>

        {/* Faux membership card */}
        <div className="flex items-center lg:justify-end">
          <div className="tdc-scanlines w-full max-w-sm overflow-hidden rounded-[4px] border border-foreground bg-foreground text-background shadow-2xl">
            <div
              aria-hidden="true"
              className="flex items-center gap-2 border-b border-background/20 px-4 py-2.5"
            >
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-background/25" />
                <span className="size-2.5 rounded-full bg-background/25" />
                <span className="size-2.5 rounded-full bg-background/25" />
              </span>
              <span className="tdc-mono-label ml-1.5 truncate !text-background/60">
                ~/tdc/member-card
              </span>
              <span className="tdc-mono-label ml-auto hidden shrink-0 sm:inline !text-background/60">
                valid this semester
              </span>
            </div>

            <div className="px-6 py-8">
              <div className="flex items-center justify-between">
                <p className="tdc-mono text-xs tracking-[0.2em] text-background/60">
                  TDC // MEMBER
                </p>
                <span
                  aria-hidden="true"
                  className="tdc-mono text-2xl font-bold text-background/20"
                >
                  $
                </span>
              </div>

              <p className="tdc-mono mt-5 text-4xl font-bold tracking-tight">
                #001
                <span aria-hidden="true" className="tdc-caret" />
              </p>

              <dl className="mt-8 flex flex-col gap-4 border-t border-dashed border-background/25 pt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="tdc-mono-label !text-background/50">name</dt>
                  <dd className="tdc-mono text-sm text-background">
                    you [technocrat]
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="tdc-mono-label !text-background/50">track</dt>
                  <dd className="tdc-mono text-sm text-background">
                    web / apps / ai / sec / dsa
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="tdc-mono-label !text-background/50">status</dt>
                  <dd className="flex items-center gap-2 text-sm text-background">
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-emerald-400"
                    />
                    accepting applications
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}