import { desc } from "drizzle-orm";
import { CalendarDays, Plus, Ticket } from "lucide-react";
import Link from "next/link";

import { DeleteEventButton } from "@/components/admin/delete-event-button";
import { setEventRegistrationStatusAction } from "@/app/admin/events/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db, sql } from "@/lib/db";
import { events } from "@/lib/db/schema";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const statusMeta: Record<
  "open" | "closing" | "closed",
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  open: { label: "Open", variant: "default" },
  closing: { label: "Closing soon", variant: "secondary" },
  closed: { label: "Closed", variant: "outline" },
};

const STATUS_ORDER: ("open" | "closing" | "closed")[] = [
  "open",
  "closing",
  "closed",
];

export const instant = false;

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const rows = await db
    .select()
    .from(events)
    .orderBy(desc(events.startsAt))
    .limit(100);

  const countRows = await sql`
    select e.id as id, count(r.id)::int as n
      from public.events e
      left join public.registrations r on r.event_id = e.id
     group by e.id
  `;
  const countById = new Map(
    ((countRows as { id: string; n: number }[]) ?? []).map((row) => [
      row.id,
      row.n,
    ])
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border bg-card px-5 py-4">
        <div className="flex flex-col gap-1">
          <p className="tdc-mono-label text-[11px] text-primary">
            consoles / events
          </p>
          <h1 className="text-xl font-semibold tracking-tight">Events</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} upcoming and past event{rows.length === 1 ? "" : "s"}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <Link href="/api/admin/export/events">
          <Button variant="outline">Download CSV</Button>
        </Link>
        <Link href="/admin/events/new">
          <Button className="inline-flex items-center gap-1.5">
            <Plus aria-hidden="true" className="size-4" />
            New event
          </Button>
        </Link>
      </div>
      </header>

      <Card>
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarDays aria-hidden="true" className="size-5" />
          </span>
          <CardTitle className="text-sm font-semibold">
            All events
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {error === "delete" ? (
            <div
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              We couldn&apos;t delete that event. Please try again.
            </div>
          ) : null}
          {error === "status" ? (
            <div
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              We couldn&apos;t update registration status. Please try again.
            </div>
          ) : null}
          {error === "not_found" ? (
            <div
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              That event no longer exists.
            </div>
          ) : null}

          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No events yet. Create the first one.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {rows.map((event) => {
                const status =
                  event.registrationStatus as "open" | "closing" | "closed";
                const registrantCount = countById.get(event.id) ?? 0;
                return (
                  <li
                    key={event.id}
                    className="flex flex-wrap items-start justify-between gap-3 rounded-md border p-3"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="text-sm font-medium">{event.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(event.startsAt)}
                        {event.location ? ` · ${event.location}` : ""}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary" className="text-xs">
                          {event.domain}
                        </Badge>
                        <Link
                          href={`/admin/registrations?event=${event.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
                        >
                          <Ticket aria-hidden="true" className="size-3.5" />
                          {registrantCount} registrant
                          {registrantCount === 1 ? "" : "s"}
                        </Link>
                        <Badge variant={statusMeta[status].variant} className="text-xs">
                          {statusMeta[status].label}
                        </Badge>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1">
                        {STATUS_ORDER.map((candidate) => (
                          <form
                            key={candidate}
                            action={setEventRegistrationStatusAction}
                          >
                            <input type="hidden" name="id" value={event.id} />
                            <input
                              type="hidden"
                              name="registrationStatus"
                              value={candidate}
                            />
                            <Button
                              type="submit"
                              size="sm"
                              variant={candidate === status ? "default" : "ghost"}
                              className={candidate === status ? "" : "text-muted-foreground"}
                              aria-label={`Set registration status to ${candidate}`}
                              aria-pressed={candidate === status}
                              disabled={candidate === status}
                            >
                              {statusMeta[candidate].label}
                            </Button>
                          </form>
                        ))}
                      </div>
                      <Link href={`/admin/events/${event.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <DeleteEventButton id={event.id} title={event.title} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
