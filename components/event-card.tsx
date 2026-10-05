import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  TriangleAlert,
  UserCheck,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EventItem, RegistrationStatus } from "@/lib/site-data";

const statusMeta: Record<
  RegistrationStatus,
  { label: string; variant: "default" | "secondary" | "outline"; icon: typeof UserCheck }
> = {
  open: { label: "Registration open", variant: "default", icon: UserCheck },
  closing: {
    label: "Closing soon",
    variant: "secondary",
    icon: TriangleAlert,
  },
  closed: { label: "Registration closed", variant: "outline", icon: XCircle },
};

interface EventCardProps {
  event: EventItem;
  /** Events pages show the time; the home page teaser omits it. */
  showTime?: boolean;
  /** Renders a badge describing whether registration is still possible. */
  showRegistration?: boolean;
  /** Marks the event as already finished: no action button, "Completed" badge. */
  past?: boolean;
  action?: { label: string; href: string };
}

/**
 * Shared event card for the home page teaser and the events listing.
 */
export function EventCard({
  event,
  showTime = false,
  showRegistration = false,
  past = false,
  action,
}: EventCardProps) {
  const status = statusMeta[event.registrationStatus];
  const StatusIcon = past ? UserCheck : status.icon;
  const statusLabel = past ? "Completed" : status.label;
  const statusVariant = past ? "outline" : status.variant;
  const showBadge = showRegistration || past;

  return (
    <article className="group relative flex cursor-target flex-col overflow-hidden rounded-2xl border bg-card/80 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {event.poster && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-0 grayscale transition-all duration-500 group-hover:opacity-10 group-hover:grayscale-0"
          style={{ backgroundImage: `url(${event.poster})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-card/95 via-card/40 to-transparent" />
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        {showBadge ? (
          <Badge variant={statusVariant} className="shadow-sm">
            <StatusIcon aria-hidden="true" />
            {statusLabel}
          </Badge>
        ) : null}
        <span className="inline-flex items-center rounded-full border bg-muted/60 px-2.5 py-0.5 text-xs font-medium tracking-wide text-muted-foreground uppercase backdrop-blur-sm">
          {event.domain}
        </span>
      </div>

      <h3 className="relative mt-5 text-lg font-semibold leading-tight text-card-foreground">
        {event.title}
      </h3>

      <dl className="relative mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2.5">
          <dt className="sr-only">Date</dt>
          <CalendarDays className="size-4 shrink-0 text-foreground/60" aria-hidden="true" />
          <dd className="font-medium">{event.date}</dd>
        </div>
        {showTime ? (
          <div className="flex items-center gap-2.5">
            <dt className="sr-only">Time</dt>
            <Clock className="size-4 shrink-0 text-foreground/60" aria-hidden="true" />
            <dd>{event.time}</dd>
          </div>
        ) : null}
        <div className="flex items-start gap-2.5">
          <dt className="sr-only">Venue</dt>
          <MapPin className="mt-0.5 size-4 shrink-0 text-foreground/60" aria-hidden="true" />
          <dd>{event.location}</dd>
        </div>
      </dl>

      <p className="relative mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {event.description}
      </p>

      {action && !past ? (
        <div className="relative mt-auto pt-6">
          <Button asChild size="sm" className="group/button w-full shadow-sm">
            <Link href={action.href}>
              {action.label}
              <ArrowRight aria-hidden="true" className="transition-transform group-hover/button:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="relative mt-auto pt-6" />
      )}
    </article>
  );
}