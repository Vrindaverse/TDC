import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronDown } from "lucide-react";

import DotGrid from "@/components/dot-grid";
import { TechText } from "@/components/tech-text";
import { TerminalPanel } from "@/components/terminal-panel";
import { Typewriter } from "@/components/typewriter";
import { Button } from "@/components/ui/button";

const TERMINAL_LINES = [
  { prompt: "whoami", output: "technocrat --member tdc" },
  { prompt: "tdc register --status", output: "open" },
];

const HERO_FACTS = [
  { label: "founded by", value: "3 friends" },
  { label: "domains", value: "05" },
  { label: "join", value: "open" },
];

/**
 * Page-opening hero, split into text on the left and the visual components on
 * the right. The copy column stacks above the panel on small screens, so the
 * pitch and the calls to action are always the first thing read.
 *
 * Still a server component: the canvas wordmark and the typewriter are the only
 * client islands, and both render their finished state on the server.
 */
export function Hero() {
  return (
    <section className="relative border-b">
      <div className="absolute inset-0">
        <DotGrid
          dotSize={4}
          gap={25}
          baseColor="#d4d4d4"
          activeColor="#0a0a0a"
          proximity={140}
          shockRadius={220}
          shockStrength={4}
          resistance={750}
          returnDuration={1.4}
        />
      </div>
      <div className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Copy */}
          <div className="tdc-rise tdc-rise-1">
            <p className="tdc-mono-label">~/tdc — technocrats</p>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.06]">
              Technocrats Developer Community
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-balance text-muted-foreground sm:text-lg">
              Students who would rather write the code than read about it.
              Workshops, build nights, and small teams that ship.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="tdc-mono cursor-target">
                <Link href="/join">
                  join us
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="tdc-mono cursor-target"
              >
                <Link href="/events">
                  <CalendarDays aria-hidden="true" />
                  tdc events
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="tdc-mono cursor-target"
              >
                <Link href="/about">explore</Link>
              </Button>
            </div>

            {/* `dt` stays first in the DOM for valid `dl` grouping; `order-first`
                on `dd` only changes the visual order to value-then-label. */}
            <dl className="mt-9 flex flex-wrap gap-x-8 gap-y-4 border-t pt-7">
              {HERO_FACTS.map((fact) => (
                <div key={fact.label} className="flex items-baseline gap-1.5">
                  <dt className="tdc-mono-label">{fact.label}</dt>
                  <dd className="tdc-mono order-first text-sm font-semibold text-foreground">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Components */}
          <div className="tdc-rise tdc-rise-3 w-full">
            <TerminalPanel
              title="tdc@technocrats — ~/community"
              badge="session: bash"
              scanlines
            >
              {/* Negative margin escapes the panel padding so the canvas runs
                  edge to edge. The wrapper owns the height: `.tech-text` fills
                  its parent, and that rule is unlayered CSS so a Tailwind
                  height utility would lose to it. */}
              <div className="-mx-4 sm:-mx-6">
                <div className="h-[190px] w-full sm:h-[220px]">
                  {/* `font-mono` on the container is picked up by the canvas via
                      computed style, which gives the wordmark a terminal-block
                      look. #0a0a0a is `--foreground`; canvas only parses hex. */}
                  <TechText
                    text="TDC"
                    className="font-mono"
                    fontSize={620}
                    letterSpacing={-0.02}
                    color="#0a0a0a"
                    accentColor="#0a0a0a"
                  />
                </div>
              </div>

              <div className="mt-6 border-t border-dashed pt-4">
                <Typewriter lines={TERMINAL_LINES} />
              </div>

              <p className="tdc-mono mt-5 text-xs text-muted-foreground">
                <span className="tdc-caret text-foreground">
                  open to all technocrats
                </span>
              </p>
            </TerminalPanel>
          </div>
        </div>

        <p className="tdc-mono tdc-scroll-cue mt-10 hidden items-center gap-1.5 text-[11px] tracking-wide text-muted-foreground uppercase sm:flex">
          scroll
          <ChevronDown className="size-3" aria-hidden="true" />
        </p>
      </div>
    </section>
  );
}
