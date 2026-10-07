"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import type { FormEvent } from "react";

import {
  createAnnouncementAction,
  type AnnouncementFormState,
} from "@/app/admin/announcements/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { announcementSchema } from "@/lib/validation/announcements";
import { fieldErrorsFromZod, type FieldErrors } from "@/lib/validation/auth";

export function AnnouncementForm() {
  const [state, formAction, pending] = useActionState<
    AnnouncementFormState,
    FormData
  >(createAnnouncementAction, null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const parsed = announcementSchema.safeParse({
      title: new FormData(event.currentTarget).get("title"),
      body: new FormData(event.currentTarget).get("body"),
    });
    if (!parsed.success) {
      event.preventDefault();
      const errors = fieldErrorsFromZod(parsed.error) as FieldErrors;
      const first = ["title", "body"].find((field) => errors[field]);
      if (first) document.getElementById(`announcement-${first}`)?.focus();
    }
  };

  const titleError = state?.fieldErrors?.title;
  const bodyError = state?.fieldErrors?.body;

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4"
    >
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
          placeholder="e.g. Update: fetch-a-thon venue change"
          disabled={pending}
          aria-invalid={Boolean(titleError) || undefined}
          aria-describedby={titleError ? "announcement-title-error" : undefined}
        />
        {titleError ? (
          <p
            id="announcement-title-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {titleError}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="announcement-body">Body</Label>
        <Textarea
          id="announcement-body"
          name="body"
          rows={4}
          placeholder="What should members know?"
          disabled={pending}
          aria-invalid={Boolean(bodyError) || undefined}
          aria-describedby={bodyError ? "announcement-body-error" : undefined}
        />
        {bodyError ? (
          <p
            id="announcement-body-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {bodyError}
          </p>
        ) : null}
      </div>

      <Button type="submit" className="w-full sm:w-fit" disabled={pending}>
        {pending ? (
          <>
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Publishing…
          </>
        ) : (
          "Publish announcement"
        )}
      </Button>
    </form>
  );
}