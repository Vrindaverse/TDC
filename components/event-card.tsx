"use client";

import { CsrfInput } from "@/components/csrf-input";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Loader2,
  MapPin,
  TriangleAlert,
  UserCheck,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useActionState } from "react";
import type { RegisterEventState } from "@/app/events/actions";
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
  /** Server action for registration (overrides action link). */
  formAction?: (
    prev: RegisterEventState,
    formData: FormData
  ) => Promise<RegisterEventState>;
  /** Fallback link action for non-registration cases. */
  action?: { label: string; href: string; onClick?: (e: React.MouseEvent) => void } | null;
}

export function EventCard({
  event,
  showTime = false,
  showRegistration = false,
  past = false,
  formAction,
  action: actionLink,
}: EventCardProps) {
  const status = statusMeta[event.registrationStatus];
  const StatusIcon = past ? UserCheck : status.icon;
  const statusLabel = past ? "Completed" : status.label;
  const statusVariant = past ? "outline" : status.variant;
  const showBadge = showRegistration || past;

  const [state, formActionResult, pending] = useActionState(
    formAction ?? (async () => null),
    null
  );

  return (
    <article className="group relative flex cursor-target flex-col overflow-hidden rounded-2xl border bg-card/80 p-6 shadow-sm">
      {event.poster && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 grayscale-0"
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

      {formAction && !past ? (
        <form action={formActionResult} className="relative mt-auto pt-6">
          <CsrfInput />
          <input type="hidden" name="eventId" value={event.id} />
          <Button type="submit" size="sm" className="group/button w-full shadow-sm" disabled={pending}>
            {pending ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                Registering…
              </>
            ) : (
              "Register"
            )}
            <ArrowRight aria-hidden="true" className="transition-transform group-hover/button:translate-x-0.5" />
          </Button>
          {state?.error ? (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}
        </form>
      ) : actionLink && !past ? (
        <div className="relative mt-auto pt-6">
          <Button asChild size="sm" className="group/button w-full shadow-sm">
            <a href={actionLink.href} onClick={actionLink.onClick}>
              {actionLink.label}
              <ArrowRight aria-hidden="true" className="transition-transform group-hover/button:translate-x-0.5" />
            </a>
          </Button>
        </div>
      ) : (
        <div className="relative mt-auto pt-6" />
      )}
    </article>
  );
}