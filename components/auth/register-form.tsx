"use client";

import { ChevronDown, Eye, EyeOff, Loader2 } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  registerAction,
  type RegisterFormState,
} from "@/app/register/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fieldErrorsFromZod,
  registerSchema,
  type FieldErrors,
} from "@/lib/validation/auth";
import { useCsrfToken } from "@/hooks/use-csrf";

type Values = {
  name: string;
  email: string;
  mobile: string;
  collegeId: string;
  enrollmentNumber: string;
  password: string;
  confirmPassword: string;
};

const EMPTY_VALUES: Values = {
  name: "",
  email: "",
  mobile: "",
  collegeId: "",
  enrollmentNumber: "",
  password: "",
  confirmPassword: "",
};

const FIELDS = Object.keys(EMPTY_VALUES) as (keyof Values)[];

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

export function RegisterForm({
  colleges,
}: {
  colleges: { id: string; name: string; code: string }[];
}) {
  const [state, formAction, pending] = useActionState<
    RegisterFormState,
    FormData
  >(registerAction, null);
  const [values, setValues] = useState<Values>(EMPTY_VALUES);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [edited, setEdited] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const csrfToken = useCsrfToken();
  const [dismissedDupesFor, setDismissedDupesFor] = useState<typeof state>(null);

  const duplicateEntries = Object.entries(state?.fieldErrors ?? {}).filter(
    ([, message]) => typeof message === "string" && message.includes("already registered")
  );
  const showDuplicateDialog =
    duplicateEntries.length > 0 && state !== dismissedDupesFor;

  useEffect(() => {
    const first = FIELDS.find((field) => state?.fieldErrors?.[field]);
    if (first) document.getElementById(`register-${first}`)?.focus();
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
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      event.preventDefault();
      const nextErrors = fieldErrorsFromZod(parsed.error);
      setClientErrors(nextErrors);
      const first = FIELDS.find((field) => nextErrors[field]);
      if (first) document.getElementById(`register-${first}`)?.focus();
    }
  };

  const fieldProps = (field: keyof Values) => ({
    id: `register-${field}`,
    name: field,
    value: values[field],
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => update(field, event.target.value),
    "aria-invalid": Boolean(displayErrors[field]) || undefined,
    "aria-describedby": displayErrors[field]
      ? `register-${field}-error`
      : undefined,
  });

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5"
    >
      {showDuplicateDialog ? (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="duplicate-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-xl">
            <h2
              id="duplicate-dialog-title"
              className="text-lg font-semibold tracking-tight"
            >
              Already registered
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {duplicateEntries.map(([field, message]) => (
                <li key={field}>{message as string}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">
              Use different details, or log in if you already have an account.
            </p>
            <Button
              type="button"
              className="mt-4 w-full"
              onClick={() => setDismissedDupesFor(state)}
            >
              Got it
            </Button>
          </div>
        </div>
      ) : null}
      <input type="hidden" name="_csrf" value={csrfToken} />
      {state?.error ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="register-name">Full name</Label>
        <Input
          {...fieldProps("name")}
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          disabled={pending}
        />
        <FieldError id="register-name-error" message={displayErrors.name} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="register-email">Email</Label>
          <Input
            {...fieldProps("email")}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={pending}
          />
          <FieldError id="register-email-error" message={displayErrors.email} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="register-mobile">Mobile number</Label>
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
            id="register-mobile-error"
            message={displayErrors.mobile}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="register-collegeId">College</Label>
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
            id="register-collegeId-error"
            message={displayErrors.collegeId}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="register-enrollmentNumber">Enrollment number</Label>
          <Input
            {...fieldProps("enrollmentNumber")}
            type="text"
            autoComplete="off"
            placeholder="e.g. 21003001"
            disabled={pending}
          />
          <FieldError
            id="register-enrollmentNumber-error"
            message={displayErrors.enrollmentNumber}
          />
        </div>
      </div>

      <p className="-mb-2 text-xs text-muted-foreground">
        Use 8+ characters with at least one letter and one number.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="register-password">Password</Label>
          <div className="relative">
            <Input
              {...fieldProps("password")}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="pr-10"
              disabled={pending}
            />
            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              tabIndex={-1}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="size-4" />
              ) : (
                <Eye aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>
          <FieldError
            id="register-password-error"
            message={displayErrors.password}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="register-confirmPassword">Confirm password</Label>
          <div className="relative">
            <Input
              {...fieldProps("confirmPassword")}
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              className="pr-10"
              disabled={pending}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((previous) => !previous)}
              aria-label={
                showConfirm ? "Hide password" : "Show password"
              }
              aria-pressed={showConfirm}
              tabIndex={-1}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? (
                <EyeOff aria-hidden="true" className="size-4" />
              ) : (
                <Eye aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>
          <FieldError
            id="register-confirmPassword-error"
            message={displayErrors.confirmPassword}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        By registering you agree to receive a verification email from TDC. New
        accounts are reviewed by an admin before member access is granted.
      </p>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Creating account…
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}