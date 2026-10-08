import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { and, asc, desc, eq, gt, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { cacheLife } from "next/cache";

import { Hero } from "@/components/hero";
import { DomainMarquee } from "@/components/domain-marquee";
import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProfile, getSession } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { announcements, events } from "@/lib/db/schema";
import { dbEventToItem } from "@/lib/events";
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
    <section className="border-b bg-muted/10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-10 sm:px-6">
        <p className="tdc-mono text-xs uppercase tracking-wider text-muted-foreground">
          tdc / announcements
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border bg-card/60 p-4 text-sm shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-semibold tracking-tight">{item.title}</h3>
                {item.pinned ? (
                  <Badge variant="secondary">Pinned</Badge>
                ) : null}
              </div>
              <p className="line-clamp-4 whitespace-pre-wrap text-muted-foreground">
                {item.body}
              </p>
            </article>
          ))}
        </div>
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

      <Suspense>
        <PublicAnnouncements />
      </Suspense>

      {/* Domain stream */}
      <div className="tdc-reveal border-b bg-muted/40 py-6">
        <DomainMarquee items={tickerItems} />
      </div>

      {/* Story */}
      <Section>
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
      </Section>

      {/* Tracks */}
      <section className="border-t">
        <Section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Tracks we teach
            </h2>
            <span className="tdc-mono text-xs text-muted-foreground">
              {String(domains.length).padStart(2, "0")} tracks
            </span>
          </div>
          <ol className="mt-8 divide-y border-y">
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
        </Section>
      </section>

      {/* How it works */}
      <Section>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          How it works
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {entrySteps.map((step, index) => (
            <div
              key={step.id}
              className="rounded-xl border bg-card/50 p-5 shadow-sm"
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
      </Section>

      {/* Upcoming */}
      <section className="border-t bg-muted/20">
        <Section>
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
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {featuredEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground sm:col-span-3">
                Season details coming soon.
              </p>
            ) : (
              featuredEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col gap-3 rounded-xl border bg-card/50 p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="tdc-mono text-xs text-muted-foreground">
                      {event.date}
                    </p>
                    <Badge
                      variant="outline"
                      className="tdc-mono rounded-none text-[10px] uppercase tracking-wide"
                    >
                      {event.registrationStatus}
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold tracking-tight">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {event.location || "TDC Campus"} · {event.time}
                  </p>
                  <Link
                    href={`/join?event=${event.id}`}
                    className="tdc-mono tdc-underline mt-auto inline-flex items-center gap-1.5 text-xs text-foreground"
                  >
                    register
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </Section>
      </section>

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
