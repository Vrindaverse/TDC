"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  completeProfileAction,
  type CompleteProfileFormState,
} from "@/app/complete-profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  completeProfileSchema,
  fieldErrorsFromZod,
  type FieldErrors,
} from "@/lib/validation/auth";

type Values = {
  mobile: string;
  collegeId: string;
  enrollmentNumber: string;
};

const FIELDS: (keyof Values)[] = ["mobile", "collegeId", "enrollmentNumber"];

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

export function CompleteProfileForm({
  colleges,
  initialValues,
  name,
  email,
}: {
  colleges: { id: string; name: string; code: string }[];
  initialValues: Values;
  name: string;
  email: string;
}) {
  const [state, formAction, pending] = useActionState<
    CompleteProfileFormState,
    FormData
  >(completeProfileAction, null);
  const [values, setValues] = useState<Values>(initialValues);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [edited, setEdited] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const first = FIELDS.find((field) => state?.fieldErrors?.[field]);
    if (first) document.getElementById(`profile-${first}`)?.focus();
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
    const parsed = completeProfileSchema.safeParse(values);
    if (!parsed.success) {
      event.preventDefault();
      const nextErrors = fieldErrorsFromZod(parsed.error);
      setClientErrors(nextErrors);
      const first = FIELDS.find((field) => nextErrors[field]);
      if (first) document.getElementById(`profile-${first}`)?.focus();
    }
  };

  const fieldProps = (field: keyof Values) => ({
    id: `profile-${field}`,
    name: field,
    value: values[field],
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => update(field, event.target.value),
    "aria-invalid": Boolean(displayErrors[field]) || undefined,
    "aria-describedby": displayErrors[field]
      ? `profile-${field}-error`
      : undefined,
  });

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5"
    >
      {state?.error ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-4 rounded-md border bg-muted/40 p-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Name
          </span>
          <span className="text-sm font-medium">{name}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Email
          </span>
          <span className="break-all text-sm font-medium">{email}</span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="profile-mobile">Mobile number</Label>
          <Input
            {...fieldProps("mobile")}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            placeholder="9876543210"
            disabled={pending}
          />
          <FieldError
            id="profile-mobile-error"
            message={displayErrors.mobile}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="profile-enrollmentNumber">Enrollment number</Label>
          <Input
            {...fieldProps("enrollmentNumber")}
            type="text"
            autoComplete="off"
            placeholder="e.g. 21003001"
            disabled={pending}
          />
          <FieldError
            id="profile-enrollmentNumber-error"
            message={displayErrors.enrollmentNumber}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-collegeId">College</Label>
        <div className="relative">
          <select
            {...fieldProps("collegeId")}
            disabled={pending}
            className="h-9 w-full min-w-0 appearance-none rounded-md border border-input bg-transparent px-3 pr-8 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30"
          >
            <option value="">Select your college</option>
            {colleges.map((college) => (
              <option key={college.id} value={college.id}>
                {college.name} ({college.code})
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
        </div>
        <FieldError
          id="profile-collegeId-error"
          message={displayErrors.collegeId}
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Save and continue"
        )}
      </Button>
    </form>
  );
}