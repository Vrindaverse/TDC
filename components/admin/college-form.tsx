"use client";

import { CsrfInput } from "@/components/csrf-input";
import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  createCollegeAction,
  updateCollegeAction,
  type CollegeFormState,
} from "@/app/admin/colleges/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fieldErrorsFromZod, type FieldErrors } from "@/lib/validation/auth";
import { collegeSchema } from "@/lib/validation/colleges";

type Values = { name: string; code: string };

const FIELDS: (keyof Values)[] = ["name", "code"];

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

export function CollegeForm({
  college,
}: {
  college?: { id: string; name: string; code: string };
}) {
  const action = college ? updateCollegeAction : createCollegeAction;
  const [state, formAction, pending] = useActionState<
    CollegeFormState,
    FormData
  >(action, null);
  const [values, setValues] = useState<Values>({
    name: college?.name ?? "",
    code: college?.code ?? "",
  });
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [edited, setEdited] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const first = FIELDS.find((field) => state?.fieldErrors?.[field]);
    if (first) document.getElementById(`college-${first}`)?.focus();
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
    const parsed = collegeSchema.safeParse(values);
    if (!parsed.success) {
      event.preventDefault();
      const nextErrors = fieldErrorsFromZod(parsed.error);
      setClientErrors(nextErrors);
      const first = FIELDS.find((field) => nextErrors[field]);
      if (first) document.getElementById(`college-${first}`)?.focus();
    }
  };

  const fieldProps = (field: keyof Values) => ({
    id: `college-${field}`,
    name: field,
    value: values[field],
    onChange: (changeEvent: React.ChangeEvent<HTMLInputElement>) =>
      update(field, changeEvent.target.value),
    "aria-invalid": Boolean(displayErrors[field]) || undefined,
    "aria-describedby": displayErrors[field]
      ? `college-${field}-error`
      : undefined,
  });

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4"
    >
      <CsrfInput />
      {college ? <input type="hidden" name="id" value={college.id} /> : null}

      {state?.error ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="college-name">College name</Label>
          <Input
            {...fieldProps("name")}
            type="text"
            placeholder="Shri Govindram Seksaria Institute of Technology"
            disabled={pending}
          />
          <FieldError id="college-name-error" message={displayErrors.name} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="college-code">Code</Label>
          <Input
            {...fieldProps("code")}
            type="text"
            placeholder="SGSITS"
            disabled={pending}
          />
          <FieldError id="college-code-error" message={displayErrors.code} />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="sm:w-fit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Saving…
            </>
          ) : college ? (
            "Save changes"
          ) : (
            "Add college"
          )}
        </Button>
      </div>
    </form>
  );
}
