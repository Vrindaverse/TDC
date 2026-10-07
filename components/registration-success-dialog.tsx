"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function RegistrationSuccessDialog({
  message,
}: {
  message: string;
}) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDismissed(true);
        const url = new URL(window.location.href);
        url.searchParams.delete("registered");
        window.history.replaceState(null, "", url.toString());
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function close() {
    const url = new URL(window.location.href);
    url.searchParams.delete("registered");
    window.history.replaceState(null, "", url.toString());
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="registered-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 aria-hidden="true" className="size-7 text-primary" />
          </span>
          <h2
            id="registered-dialog-title"
            className="text-lg font-semibold tracking-tight"
          >
            You&apos;re registered
          </h2>
          <p className="text-sm text-muted-foreground">{message}</p>
          <Button
            type="button"
            autoFocus
            onClick={close}
            className="mt-2 w-full"
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}