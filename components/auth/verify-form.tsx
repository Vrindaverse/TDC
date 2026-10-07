"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import type { FormEvent } from "react";

import {
  resendOtpAction,
  verifyEmailAction,
  type ResendFormState,
  type VerifyFormState,
} from "@/app/verify/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  OtpExpiryNote,
  useOtpExpiry,
} from "@/components/auth/otp-expiry";
import { useCsrfToken } from "@/hooks/use-csrf";

const OTP_PATTERN = /^\d{6}$/;

export function VerifyForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState<
    VerifyFormState,
    FormData
  >(verifyEmailAction, null);
  const [resendState, resendFormAction, resendPending] = useActionState<
    ResendFormState,
    FormData
  >(resendOtpAction, null);
  const [otp, setOtp] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  const [resendCount, setResendCount] = useState(0);
  const [resendSeen, setResendSeen] = useState(false);
  if (Boolean(resendState?.sent) && !resendSeen) {
    setResendSeen(true);
    setResendCount((value) => value + 1);
  }
  const { expired, label } = useOtpExpiry(resendCount);
  const csrfToken = useCsrfToken();

  const otpError = clientError ?? state?.fieldErrors?.otp;
  const disabled = pending || resendPending || expired;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!OTP_PATTERN.test(otp)) {
      event.preventDefault();
      setClientError("Enter the 6-digit code");
      document.getElementById("verify-otp")?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {state?.error ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}

      <form
        action={formAction}
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-5"
      >
        <input type="hidden" name="_csrf" value={csrfToken} />
        <div className="flex flex-col gap-2">
          <Label htmlFor="verify-otp">Verification code</Label>
          <Input
            id="verify-otp"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            autoFocus
            value={otp}
            onChange={(event) => {
              setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
              setClientError(null);
            }}
            aria-invalid={Boolean(otpError) || undefined}
            aria-describedby={
              otpError ? "verify-otp-error" : undefined
            }
            placeholder="000000"
            className="h-12 text-center font-mono text-lg tracking-[0.5em]"
            disabled={disabled}
          />
          {otpError ? (
            <p
              id="verify-otp-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {otpError}
            </p>
          ) : null}
          <OtpExpiryNote expired={expired} label={label} />
        </div>

        <Button type="submit" className="w-full" disabled={disabled}>
          {pending ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Verifying…
            </>
          ) : (
            "Verify email"
          )}
        </Button>
      </form>

      <div className="flex flex-col gap-2 border-t pt-4 text-sm text-muted-foreground">
        <p>
          The code was sent to{" "}
          <span className="text-foreground">{email}</span>. It may take a
          minute — check your spam folder too.
        </p>
        <form action={resendFormAction}>
          <input type="hidden" name="_csrf" value={csrfToken} />
          <button
            type="submit"
            disabled={pending || resendPending}
            className="font-medium text-foreground underline underline-offset-4 hover:no-underline disabled:opacity-50"
          >
            {resendPending ? "Sending…" : "Resend code"}
          </button>
        </form>
        {resendState?.sent ? (
          <p role="status" className="text-sm text-foreground">
            A new code is on its way.
          </p>
        ) : null}
        {resendState?.error ? (
          <p role="alert" className="text-sm text-destructive">
            {resendState.error}
          </p>
        ) : null}
      </div>
    </div>
  );
}