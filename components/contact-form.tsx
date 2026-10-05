"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FieldName = "name" | "email" | "subject" | "message";

type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, string>>;

const EMPTY_VALUES: Values = { name: "", email: "", subject: "", message: "" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values: Values): Errors {
  const errors: Errors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Please enter your name.";
  }

  if (!values.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (values.subject.trim().length < 3) {
    errors.subject = "Please add a short subject.";
  }

  if (values.message.trim().length < 10) {
    errors.message = "Please write at least 10 characters.";
  }

  return errors;
}

/**
 * Client-side only: there is no backend in this phase, so a valid submission
 * swaps the form for a success state. Wire `handleSubmit` to a real action later.
 */
export function ContactForm() {
  const [values, setValues] = useState<Values>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const update = (field: FieldName, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstInvalid = Object.keys(nextErrors)[0] as FieldName;
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }

    setValues(EMPTY_VALUES);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-2 text-foreground">
          <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
          <h3 className="text-base font-semibold">Message sent</h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Thanks for reaching out. A member of the TDC core team will get back
          to you shortly.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-5"
          onClick={() => setSubmitted(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  const fieldProps = (field: FieldName) => ({
    id: `contact-${field}`,
    name: field,
    value: values[field],
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => update(field, event.target.value),
    "aria-invalid": Boolean(errors[field]) || undefined,
    "aria-describedby": errors[field] ? `contact-${field}-error` : undefined,
  });

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-lg border bg-card p-6"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            {...fieldProps("name")}
            type="text"
            autoComplete="name"
            placeholder="Your full name"
          />
          {errors.name ? (
            <p
              id="contact-name-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            {...fieldProps("email")}
            type="email"
            autoComplete="email"
            placeholder="you@college.edu"
          />
          {errors.email ? (
            <p
              id="contact-email-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-subject">Subject</Label>
          <Input
            {...fieldProps("subject")}
            type="text"
            placeholder="What is this about?"
          />
          {errors.subject ? (
            <p
              id="contact-subject-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.subject}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-message">Message</Label>
          <Textarea
            {...fieldProps("message")}
            rows={5}
            placeholder="Tell us a little more..."
          />
          {errors.message ? (
            <p
              id="contact-message-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.message}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full sm:w-fit">
          Send Message
          <Send aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}