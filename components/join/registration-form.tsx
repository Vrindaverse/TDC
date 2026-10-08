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
  const [step, setStep] = useState<"details" | "verify">("details");
  const [sendState, sendFormAction, sendPending] = useActionState<
    SendCodeFormState,
    FormData
  >(sendJoinCodeAction, null);
  const [verifyState, verifyFormAction, verifyPending] = useActionState<
    VerifyCodeFormState,
    FormData
  >(verifyJoinCodeAction, null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [semester, setSemester] = useState("1");
  const [eventId, setEventId] = useState(preselect);
  const [otp, setOtp] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  const [sendCount, setSendCount] = useState(0);
  const [sendSeen, setSendSeen] = useState(false);

  if (Boolean(sendState?.sent) && !sendSeen) {
    setSendSeen(true);
    setSendCount((value) => value + 1);
    setStep("verify");
  }

  const { expired, label } = useOtpExpiry(sendCount);
  const codeSent = sendState?.sent;
  const verified = verifyState?.verified;
  const busy = sendPending || verifyPending;

  const handleDetailsNext = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email)) {
      setClientError("Enter a valid email address.");
      document.getElementById("join-email")?.focus();
      return;
    }
    if (name.trim().length < 2) {
      setClientError("Enter your full name.");
      document.getElementById("join-name")?.focus();
      return;
    }
    if (!/^\d{10}$/.test(mobile.trim())) {
      setClientError("Enter a valid 10-digit mobile number.");
      document.getElementById("join-mobile")?.focus();
      return;
    }
    if (enrollmentNumber.trim().length < 3) {
      setClientError("Enter your enrollment number.");
      document.getElementById("join-enrollment")?.focus();
      return;
    }
    setClientError(null);
    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("email", email.trim().toLowerCase());
    sendFormAction(formData);
  };

  const handleSendAgain = () => {
    if (!EMAIL_PATTERN.test(email)) return;
    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("email", email.trim().toLowerCase());
    sendFormAction(formData);
  };

  const handleVerify = (event: MouseEvent<HTMLButtonElement>) => {
    if (!EMAIL_PATTERN.test(email)) {
      event.preventDefault();
      setClientError("Enter a valid email address.");
      setStep("details");
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
      {step === "details" ? (
        <form
          onSubmit={handleDetailsNext}
          noValidate
          className="flex flex-col gap-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Step 1 — your details
          </p>
          {clientError && step === "details" ? (
            <p role="alert" className={fieldErrorClass}>
              {clientError}
            </p>
          ) : null}
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
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
              onChange={(e) => {
                setEmail(e.target.value);
                setClientError(null);
              }}
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
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
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
                value={enrollmentNumber}
                onChange={(e) => setEnrollmentNumber(e.target.value)}
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
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className={selectClassName}
            >
              {semesterOptions.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
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
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className={selectClassName}
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            size="lg"
            className="tdc-mono mt-1 w-full cursor-target"
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                sending code…
              </>
            ) : (
              "Next — verify email"
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            No account? No problem. Members can track their sign-ups on their
            profile.
          </p>
        </form>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="rounded-xl border border-dashed bg-muted/20 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step 2 — verify your email
            </p>
            <form action={verifyFormAction} noValidate className="flex flex-col gap-3">
              <input type="hidden" name="email" value={email} />
              {clientError && step === "verify" ? (
                <p role="alert" className={fieldErrorClass}>
                  {clientError}
                </p>
              ) : null}
              {verified ? (
                <p role="status" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  <BadgeCheck aria-hidden="true" className="size-4" />
                  Email verified
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">
                    Code sent to <span className="text-foreground">{email}</span>
                  </p>
                  {codeSent ? <OtpExpiryNote expired={expired} label={label} /> : null}
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
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                          setClientError(null);
                        }}
                        disabled={busy || expired}
                      />
                      {verifyState?.fieldErrors?.otp ? (
                        <p role="alert" className={fieldErrorClass}>
                          {verifyState.fieldErrors.otp}
                        </p>
                      ) : null}
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      onClick={handleVerify}
                      disabled={busy || expired}
                    >
                      {verifyPending ? (
                        <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                      ) : null}
                      Verify code
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSendAgain}
                      disabled={busy}
                    >
                      Resend
                    </Button>
                  </div>
                  {verifyState?.error ? (
                    <p role="alert" className="text-sm text-destructive">
                      {verifyState.error}
                    </p>
                  ) : null}
                </div>
              )}
            </form>
          </div>
          <form action={registerForEventAction} className="flex flex-col gap-5">
            <input type="hidden" name="name" value={name} />
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="mobile" value={mobile} />
            <input type="hidden" name="enrollmentNumber" value={enrollmentNumber} />
            <input type="hidden" name="semester" value={semester} />
            <input type="hidden" name="eventId" value={eventId} />
            <PendingSubmitButton disabled={!verified || busy}>
              register for this event
            </PendingSubmitButton>
          </form>
        </div>
      )}
    </div>
  );
}