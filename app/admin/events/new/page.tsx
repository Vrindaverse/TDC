import { ArrowLeft, CalendarDays } from "lucide-react";
import Link from "next/link";

import { EventForm } from "@/components/admin/event-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminNewEventPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border bg-card px-5 py-4">
        <div className="flex flex-col gap-1">
          <p className="tdc-mono-label text-[11px] text-primary">
            consoles / events / new
          </p>
          <h1 className="text-xl font-semibold tracking-tight">Create event</h1>
          <p className="text-sm text-muted-foreground">
            New events show up on the public site immediately after creation.
          </p>
        </div>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Back to events
        </Link>
      </header>

      <Card>
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarDays aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Event details</h2>
            <p className="text-xs text-muted-foreground">
              Title, poster, domain, dates and registration status.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <EventForm />
        </CardContent>
      </Card>
    </div>
  );
}