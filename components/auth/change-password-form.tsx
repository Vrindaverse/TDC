"use client";

import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  changePasswordAction,
  type ChangePasswordState,
} from "@/app/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  changePasswordSchema,
  fieldErrorsFromZod,
  type FieldErrors,
} from "@/lib/validation/auth";

type Values = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const EMPTY_VALUES: Values = {
  currentPassword: "",
  newPassword: "",
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

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<
    ChangePasswordState,
    FormData
  >(changePasswordAction, null);
  const [values, setValues] = useState<Values>(EMPTY_VALUES);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [edited, setEdited] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const first = FIELDS.find((field) => state?.fieldErrors?.[field]);
    if (first) document.getElementById(`changepw-${first}`)?.focus();
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
    const parsed = changePasswordSchema.safeParse(values);
    if (!parsed.success) {
      event.preventDefault();
      const nextErrors = fieldErrorsFromZod(parsed.error);
      setClientErrors(nextErrors);
      const first = FIELDS.find((field) => nextErrors[field]);
      if (first) document.getElementById(`changepw-${first}`)?.focus();
    }
  };

  const fieldProps = (field: keyof Values) => ({
    id: `changepw-${field}`,
    name: field,
    value: values[field],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      update(field, event.target.value),
    "aria-invalid": Boolean(displayErrors[field]) || undefined,
    "aria-describedby": displayErrors[field]
      ? `changepw-${field}-error`
      : undefined,
  });

  const disabled = pending;

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

      {state?.success ? (
        <div
          role="status"
          className="flex items-center gap-2 rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400"
        >
          <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />
          Password updated. Other devices were signed out.
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="changepw-currentPassword">Current password</Label>
        <Input
          {...fieldProps("currentPassword")}
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Your current password"
          disabled={disabled}
        />
        <FieldError
          id="changepw-currentPassword-error"
          message={displayErrors.currentPassword}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="changepw-newPassword">New password</Label>
        <div className="relative">
          <Input
            {...fieldProps("newPassword")}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            disabled={disabled}
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
          id="changepw-newPassword-error"
          message={displayErrors.newPassword}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="changepw-confirmPassword">Confirm new password</Label>
        <Input
          {...fieldProps("confirmPassword")}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Re-enter the new password"
          disabled={disabled}
        />
        <FieldError
          id="changepw-confirmPassword-error"
          message={displayErrors.confirmPassword}
        />
      </div>

      <Button type="submit" className="w-full sm:w-fit" disabled={disabled}>
        {pending ? (
          <>
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Updating…
          </>
        ) : (
          "Update password"
        )}
      </Button>
    </form>
  );
}