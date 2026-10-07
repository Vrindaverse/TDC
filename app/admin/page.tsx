import { count, eq } from "drizzle-orm";
import {
  ArrowRight,
  CalendarDays,
  Inbox,
  Ticket,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const [memberCount] = await db
    .select({ value: count() })
    .from(profiles);
  const [eventCount] = await db.select({ value: count() }).from(events);
  const [registrationCount] = await db
    .select({ value: count() })
    .from(registrations);
  const [unreadMessageCount] = await db
    .select({ value: count() })
    .from(contactMessages)
    .where(eq(contactMessages.status, "new"));

  const recentRegistrations = await sql`
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
  `;

  const recentMembers = await sql`
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
  `;

  const recentMessages = await sql`
    select m.id         as "id",
           m.subject    as subject,
           m.status     as status,
           m.created_at as "createdAt",
           p.name       as name
      from public.contact_messages m
      join public.profiles p on p.id = m.profile_id
     order by m.created_at desc
     limit 5
  `;

  const weeklySignups = await sql`
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
  `;

  const registrationsByEvent = await sql`
    select e.title as title,
           count(r.id)::int as n
      from public.events e
      left join public.registrations r on r.event_id = e.id
     group by e.id, e.title
     order by n desc
     limit 8
  `;

  const membersByCollege = await sql`
    select c.name as college,
           count(p.id)::int as n
      from public.profiles p
      join public.colleges c on c.id = p.college_id
     group by c.name
     order by n desc
     limit 8
  `;

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
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border bg-card px-5 py-4">
        <div className="flex flex-col gap-1">
          <p className="tdc-mono-label text-[11px] text-primary">consoles / overview</p>
          <h1 className="text-xl font-semibold tracking-tight">Admin console</h1>
          <p className="text-sm text-muted-foreground">
            Everything happening across the community, at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/messages"
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Inbox aria-hidden="true" className="size-3.5" />
            Messages
          </Link>
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <CalendarDays aria-hidden="true" className="size-3.5" />
            New event
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const body = (
            <Card className="h-full">
              <CardContent className="flex items-center justify-between gap-4 py-5">
                <div className="flex flex-col gap-1">
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="text-3xl tabular-nums">
                    {stat.value}
                  </CardTitle>
                </div>
                {Icon ? (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
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
              className="transition-transform hover:-translate-y-0.5"
            >
              {body}
            </Link>
          ) : (
            <div key={stat.label}>{body}</div>
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
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle>Latest members</CardTitle>
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
              <ul className="flex flex-col gap-3">
                {recentMembers.map((row) => (
                  <li
                    key={row.email}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate font-medium">{row.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {row.email}
                        {row.college ? ` · ${row.college}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {row.role === "ADMIN" ? <Badge>Admin</Badge> : null}
                      <Badge variant="outline">
                        {formatDate(row.createdAt)}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle>Latest messages</CardTitle>
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
              <ul className="flex flex-col gap-3">
                {recentMessages.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
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
                    >
                      {row.status === "new" ? "New" : "Read"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle>Latest registrations</CardTitle>
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
              <ul className="flex flex-col gap-3">
                {recentRegistrations.map((row, index) => (
                  <li
                    key={`${row.email}-${String(row.createdAt)}-${index}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{row.name}</span>
                    <span className="text-muted-foreground">{row.title}</span>
                    <Badge variant="secondary">{row.email}</Badge>
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {items.map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <span
                  className={`shrink-0 truncate text-xs text-muted-foreground ${labelWidth}`}
                >
                  {item.label}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${Math.max(4, (item.n / max) * 100)}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums">
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