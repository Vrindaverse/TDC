"use client";

import { Loader2, Send, UserRound } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  submitContactAction,
  type ContactFormState,
} from "@/app/contact/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fieldErrorsFromZod } from "@/lib/validation/auth";
import {
  contactCategories,
  contactCategoryLabels,
  contactSchema,
} from "@/lib/validation/contact";

type FieldName = "category" | "subject" | "message";

type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, string>>;

const EMPTY_VALUES: Values = {
  category: "general",
  subject: "",
  message: "",
};

function validate(values: Values): Errors {
  const parsed = contactSchema.safeParse(values);
  if (parsed.success) return {};
  return fieldErrorsFromZod(parsed.error);
}

/**
 * Sends an authenticated contact message to the admin console. Only signed-in
 * members can write in — their name and email come from the session, never
 * from the form.
 */
export function ContactForm({
  senderName,
  senderEmail,
}: {
  senderName?: string | null;
  senderEmail?: string | null;
}) {
  const [state, formAction, pending] =
    useActionState<ContactFormState, FormData>(submitContactAction, null);
  const [values, setValues] = useState<Values>(EMPTY_VALUES);
  const [clientErrors, setClientErrors] = useState<Errors>({});
  const [edited, setEdited] = useState<Record<string, boolean>>({});
  const sent = state && !state.error && !state.fieldErrors;

  useEffect(() => {
    const first = (["category", "subject", "message"] as FieldName[]).find(
      (field) => state?.fieldErrors?.[field]
    );
    if (first) document.getElementById(`contact-${first}`)?.focus();
  }, [state]);

  const displayErrors = useMemo<Errors>(() => {
    const merged: Errors = {};
    for (const field of ["category", "subject", "message"] as FieldName[]) {
      const error =
        clientErrors[field] ??
        (edited[field] ? undefined : state?.fieldErrors?.[field]);
      if (error) merged[field] = error;
    }
    return merged;
  }, [clientErrors, edited, state]);

  const update = (field: FieldName, value: string) => {
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
    const nextErrors = validate(values);
    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
      const firstInvalid = Object.keys(nextErrors)[0] as FieldName;
      document.getElementById(`contact-${firstInvalid}`)?.focus();
    }
  };

  if (sent) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Send aria-hidden="true" className="size-5" />
        </div>
        <h3 className="mt-4 text-base font-semibold">Message sent</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Thanks for reaching out. Your message has been delivered to the admin
          team.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-5"
          onClick={() => {
            setValues(EMPTY_VALUES);
            setEdited({});
            setClientErrors({});
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  const fieldProps = (field: Exclude<FieldName, "category">) => ({
    id: `contact-${field}`,
    name: field,
    value: values[field],
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => update(field, event.target.value),
    "aria-invalid": Boolean(displayErrors[field]) || undefined,
    "aria-describedby": displayErrors[field]
      ? `contact-${field}-error`
      : undefined,
  });

  const categoryProps = {
    id: "contact-category",
    name: "category",
    value: values.category,
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) =>
      update("category", event.target.value),
    "aria-invalid": Boolean(displayErrors.category) || undefined,
    "aria-describedby": displayErrors.category
      ? "contact-category-error"
      : undefined,
  };

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="rounded-lg border bg-card p-6"
    >
      <div className="mb-5 flex items-center gap-3 rounded-md bg-muted/50 px-3 py-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UserRound aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0 text-sm">
          <p className="truncate font-medium text-foreground">
            Sending as {senderName || "a TDC member"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {senderEmail ?? ""}
          </p>
        </div>
      </div>

      {state?.error ? (
        <div
          role="alert"
          className="mb-5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-category">What&apos;s this about?</Label>
          <Select {...categoryProps} disabled={pending}>
            {contactCategories.map((category) => (
              <option key={category} value={category}>
                {contactCategoryLabels[category]}
              </option>
            ))}
          </Select>
          {displayErrors.category ? (
            <p
              id="contact-category-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {displayErrors.category}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-subject">Subject</Label>
          <Input
            {...fieldProps("subject")}
            type="text"
            placeholder="A short summary"
            disabled={pending}
          />
          {displayErrors.subject ? (
            <p
              id="contact-subject-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {displayErrors.subject}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-message">Message</Label>
          <Textarea
            {...fieldProps("message")}
            rows={6}
            placeholder="Tell us a little more..."
            disabled={pending}
          />
          {displayErrors.message ? (
            <p
              id="contact-message-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {displayErrors.message}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full sm:w-fit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              Send Message
              <Send aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}