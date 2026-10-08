import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { asc, gt } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { cacheLife } from "next/cache";

import { BentoTile } from "@/components/bento-tile";
import { Hero } from "@/components/hero";
import { DomainStream } from "@/components/domain-stream";
import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProfile, getSession } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { dbEventToItem } from "@/lib/events";
import { communityStats, domains } from "@/lib/site-data";

const tickerItems = domains.map((domain) => domain.title.toUpperCase());

async function getFeaturedEvents() {
  "use cache";
  cacheLife("minutes");

  const rows = await db
    .select()
    .from(events)
    .where(gt(events.startsAt, new Date()))
    .orderBy(asc(events.startsAt))
    .limit(3);

  return rows.map(dbEventToItem);
}

async function AdminGate({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const session = await getSession();
  const profile = session?.user ? await getProfile(session.user.id) : null;
  const { view } = await searchParams;
  if (profile?.role === "ADMIN" && view !== "site") {
    redirect("/admin");
  }
  return null;
}

const entrySteps = [
  {
    id: "hello",
    title: "Say hello",
    description: "One form, no application essay. Tell us what you want to build.",
    href: "/contact",
    command: "tdc contact --new",
  },
  {
    id: "track",
    title: "Pick a track",
    description: "Eight domains, from web and apps to AI, cloud and security.",
    href: "/events",
    command: "tdc domains --list",
  },
  {
    id: "ship",
    title: "Ship something",
    description: "Build nights and mentored sprints run all through the semester.",
    href: "/about",
    command: "tdc build --start",
  },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const featuredEvents = await getFeaturedEvents();

  return (
    <>
      <Suspense>
        <AdminGate searchParams={searchParams} />
      </Suspense>


      <Hero />

      {/* Domain stream */}
      <div className="tdc-reveal border-b bg-muted/40 py-6">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <p className="tdc-mono mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            $ tdc tracks --stream
          </p>
          <DomainStream items={tickerItems} />
        </div>
      </div>

      {/* Bento grid */}
      <Section>
        <div className="tdc-stagger grid gap-4 lg:grid-cols-6">
          <BentoTile
            label="~/tdc/about"
            hint="readme"
            className="tdc-reveal lg:col-span-4"
          >
            <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              A place where students actually build
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Technocrats Developer Community is a student-led group for people
              who would rather write code than only read about it. We run
              hands-on workshops, long build sessions and small teams that ship
              projects together.
            </p>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Membership is open to anyone at Technocrats who wants to learn
              programming, development, AI/ML, cybersecurity or open source. No
              prior experience is expected.
            </p>
            <div className="mt-6">
              <Button asChild variant="outline" className="tdc-mono cursor-target">
                <Link href="/about">
                  read more
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </BentoTile>

          <BentoTile
            label="~/tdc/schedule"
            hint="next"
            interactive
            className="tdc-reveal lg:col-span-2"
          >
            <ul className="flex flex-1 flex-col">
              {featuredEvents.length === 0 ? (
                <li className="py-3">
                  <p className="tdc-mono text-[11px] text-muted-foreground">
                    next
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    Season details coming soon
                  </p>
                </li>
              ) : null}
              {featuredEvents.map((event, index) => (
                <li
                  key={event.id}
                  className={
                    index === 0
                      ? "border-b border-dashed pb-3"
                      : "border-b border-dashed py-3 last:border-b-0 last:pb-0"
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="tdc-mono text-[11px] text-muted-foreground">
                        {event.date}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-balance">
                        {event.title}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="tdc-mono rounded-none text-[10px] tracking-wide uppercase"
                    >
                      {event.registrationStatus}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="tdc-mono mt-5 w-full justify-start cursor-target"
            >
              <Link href="/events">
                all events
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          </BentoTile>

          <BentoTile
            label="~/tdc/domains"
            hint={`${domains.length} tracks`}
            className="tdc-reveal lg:col-span-4"
          >
            <ul className="grid gap-x-6 sm:grid-cols-2">
              {domains.map((domain) => {
                const Icon = domain.icon;
                return (
                  <li key={domain.slug}>
                    <Link
                      href="/about"
                      className="group flex cursor-target items-center gap-3 border-b border-dashed py-2.5 transition-colors last:border-b-0 hover:text-foreground"
                    >
                      <Icon
                        className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                        aria-hidden="true"
                      />
                      <span className="tdc-underline text-sm font-medium">{domain.title}</span>
                      <ArrowUpRight
                        className="ml-auto size-3.5 shrink-0 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </BentoTile>

          <BentoTile
            label="~/tdc/stats"
            hint="live"
            className="tdc-reveal lg:col-span-2"
          >
            <dl className="grid grid-cols-2 gap-x-4 gap-y-6">
              {communityStats.map((stat) => (
                <div key={stat.id}>
                  <dt className="tdc-mono-label">{stat.label}</dt>
                  <dd className="mt-1.5 text-3xl font-semibold tracking-tight">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </BentoTile>

          {entrySteps.map((step, index) => (
            <BentoTile
              key={step.id}
              label={`0${index + 1}`}
              interactive
              className="tdc-reveal lg:col-span-2"
            >
              <h3 className="text-lg font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
              <Link
                href={step.href}
                className="tdc-mono tdc-underline mt-4 inline-flex min-h-11 items-center gap-1.5 text-xs text-muted-foreground transition-colors cursor-target hover:text-foreground"
              >
                <span aria-hidden="true">$</span>
                {step.command}
              </Link>
            </BentoTile>
          ))}
        </div>
      </Section>

      {/* Inverted terminal call to action */}
      <section className="tdc-reveal border-t bg-foreground text-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="tdc-mono text-xs tracking-wide text-background/60 uppercase">
            $ tdc join --apply
          </p>
          <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            Bring a laptop and an idea. We&apos;ll give you people to build
            with.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-background/70">
            Problems worth solving, mentors on hand and enough support to finish
            what you start. New to any of it? That is the point.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="tdc-mono cursor-target border bg-background text-foreground shadow-none hover:bg-background/90"
            >
              <Link href="/contact">join tdc</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="tdc-mono cursor-target border-background/40 bg-transparent text-background shadow-none hover:bg-background hover:text-foreground"
            >
              <Link href="/about">what we do</Link>
            </Button>
          </div>
          <p className="tdc-mono mt-10 text-xs text-background/60">
            <span className="tdc-caret text-background">
              status: accepting new members
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
