"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

import { CsrfInput } from "@/components/csrf-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RegisterEventState } from "@/app/events/actions";
import type { EventItem, RegistrationStatus } from "@/lib/site-data";

type StatusMeta = {
  label: string;
  tag: string;
  dot: string;
};

const statusMeta: Record<RegistrationStatus, StatusMeta> = {
  open: {
    label: "open",
    tag: "border-primary/50 bg-primary/10 text-foreground",
    dot: "bg-primary animate-pulse",
  },
  closing: {
    label: "closing soon",
    tag: "border-dashed border-primary/50 text-foreground",
    dot: "bg-primary animate-pulse",
  },
  closed: {
    label: "closed",
    tag: "border-border text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

const pastStatus: StatusMeta = {
  label: "completed",
  tag: "border-border text-muted-foreground",
  dot: "bg-muted-foreground",
};

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
  action?: {
    label: string;
    href: string;
    onClick?: (e: React.MouseEvent) => void;
  } | null;
}

export function EventCard({
  event,
  showTime = false,
  showRegistration = false,
  past = false,
  formAction,
  action: actionLink,
}: EventCardProps) {
  const meta = past ? pastStatus : statusMeta[event.registrationStatus];
  const showBadge = showRegistration || past;
  const [state, formActionResult, pending] = useActionState(
    formAction ?? (async () => null),
    null
  );

  const path = `~/tdc/events/${slug(event.domain || "general")}`;

  return (
    <article className="tdc-card-hover group relative flex h-full cursor-target flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
      {event.poster ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.06] grayscale"
          style={{ backgroundImage: `url(${event.poster})` }}
        />
      ) : null}

      <div
        aria-hidden="true"
        className="relative flex items-center gap-2 border-b bg-muted/40 px-3 py-2"
      >
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground/30" />
          <span className="size-2 rounded-full bg-muted-foreground/30" />
          <span className="size-2 rounded-full bg-muted-foreground/30" />
        </span>
        <span className="tdc-mono ml-1.5 truncate text-[11px] tracking-wide text-muted-foreground">
          {path}
        </span>
        {showBadge ? (
          <span
            className={cn(
              "tdc-mono ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] tracking-widest uppercase",
              meta.tag
            )}
          >
            <span className={cn("size-1.5 rounded-full", meta.dot)} />
            {meta.label}
          </span>
        ) : null}
      </div>

      <div className="relative flex flex-1 flex-col p-5">
        <span className="tdc-mono w-fit rounded-sm border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] tracking-widest text-muted-foreground uppercase">
          {event.domain}
        </span>

        <p className="tdc-mono mt-4 truncate text-[11px] text-muted-foreground">
          <span aria-hidden="true" className="text-primary">
            $
          </span>{" "}
          tdc events --show {slug(event.title)}
        </p>
        <h3 className="mt-1.5 text-lg leading-tight font-semibold tracking-tight text-card-foreground">
          {event.title}
        </h3>

        <dl className="tdc-mono mt-4 space-y-1.5 text-xs">
          <div className="flex min-w-0 items-baseline gap-2">
            <dt className="w-12 shrink-0 text-muted-foreground">date</dt>
            <dd className="truncate text-foreground">{event.date}</dd>
          </div>
          {showTime ? (
            <div className="flex min-w-0 items-baseline gap-2">
              <dt className="w-12 shrink-0 text-muted-foreground">time</dt>
              <dd className="truncate text-foreground">{event.time}</dd>
            </div>
          ) : null}
          <div className="flex min-w-0 items-baseline gap-2">
            <dt className="w-12 shrink-0 text-muted-foreground">venue</dt>
            <dd className="truncate text-foreground">{event.location}</dd>
          </div>
        </dl>

        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {event.description}
        </p>

        {formAction && !past ? (
          <form action={formActionResult} className="relative mt-auto pt-6">
            <CsrfInput />
            <input type="hidden" name="eventId" value={event.id} />
            <Button
              type="submit"
              size="sm"
              className="group/button w-full"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  registering…
                </>
              ) : (
                <>
                  <span aria-hidden="true" className="opacity-60">
                    $
                  </span>
                  register
                </>
              )}
              {!pending ? (
                <ArrowRight
                  aria-hidden="true"
                  className="transition-transform group-hover/button:translate-x-0.5"
                />
              ) : null}
            </Button>
            {state?.error ? (
              <p
                className="tdc-mono mt-2 text-xs text-destructive"
                role="alert"
              >
                <span aria-hidden="true">! </span>
                {state.error}
              </p>
            ) : null}
          </form>
        ) : actionLink && !past ? (
          <div className="relative mt-auto pt-6">
            <Button asChild size="sm" className="group/button w-full">
              <Link href={actionLink.href} onClick={actionLink.onClick}>
                {actionLink.label}
                <ArrowRight
                  aria-hidden="true"
                  className="transition-transform group-hover/button:translate-x-0.5"
                />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="tdc-mono relative mt-auto pt-6 text-[11px] text-muted-foreground">
            {past ? (
              <span className="tdc-caret">
                {"// archived — recap coming soon"}
              </span>
            ) : (
              <span>&nbsp;</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
