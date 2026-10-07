import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EventForm } from "@/components/admin/event-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { resolvePosterUrl } from "@/lib/avatar";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";

export const instant = false;

export default async function AdminEventEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const rows = await db
    .select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1);
  const event = rows[0];
  if (!event) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="tdc-mono-label">tdc / admin / events</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Edit event
          </h2>
        </div>
        <Link href="/admin/events">
          <Button variant="outline" size="sm">
            Back to events
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>
            Changes are saved to the events listing right away.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventForm
            posterPreviewUrl={resolvePosterUrl(event.poster)}
            event={{
              ...event,
              registrationStatus: event.registrationStatus as
                | "open"
                | "closing"
                | "closed",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
