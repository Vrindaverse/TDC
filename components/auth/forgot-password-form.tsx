"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  requestResetCodeAction,
  type RequestResetState,
} from "@/app/forgot-password/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { useCsrfToken } from "@/hooks/use-csrf";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<
    RequestResetState,
    FormData
  >(requestResetCodeAction, null);
  const [email, setEmail] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  const csrfToken = useCsrfToken();

  useEffect(() => {
    if (state?.fieldErrors?.email || state?.error) {
      document.getElementById("reset-email")?.focus();
    }
  }, [state]);

  const emailError = clientError ?? state?.fieldErrors?.email;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      event.preventDefault();
      setClientError(
        parsed.error.issues[0]?.message ?? "Enter a valid email address"
      );
      document.getElementById("reset-email")?.focus();
    }
  };

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5"
    >
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
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          autoFocus
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setClientError(null);
          }}
          aria-invalid={Boolean(emailError) || undefined}
          aria-describedby={emailError ? "reset-email-error" : undefined}
          disabled={pending}
        />
        {emailError ? (
          <p id="reset-email-error" role="alert" className="text-sm text-destructive">
            {emailError}
          </p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Sending code…
          </>
        ) : (
          "Send reset code"
        )}
      </Button>
    </form>
  );
}