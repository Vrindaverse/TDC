"use client";

import { useEffect, useState } from "react";

export const OTP_TTL_SECONDS = 15 * 60;

export function useOtpExpiry(
  resetKey: number,
  seconds = OTP_TTL_SECONDS
): { remaining: number; expired: boolean; label: string } {
  const [remaining, setRemaining] = useState(seconds);
  const [prevKey, setPrevKey] = useState(resetKey);
  const [prevSeconds, setPrevSeconds] = useState(seconds);

  if (prevKey !== resetKey || prevSeconds !== seconds) {
    setPrevKey(resetKey);
    setPrevSeconds(seconds);
    setRemaining(seconds);
  }

  useEffect(() => {
    if (remaining <= 0) return;
    const id = window.setTimeout(
      () => setRemaining((value) => value - 1),
      1000
    );
    return () => window.clearTimeout(id);
  }, [remaining]);

  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return {
    remaining,
    expired: remaining <= 0,
    label: `${minutes}:${String(secs).padStart(2, "0")}`,
  };
}

export function OtpExpiryNote({
  expired,
  label,
}: {
  expired: boolean;
  label: string;
}) {
  if (expired) {
    return (
      <p role="status" className="text-sm font-medium text-destructive">
        This code has expired. Request a new one below.
      </p>
    );
  }
  return (
    <p role="status" className="text-sm text-muted-foreground">
      Code expires in{" "}
      <span className="font-mono tabular-nums text-foreground">{label}</span>.
      Codes last 15 minutes.
    </p>
  );
}