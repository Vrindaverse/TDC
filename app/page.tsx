import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { and, asc, desc, eq, gt, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { cacheLife } from "next/cache";

import { Hero } from "@/components/hero";
import { DomainMarquee } from "@/components/domain-marquee";
import { JoinCta } from "@/components/join-cta";
import { Section } from "@/components/section";
import { TerminalPanel } from "@/components/terminal-panel";
import { VerticalMarquee } from "@/components/vertical-marquee";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProfile, getSession } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { announcements, events } from "@/lib/db/schema";
import { dbEventToItem } from "@/lib/events";
import { formatDate } from "@/lib/format";
import { domains } from "@/lib/site-data";

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

async function PublicAnnouncements() {
  const items = await getPublicAnnouncements();
  if (items.length === 0) return null;

  return (
    <section className="tdc-reveal border-b bg-muted/10">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-14 sm:px-6">
        <TerminalPanel title="~/tdc/announcements" badge="feed" scanlines>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="tdc-mono-label">tdc / announcements</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                What the community should know
              </h2>
            </div>
            <span className="tdc-mono hidden text-xs text-muted-foreground sm:block">
              $ cat --recent
            </span>
          </div>

          <ul className="tdc-stagger mt-8 divide-y divide-dashed border-y">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-baseline sm:gap-5"
              >
                <span className="tdc-mono w-28 shrink-0 pt-1 text-xs text-muted-foreground">
                  {formatDate(item.createdAt)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.pinned ? (
                      <span className="tdc-mono inline-flex items-center rounded-[3px] border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-primary">
                        pinned
                      </span>
                    ) : null}
                    <h3 className="text-sm font-semibold tracking-tight">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {item.body}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="tdc-mono hidden self-center text-primary sm:block"
                >
                  ❯
                </span>
              </li>
            ))}
          </ul>
        </TerminalPanel>
      </div>
    </section>
  );
}

async function getPublicAnnouncements() {
  "use cache";
  cacheLife("minutes");

  return db
    .select()
    .from(announcements)
    .where(
      and(
        eq(announcements.isActive, true),
        inArray(announcements.audience, ["all", "visitors"])
      )
    )
    .orderBy(desc(announcements.pinned), desc(announcements.createdAt))
    .limit(3);
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

const REGISTRATION_STATUS_LABELS: Record<string, string> = {
  open: "Registration open",
  closing: "Closing soon",
  closed: "Registration closed",
};

const entrySteps = [
  {
    id: "hello",
    title: "Say hello",
    description: "One form, no application essay. Tell us what you want to build.",
    href: "/join",
    command: "tdc contact --new",
  },
  {
    id: "track",
    title: "Pick a track",
    description: "Five tracks: web, apps, AI/ML, cybersecurity and DSA.",
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

      <Suspense>
        <PublicAnnouncements />
      </Suspense>

      {/* Domain stream */}
      <div className="tdc-reveal border-b bg-muted/40 py-6 lg:py-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 lg:hidden">
          <TerminalPanel title="~/tdc/tracks" badge="marquee">
            <DomainMarquee items={tickerItems} />
          </TerminalPanel>
        </div>

        <div className="hidden items-center lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,76rem)_minmax(0,1fr)]">
          <VerticalMarquee text="TDC" className="justify-self-center" />
          <div className="w-full px-8">
            <TerminalPanel title="~/tdc/tracks" badge="marquee">
              <DomainMarquee items={tickerItems} />
            </TerminalPanel>
          </div>
          <VerticalMarquee text="TDC" reverse className="justify-self-center" />
        </div>
      </div>

      {/* Story */}
      <Section className="tdc-reveal">
        <TerminalPanel title="~/tdc — story" badge="readme" scanlines>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="tdc-mono-label">tdc / story</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Started by students, for students
            </h2>
          </div>
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground lg:col-span-7">
            <p>
              Technocrats Developer Community was founded by Annand Soni,
              Ankit Kumar and Ankit Sharma — three friends who wanted juniors
              to get real guidance from seniors, and a platform where
              like-minded people could help each other grow.
            </p>
            <p>
              That legacy continues today: we prepare students for placements,
              and teach DSA, Cybersecurity, App Dev, Web Dev and AI/ML through
              hands-on workshops and mentorship.
            </p>
            <Button asChild variant="outline" className="tdc-mono cursor-target">
              <Link href="/about">
                read our story
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
        </TerminalPanel>
      </Section>

      {/* Tracks */}
      <section className="tdc-reveal border-t">
        <Section>
          <TerminalPanel title="~/tdc/domains --list" badge="05 tracks" scanlines>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Tracks we teach
            </h2>
            <span className="tdc-mono text-xs text-muted-foreground">
              {String(domains.length).padStart(2, "0")} tracks
            </span>
          </div>
          <ol className="tdc-stagger mt-8 divide-y border-y">
            {domains.map((domain, index) => {
              const Icon = domain.icon;
              return (
                <li key={domain.slug}>
                  <Link
                    href="/about"
                    className="group flex items-center gap-5 py-4 transition-colors hover:bg-muted/40 sm:gap-8"
                  >
                    <span className="tdc-mono w-8 shrink-0 text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Icon
                      aria-hidden="true"
                      className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold tracking-tight sm:text-lg">
                        {domain.title}
                      </h3>
                      <p className="truncate text-sm text-muted-foreground">
                        {domain.description}
                      </p>
                    </div>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100"
                    />
                  </Link>
                </li>
              );
            })}
          </ol>
          </TerminalPanel>
        </Section>
      </section>

      {/* How it works */}
      <Section className="tdc-reveal">
        <TerminalPanel title="~/tdc/how-it-works" badge="3 steps" scanlines>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          How it works
        </h2>
        <div className="tdc-stagger mt-8 grid gap-4 sm:grid-cols-3">
          {entrySteps.map((step, index) => (
            <div
              key={step.id}
              className="tdc-card-hover rounded-xl border bg-card/50 p-5 shadow-sm"
            >
              <p className="tdc-mono text-3xl font-bold text-primary">
                0{index + 1}
              </p>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">
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
            </div>
          ))}
        </div>
        </TerminalPanel>
      </Section>

      {/* Upcoming */}
      <section className="tdc-reveal border-t bg-muted/20">
        <Section>
          <TerminalPanel title="~/tdc/events --upcoming" badge="live" scanlines>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Upcoming
            </h2>
            <Link
              href="/events"
              className="tdc-mono tdc-underline inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              all events
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
          <div className="tdc-stagger mt-8 grid gap-4 sm:grid-cols-3">
            {featuredEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground sm:col-span-3">
                Season details coming soon.
              </p>
            ) : (
              featuredEvents.map((event) => (
                <div
                  key={event.id}
                  className="tdc-card-hover flex flex-col gap-3 rounded-xl border bg-card/50 p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="tdc-mono text-xs text-muted-foreground">
                      {event.date}
                    </p>
                    <Badge
                      variant="outline"
                      className="tdc-mono rounded-none text-[10px] uppercase tracking-wide"
                    >
                      {REGISTRATION_STATUS_LABELS[event.registrationStatus] ??
                        event.registrationStatus}
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold tracking-tight">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {event.location || "TDC Campus"} · {event.time}
                  </p>
                  {event.registrationStatus === "open" ||
                  event.registrationStatus === "closing" ? (
                  <Link
                    href={`/join?event=${event.id}`}
                    className="tdc-mono tdc-underline mt-auto inline-flex items-center gap-1.5 text-xs text-foreground"
                  >
                    register
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </Link>
                ) : (
                  <span className="tdc-mono mt-auto text-xs text-muted-foreground">
                    registration closed
                  </span>
                )}
                </div>
              ))
            )}
          </div>
          </TerminalPanel>
        </Section>
      </section>

      {/* Join */}
      <JoinCta />
    </>
  );
}
