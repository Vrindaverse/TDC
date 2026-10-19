"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error, error?.digest);
  }, [error]);

  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col items-center justify-center bg-background px-4 py-16 text-center">
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
          <span className="flex size-14 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle aria-hidden="true" className="size-7" />
          </span>
          <div className="space-y-2">
            <p className="tdc-mono-label text-[11px] text-primary">
              something went wrong
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              Something broke
            </h1>
            <p className="text-sm text-muted-foreground">
              A critical error prevented this page from rendering. Try
              reloading, or head back home.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button type="button" onClick={reset}>
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Go home</Link>
            </Button>
          </div>
          {error?.digest ? (
            <p className="text-xs text-muted-foreground">
              Reference: {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}