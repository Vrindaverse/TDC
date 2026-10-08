"use client";

import { CsrfInput } from "@/components/csrf-input";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  createAnnouncementAction,
  updateAnnouncementAction,
  type AnnouncementFormState,
} from "@/app/admin/announcements/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { announcementSchema } from "@/lib/validation/announcements";
import { fieldErrorsFromZod, type FieldErrors } from "@/lib/validation/auth";

type Values = { title: string; body: string; audience: string; teamId: string };

const FIELDS: (keyof Values)[] = ["title", "body", "audience", "teamId"];

const AUDIENCE_OPTIONS = [
  { value: "all", label: "Everyone (members + visitors)" },
  { value: "members", label: "All approved members" },
  { value: "team", label: "A specific team" },
  { value: "visitors", label: "Visitors (public site)" },
];

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

export function AnnouncementForm({
  announcement,
  teams = [],
}: {
  announcement?: {
    id: string;
    title: string;
    body: string;
    audience: string;
    teamId: string | null;
  };
  teams?: { id: string; name: string }[];
} = {}) {
  const action = announcement ? updateAnnouncementAction : createAnnouncementAction;
  const [state, formAction, pending] = useActionState<
    AnnouncementFormState,
    FormData
  >(action, null);
  const [values, setValues] = useState<Values>({
    title: announcement?.title ?? "",
    body: announcement?.body ?? "",
    audience: announcement?.audience ?? "all",
    teamId: announcement?.teamId ?? "",
  });
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [edited, setEdited] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const first = FIELDS.find((field) => state?.fieldErrors?.[field]);
    if (first) document.getElementById(`announcement-${first}`)?.focus();
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const parsed = announcementSchema.safeParse({
      ...values,
      teamId: values.audience === "team" ? values.teamId : "",
    });
    if (!parsed.success) {
      event.preventDefault();
      const nextErrors = fieldErrorsFromZod(parsed.error);
      setClientErrors(nextErrors);
      const first = FIELDS.find((field) => nextErrors[field]);
      if (first) document.getElementById(`announcement-${first}`)?.focus();
    }
  };

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4"
    >
      <CsrfInput />
      {announcement ? (
        <input type="hidden" name="id" value={announcement.id} />
      ) : null}

      {state?.error ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="announcement-title">Title</Label>
        <Input
          id="announcement-title"
          name="title"
          value={values.title}
          onChange={(event) => update("title", event.target.value)}
          placeholder="e.g. Update: fetch-a-thon venue change"
          disabled={pending}
          aria-invalid={Boolean(displayErrors.title) || undefined}
          aria-describedby={
            displayErrors.title ? "announcement-title-error" : undefined
          }
        />
        <FieldError id="announcement-title-error" message={displayErrors.title} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="announcement-body">Body</Label>
        <Textarea
          id="announcement-body"
          name="body"
          value={values.body}
          onChange={(event) => update("body", event.target.value)}
          rows={4}
          placeholder="What should members know?"
          disabled={pending}
          aria-invalid={Boolean(displayErrors.body) || undefined}
          aria-describedby={
            displayErrors.body ? "announcement-body-error" : undefined
          }
        />
        <FieldError id="announcement-body-error" message={displayErrors.body} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="announcement-audience">Audience</Label>
          <select
            id="announcement-audience"
            name="audience"
            value={values.audience}
            disabled={pending}
            onChange={(event) => update("audience", event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {AUDIENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError id="announcement-audience-error" message={displayErrors.audience} />
        </div>
        {values.audience === "team" ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="announcement-team">Team</Label>
            <select
              id="announcement-team"
              name="teamId"
              value={values.teamId}
              disabled={pending}
              onChange={(event) => update("teamId", event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            <FieldError id="announcement-team-error" message={displayErrors.teamId} />
          </div>
        ) : (
          <input type="hidden" name="teamId" value="" />
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="sm:w-fit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Saving…
            </>
          ) : announcement ? (
            "Save changes"
          ) : (
            "Publish announcement"
          )}
        </Button>
        {announcement ? (
          <Button asChild variant="ghost">
            <Link href="/admin/announcements">Cancel</Link>
          </Button>
        ) : null}
      </div>
    </form>
  );
}
