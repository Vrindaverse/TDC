"use client";

import { Eye, EyeOff, Loader2, RotateCcw } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  resendResetCodeAction,
  resetPasswordAction,
  type ResetPasswordState,
} from "@/app/reset-password/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  OtpExpiryNote,
  useOtpExpiry,
} from "@/components/auth/otp-expiry";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { useCsrfToken } from "@/hooks/use-csrf";

export function ResetPasswordForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState<
    ResetPasswordState,
    FormData
  >(resetPasswordAction, null);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const csrfToken = useCsrfToken();

  const { expired: codeExpired, label: codeLabel } = useOtpExpiry(0);

  const otpError = clientError ?? state?.fieldErrors?.otp;
  const passwordError = state?.fieldErrors?.password;
  const confirmError = state?.fieldErrors?.confirmPassword;

  useEffect(() => {
    if (state?.fieldErrors?.otp || state?.error) {
      document.getElementById("reset-otp")?.focus();
    }
  }, [state]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as
      | HTMLButtonElement
      | null;
    if (submitter?.dataset.action === "resend") return;

    const parsed = resetPasswordSchema.safeParse({
      otp,
      password,
      confirmPassword,
    });
    if (!parsed.success) {
      event.preventDefault();
      setClientError(
        parsed.error.issues[0]?.message ??
          "Check the code and passwords you entered"
      );
      document.getElementById("reset-otp")?.focus();
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
      <input type="hidden" name="email" value={email} />

      {state?.error ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="reset-otp">Verification code</Label>
        <Input
          id="reset-otp"
          name="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          className="font-mono"
          autoFocus
          value={otp}
          onChange={(event) => {
            setOtp(event.target.value);
            setClientError(null);
          }}
          aria-invalid={Boolean(otpError) || undefined}
          aria-describedby={otpError ? "reset-otp-error" : undefined}
          disabled={pending}
        />
        {otpError ? (
          <p id="reset-otp-error" role="alert" className="text-sm text-destructive">
            {otpError}
          </p>
        ) : null}
        <OtpExpiryNote expired={codeExpired} label={codeLabel} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="reset-password">New password</Label>
        <div className="relative">
          <Input
            id="reset-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(passwordError) || undefined}
            aria-describedby={passwordError ? "reset-password-error" : undefined}
            disabled={pending}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="size-4" />
            ) : (
              <Eye aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
        {passwordError ? (
          <p id="reset-password-error" role="alert" className="text-sm text-destructive">
            {passwordError}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="reset-confirm">Confirm new password</Label>
        <Input
          id="reset-confirm"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Re-enter the new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          aria-invalid={Boolean(confirmError) || undefined}
          aria-describedby={confirmError ? "reset-confirm-error" : undefined}
          disabled={pending}
        />
        {confirmError ? (
          <p id="reset-confirm-error" role="alert" className="text-sm text-destructive">
            {confirmError}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Button type="submit" className="w-full" disabled={pending || codeExpired}>
          {pending ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Resetting password…
            </>
          ) : (
            "Reset password"
          )}
        </Button>
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          data-action="resend"
          formAction={resendResetCodeAction}
          className="w-full"
          disabled={pending}
        >
          <input type="hidden" name="_csrf" value={csrfToken} />
          <RotateCcw aria-hidden="true" className="size-4" />
          Resend code
        </Button>
      </div>
    </form>
  );
}