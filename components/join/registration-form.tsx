"use client";

import { BadgeCheck, Loader2, Mail } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { FormEvent, MouseEvent } from "react";

import {
  registerForEventAction,
  sendJoinCodeAction,
  verifyJoinCodeAction,
  type SendCodeFormState,
  type VerifyCodeFormState,
} from "@/app/join/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  OtpExpiryNote,
  useOtpExpiry,
} from "@/components/auth/otp-expiry";
import { semesterOptions } from "@/lib/validation/join";

export type EventOption = { id: string; label: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_PATTERN = /^\d{6}$/;

const selectClassName =
  "mt-2 h-10 w-full appearance-none rounded-md border border-input bg-transparent px-3 text-sm shadow-xs transition-[color,box-shadow] outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/50 dark:bg-input/30";

function PendingSubmitButton({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      className="tdc-mono mt-1 w-full cursor-target"
      disabled={disabled || pending}
    >
      {pending ? (
        <>
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          submitting…
        </>
      ) : (
        children
      )}
    </Button>
  );
}

const labelClassName =
  "text-xs font-medium tracking-wide text-muted-foreground uppercase";

const fieldErrorClass = "mt-1 text-sm text-destructive";

export function MemberRegistrationForm({
  events,
  preselect,
  name,
  email,
}: {
  events: EventOption[];
  preselect: string;
  name: string;
  email: string;
}) {
  return (
    <form action={registerForEventAction} className="flex flex-col gap-5">
      <div>
        <Label htmlFor="semester" className={labelClassName}>
          Current semester
        </Label>
        <select
          id="semester"
          name="semester"
          required
          defaultValue="1"
          className={selectClassName}
        >
          {semesterOptions.map((semester) => (
            <option key={semester} value={semester}>
              Semester {semester}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="event" className={labelClassName}>
          Event
        </Label>
        <select
          id="event"
          name="eventId"
          required
          defaultValue={preselect}
          className={selectClassName}
        >
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-muted-foreground">
        Registering as {name}
        {email ? ` (${email})` : ""}. Your saved mobile and enrollment numbers
        will be attached to this sign-up.
      </p>

      <PendingSubmitButton>register for this event</PendingSubmitButton>
    </form>
  );
}

export function GuestRegistrationForm({
  events,
  preselect,
}: {
  events: EventOption[];
  preselect: string;
}) {
  const [sendState, sendFormAction, sendPending] = useActionState<
    SendCodeFormState,
    FormData
  >(sendJoinCodeAction, null);
  const [verifyState, verifyFormAction, verifyPending] = useActionState<
    VerifyCodeFormState,
    FormData
  >(verifyJoinCodeAction, null);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  const [sendCount, setSendCount] = useState(0);
  const [sendSeen, setSendSeen] = useState(false);
  if (Boolean(sendState?.sent) && !sendSeen) {
    setSendSeen(true);
    setSendCount((value) => value + 1);
  }
  const { expired, label } = useOtpExpiry(sendCount);

  const codeSent = sendState?.sent;
  const verified = verifyState?.verified;
  const busy = sendPending || verifyPending;

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    if (!EMAIL_PATTERN.test(email)) {
      event.preventDefault();
      setClientError("Enter a valid email address first.");
      document.getElementById("join-email")?.focus();
      return;
    }
    setClientError(null);
  };

  const handleVerify = (event: MouseEvent<HTMLButtonElement>) => {
    if (!EMAIL_PATTERN.test(email)) {
      event.preventDefault();
      setClientError("Enter a valid email address first.");
      document.getElementById("join-email")?.focus();
      return;
    }
    if (!OTP_PATTERN.test(otp)) {
      event.preventDefault();
      setClientError("Enter the 6-digit code");
      document.getElementById("join-otp")?.focus();
      return;
    }
    setClientError(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-dashed bg-muted/20 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Step 1 — verify your email
        </p>
        <form
          action={sendFormAction}
          onSubmit={handleSend}
          noValidate
          className="flex flex-col gap-3"
        >
          <div>
            <Label htmlFor="join-email" className={labelClassName}>
              Email
            </Label>
            <Input
              id="join-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="you@college.edu"
              className="mt-2"
              value={email}
              readOnly={verified}
              onChange={(event) => {
                setEmail(event.target.value);
                setClientError(null);
              }}
              aria-invalid={Boolean(clientError) || undefined}
            />
            {clientError ? (
              <p role="alert" className={fieldErrorClass}>
                {clientError}
              </p>
            ) : null}
            {verified ? (
              <p
                role="status"
                className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
              >
                <BadgeCheck aria-hidden="true" className="size-4" />
                Email verified
              </p>
            ) : null}
          </div>

          {!verified ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                We&apos;ll email a 6-digit code to confirm this address. You
                can&apos;t change it once verified.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={busy || !email}
                >
                  {sendPending ? (
                    <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  ) : (
                    <Mail aria-hidden="true" className="size-4" />
                  )}
                  {codeSent ? "Resend code" : "Send verification code"}
                </Button>
                {sendState?.error ? (
                  <p role="alert" className="text-sm text-destructive">
                    {sendState.error}
                  </p>
                ) : null}
              </div>

              {codeSent ? (
                <div className="flex flex-col gap-3 pt-1">
                  <p role="status" className="text-sm text-muted-foreground">
                    Code sent to{" "}
                    <span className="text-foreground">{email}</span>. It may
                    take a minute — check your spam folder too.
                  </p>
                  <OtpExpiryNote expired={expired} label={label} />
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="w-40">
                      <Label htmlFor="join-otp" className={labelClassName}>
                        Verification code
                      </Label>
                      <Input
                        id="join-otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        autoFocus
                        maxLength={6}
                        placeholder="000000"
                        className="mt-2 h-12 text-center font-mono text-lg tracking-[0.5em]"
                        value={otp}
                        onChange={(event) => {
                          setOtp(
                            event.target.value.replace(/\D/g, "").slice(0, 6)
                          );
                          setClientError(null);
                        }}
                        aria-invalid={
                          Boolean(verifyState?.fieldErrors?.otp) || undefined
                        }
                        aria-describedby={
                          verifyState?.fieldErrors?.otp
                            ? "join-otp-error"
                            : undefined
                        }
                        disabled={busy}
                      />
                      {verifyState?.fieldErrors?.otp ? (
                        <p
                          id="join-otp-error"
                          role="alert"
                          className={fieldErrorClass}
                        >
                          {verifyState.fieldErrors.otp}
                        </p>
                      ) : null}
                    </div>
                    <Button
                      type="submit"
                      formAction={verifyFormAction}
                      size="sm"
                      onClick={handleVerify}
                      disabled={busy || expired}
                    >
                      {verifyPending ? (
                        <Loader2
                          aria-hidden="true"
                          className="size-4 animate-spin"
                        />
                      ) : null}
                      Verify code
                    </Button>
                    {verifyState?.error ? (
                      <p role="alert" className="text-sm text-destructive">
                        {verifyState.error}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p role="status" className="text-sm text-muted-foreground">
              Email confirmed. Now finish the details below.
            </p>
          )}
        </form>
      </div>

      <form
        action={registerForEventAction}
        className="flex flex-col gap-5"
      >
        <input type="hidden" name="email" value={email} />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Step 2 — your details
        </p>

        <div>
          <Label htmlFor="join-name" className={labelClassName}>
            Name
          </Label>
          <Input
            id="join-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            maxLength={80}
            placeholder="Your full name"
            className="mt-2"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="join-mobile" className={labelClassName}>
              Mobile number
            </Label>
            <Input
              id="join-mobile"
              name="mobile"
              type="tel"
              required
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              placeholder="10-digit mobile"
              className="mt-2 font-mono"
            />
          </div>
          <div>
            <Label htmlFor="join-enrollment" className={labelClassName}>
              Enrollment number
            </Label>
            <Input
              id="join-enrollment"
              name="enrollmentNumber"
              type="text"
              required
              autoComplete="off"
              maxLength={30}
              placeholder="e.g. 0126CS221045"
              className="mt-2 font-mono"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="join-semester" className={labelClassName}>
            Current semester
          </Label>
          <select
            id="join-semester"
            name="semester"
            required
            defaultValue="1"
            className={selectClassName}
          >
            {semesterOptions.map((semester) => (
              <option key={semester} value={semester}>
                Semester {semester}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="join-event" className={labelClassName}>
            Event
          </Label>
          <select
            id="join-event"
            name="eventId"
            required
            defaultValue={preselect}
            className={selectClassName}
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.label}
              </option>
            ))}
          </select>
        </div>

        <PendingSubmitButton disabled={!verified || busy}>
          register for this event
        </PendingSubmitButton>

        <p className="text-xs text-muted-foreground">
          No account? No problem. Members can track their sign-ups on their
          profile.
        </p>
      </form>
    </div>
  );
}