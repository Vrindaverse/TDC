import { count, eq } from "drizzle-orm";
import {
  ArrowRight,
  CalendarDays,
  Inbox,
  Ticket,
  Users,
} from "lucide-react";
import Link from "next/link";
import { unstable_noStore } from "next/cache";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { db, sql } from "@/lib/db";
import {
  contactMessages,
  events,
  profiles,
  registrations,
} from "@/lib/db/schema";

export const instant = false;

function formatDate(value: Date | string | null | undefined) {
  if (value == null) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminOverviewPage() {
  unstable_noStore();
  
  async function safeQuery<T>(query: Promise<T>, fallback: T, label: string): Promise<T> {
    try {
      return await query;
    } catch (err) {
      console.error(`[admin/overview] ${label} query failed:`, err);
      return fallback;
    }
  }

  const [memberCount] = await safeQuery(
    db.select({ value: count() }).from(profiles),
    [{ value: 0 }],
    "memberCount"
  );
  const [eventCount] = await safeQuery(
    db.select({ value: count() }).from(events),
    [{ value: 0 }],
    "eventCount"
  );
  const [registrationCount] = await safeQuery(
    db.select({ value: count() }).from(registrations),
    [{ value: 0 }],
    "registrationCount"
  );
  const [unreadMessageCount] = await safeQuery(
    db.select({ value: count() }).from(contactMessages).where(eq(contactMessages.status, "new")),
    [{ value: 0 }],
    "unreadMessageCount"
  );

  const recentRegistrations = await safeQuery(
    sql`
      select r.created_at as "createdAt",
             e.title       as title,
             p.name        as name,
             u.email       as email
        from public.registrations r
        join public.events e   on e.id = r.event_id
        join public.profiles p on p.id = r.profile_id
        join neon_auth."user" u on u.id = p.user_id
       order by r.created_at desc
       limit 5
    `,
    [],
    "recentRegistrations"
  );

  const recentMembers = await safeQuery(
    sql`
      select p.created_at as "createdAt",
             p.role       as role,
             p.name       as name,
             u.email      as email,
             c.name       as college
        from public.profiles p
        join neon_auth."user" u on u.id = p.user_id
        left join public.colleges c on c.id = p.college_id
       order by p.created_at desc
       limit 5
    `,
    [],
    "recentMembers"
  );

  const recentMessages = await safeQuery(
    sql`
      select m.id         as "id",
             m.subject    as subject,
             m.status     as status,
             m.created_at as "createdAt",
             p.name       as name
        from public.contact_messages m
        join public.profiles p on p.id = m.profile_id
       order by m.created_at desc
       limit 5
    `,
    [],
    "recentMessages"
  );

  const weeklySignups = await safeQuery(
    sql`
      select to_char(week_start, 'Mon DD') as label,
             count(p.id)::int as n
        from generate_series(
               date_trunc('week', now()) - interval '7 weeks',
               date_trunc('week', now()),
               interval '1 week'
             ) as week_start
        left join public.profiles p
               on p.created_at >= week_start
              and p.created_at <  week_start + interval '1 week'
       group by label, week_start
       order by week_start
    `,
    [],
    "weeklySignups"
  );

  const registrationsByEvent = await safeQuery(
    sql`
      select e.title as title,
             count(r.id)::int as n
        from public.events e
        left join public.registrations r on r.event_id = e.id
       group by e.id, e.title
       order by n desc
       limit 8
    `,
    [],
    "registrationsByEvent"
  );

  const membersByCollege = await safeQuery(
    sql`
      select c.name as college,
             count(p.id)::int as n
        from public.profiles p
        join public.colleges c on c.id = p.college_id
       group by c.name
       order by n desc
       limit 8
    `,
    [],
    "membersByCollege"
  );

  const stats = [
    {
      label: "Members",
      value: memberCount.value,
      href: "/admin/users",
      icon: Users,
    },
    {
      label: "Events",
      value: eventCount.value,
      href: "/admin/events",
      icon: CalendarDays,
    },
    {
      label: "Registrations",
      value: registrationCount.value,
      href: "/admin/registrations",
      icon: Ticket,
    },
    {
      label: "Messages",
      value: unreadMessageCount.value,
      href: "/admin/messages",
      icon: Inbox,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border bg-gradient-to-r from-card to-card/80 px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <p className="tdc-mono-label text-[11px] text-primary">consoles / overview</p>
          <h1 className="text-2xl font-bold tracking-tight">Admin console</h1>
          <p className="text-sm text-muted-foreground">
            Everything happening across the community, at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/messages"
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary/40 hover:bg-accent/40 hover:text-foreground"
          >
            <Inbox aria-hidden="true" className="size-4" />
            Messages
          </Link>
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-primary to-primary/90 px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-md hover:brightness-105"
          >
            <CalendarDays aria-hidden="true" className="size-4" />
            New event
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const body = (
            <Card className="h-full admin-card-hover border bg-gradient-to-br from-card to-card/80 shadow-sm">
              <CardContent className="flex items-center justify-between gap-4 py-5">
                <div className="flex flex-col gap-1.5">
                  <CardDescription className="text-xs font-medium uppercase tracking-wider">
                    {stat.label}
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold tabular-nums">
                    {stat.value}
                  </CardTitle>
                </div>
                {Icon ? (
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary admin-stat-icon">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                ) : null}
              </CardContent>
            </Card>
          );
          return stat.href ? (
            <Link
              key={stat.label}
              href={stat.href}
              className="block transition-transform hover:-translate-y-0.5"
            >
              {body}
            </Link>
          ) : (
            <div key={stat.label} className="block">{body}</div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <TrendCard
          title="Sign-ups per week"
          description="New members, last 8 weeks."
          items={(weeklySignups as { label: string; n: number }[]).map(
            (row) => ({ label: row.label, n: row.n })
          )}
          labelWidth="w-16"
        />
        <TrendCard
          title="Registrations by event"
          description="Sign-ups per event, most first."
          items={(registrationsByEvent as { title: string; n: number }[]).map(
            (row) => ({ label: row.title, n: row.n })
          )}
          labelWidth="w-32"
        />
        <TrendCard
          title="Members by college"
          description="College distribution of members."
          items={(membersByCollege as { college: string; n: number }[]).map(
            (row) => ({ label: row.college, n: row.n })
          )}
          labelWidth="w-32"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="admin-card-hover border shadow-sm">
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">Latest members</CardTitle>
              <CardDescription>The five most recent sign-ups.</CardDescription>
            </div>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {recentMembers.map((row) => (
                  <li
                    key={row.email}
                    className="group flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/60 px-3 py-2.5 text-sm transition-colors hover:border-primary/30 hover:bg-accent/30"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate font-medium">{row.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {row.email}
                        {row.college ? ` · ${row.college}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {row.role === "ADMIN" ? <Badge className="text-[10px]">Admin</Badge> : null}
                      <Badge variant="outline" className="text-[10px]">
                        {formatDate(row.createdAt)}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="admin-card-hover border shadow-sm">
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">Latest messages</CardTitle>
              <CardDescription>
                The five most recent contact messages.
              </CardDescription>
            </div>
            <Link
              href="/admin/messages"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No messages yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {recentMessages.map((row) => (
                  <li
                    key={row.id}
                    className={cn(
                      "group flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                      row.status === "new"
                        ? "border-primary/30 bg-primary/5 hover:border-primary/50"
                        : "border-border/60 bg-card/60 hover:border-primary/30 hover:bg-accent/30"
                    )}
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate font-medium">
                        {row.subject}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        from {row.name}
                      </span>
                    </div>
                    <Badge
                      variant={row.status === "new" ? "default" : "outline"}
                      className={cn(
                        "text-[10px]",
                        row.status === "new" && "admin-badge-live"
                      )}
                    >
                      {row.status === "new" ? "New" : "Read"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="admin-card-hover border shadow-sm">
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">Latest registrations</CardTitle>
              <CardDescription>
                The five most recent event registrations.
              </CardDescription>
            </div>
            <Link
              href="/admin/registrations"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentRegistrations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No registrations yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {recentRegistrations.map((row, index) => (
                  <li
                    key={`${row.email}-${String(row.createdAt)}-${index}`}
                    className="group flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/60 px-3 py-2.5 text-sm transition-colors hover:border-primary/30 hover:bg-accent/30"
                  >
                    <span className="font-medium">{row.name}</span>
                    <span className="text-muted-foreground">{row.title}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {row.email}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TrendCard({
  title,
  description,
  items,
  labelWidth,
}: {
  title: string;
  description: string;
  items: { label: string; n: number }[];
  labelWidth: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.n));

  return (
    <Card className="admin-card-hover border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <span
                  className={`shrink-0 truncate text-xs font-medium text-muted-foreground ${labelWidth}`}
                >
                  {item.label}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted/80">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                    style={{ width: `${Math.max(4, (item.n / max) * 100)}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs font-bold tabular-nums">
                  {item.n}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}