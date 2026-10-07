"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  createEventAction,
  updateEventAction,
  type EventFormState,
} from "@/app/admin/events/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fieldErrorsFromZod, type FieldErrors } from "@/lib/validation/auth";
import {
  eventSchema,
  registrationStatuses,
  type RegistrationStatusValue,
} from "@/lib/validation/events";

type Values = {
  title: string;
  description: string;
  location: string;
  poster: string;
  domain: string;
  registrationStatus: RegistrationStatusValue;
  startsAt: string;
  endsAt: string;
};

const FIELDS: (keyof Values)[] = [
  "title",
  "description",
  "location",
  "poster",
  "domain",
  "registrationStatus",
  "startsAt",
  "endsAt",
];

export const EVENT_POSTERS = [
  "/images/events/hackathon-2026-01.svg",
  "/images/events/build-night-2026-10.svg",
  "/images/events/webcraft-workshop-2026-02.svg",
  "/images/events/ctf-workshop-2026-11.svg",
  "/images/events/intro-to-ai-ml-2026-11.svg",
  "/images/events/dsa-clinic-2026-01.svg",
  "/images/events/tdc-season-3.svg",
];

export const EVENT_DOMAINS = [
  "Web Development",
  "App Development",
  "AI / ML",
  "Cybersecurity",
  "IoT",
  "Cloud",
  "Competitive Programming",
  "Open Source",
  "Multi-domain",
];

function toDateTimeLocal(date: Date | null | undefined): string {
  if (!date) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

export function EventForm({
  event,
}: {
  event?: {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    poster: string | null;
    domain: string;
    registrationStatus: RegistrationStatusValue;
    startsAt: Date;
    endsAt: Date | null;
  };
}) {
  const action = event ? updateEventAction : createEventAction;
  const [state, formAction, pending] = useActionState<
    EventFormState,
    FormData
  >(action, null);
  const [values, setValues] = useState<Values>({
    title: event?.title ?? "",
    description: event?.description ?? "",
    location: event?.location ?? "",
    poster: event?.poster ?? "/images/events/hackathon-2026-01.svg",
    domain: event?.domain ?? "Web Development",
    registrationStatus: event?.registrationStatus ?? "open",
    startsAt: toDateTimeLocal(event?.startsAt),
    endsAt: toDateTimeLocal(event?.endsAt),
  });
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [edited, setEdited] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const first = FIELDS.find((field) => state?.fieldErrors?.[field]);
    if (first) document.getElementById(`event-${first}`)?.focus();
  }, [state]);

  const displayErrors = useMemo<FieldErrors>(() => {
    const merged: FieldErrors = {};
    for (const field of FIELDS) {
      const error =
        clientErrors[field] ??
        (edited[field] ? undefined : state?.fieldErrors?.[field]);
      if (error) merged[field] = error;
    }
    return merged;
  }, [clientErrors, edited, state]);

  const update = (field: keyof Values, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setEdited((previous) => ({ ...previous, [field]: true }));
    setClientErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (event_: FormEvent<HTMLFormElement>) => {
    const parsed = eventSchema.safeParse(values);
    if (!parsed.success) {
      event_.preventDefault();
      const nextErrors = fieldErrorsFromZod(parsed.error);
      setClientErrors(nextErrors);
      const first = FIELDS.find((field) => nextErrors[field]);
      if (first) document.getElementById(`event-${first}`)?.focus();
    }
  };

  const fieldProps = (field: keyof Values) => ({
    id: `event-${field}`,
    name: field,
    value: values[field],
    onChange: (
      changeEvent: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => update(field, changeEvent.target.value),
    "aria-invalid": Boolean(displayErrors[field]) || undefined,
    "aria-describedby": displayErrors[field]
      ? `event-${field}-error`
      : undefined,
  });

  const selectProps = (field: keyof Values) => ({
    id: `event-${field}`,
    name: field,
    value: values[field],
    onChange: (changeEvent: React.ChangeEvent<HTMLSelectElement>) =>
      update(field, changeEvent.target.value),
    "aria-invalid": Boolean(displayErrors[field]) || undefined,
    "aria-describedby": displayErrors[field]
      ? `event-${field}-error`
      : undefined,
  });

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5"
    >
      {event ? <input type="hidden" name="id" value={event.id} /> : null}

      {state?.error ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="event-title">Title</Label>
        <Input
          {...fieldProps("title")}
          type="text"
          placeholder="Hackathon 2026"
          disabled={pending}
        />
        <FieldError id="event-title-error" message={displayErrors.title} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="event-description">Description</Label>
        <Textarea
          {...fieldProps("description")}
          rows={4}
          placeholder="What is this event about?"
          disabled={pending}
        />
        <FieldError
          id="event-description-error"
          message={displayErrors.description}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="event-location">Location</Label>
        <Input
          {...fieldProps("location")}
          type="text"
          placeholder="Seminar Hall, Block B"
          disabled={pending}
        />
        <FieldError
          id="event-location-error"
          message={displayErrors.location}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="event-domain">Domain</Label>
          <Select {...selectProps("domain")} disabled={pending}>
            {EVENT_DOMAINS.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </Select>
          <FieldError id="event-domain-error" message={displayErrors.domain} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="event-registrationStatus">
            Registration status
          </Label>
          <Select
            {...selectProps("registrationStatus")}
            disabled={pending}
          >
            {registrationStatuses.map((status) => (
              <option key={status} value={status}>
                {status === "open"
                  ? "Open"
                  : status === "closing"
                    ? "Closing soon"
                    : "Closed"}
              </option>
            ))}
          </Select>
          <FieldError
            id="event-registrationStatus-error"
            message={displayErrors.registrationStatus}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="event-poster">Poster</Label>
        <Select {...selectProps("poster")} disabled={pending}>
          {EVENT_POSTERS.map((poster) => (
            <option key={poster} value={poster}>
              {poster.split("/").pop()}
            </option>
          ))}
        </Select>
        <FieldError id="event-poster-error" message={displayErrors.poster} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="event-startsAt">Starts at</Label>
          <Input
            {...fieldProps("startsAt")}
            type="datetime-local"
            disabled={pending}
          />
          <FieldError
            id="event-startsAt-error"
            message={displayErrors.startsAt}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="event-endsAt">Ends at (optional)</Label>
          <Input
            {...fieldProps("endsAt")}
            type="datetime-local"
            disabled={pending}
          />
          <FieldError
            id="event-endsAt-error"
            message={displayErrors.endsAt}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Saving…
            </>
          ) : event ? (
            "Save changes"
          ) : (
            "Create event"
          )}
        </Button>
      </div>
    </form>
  );
}