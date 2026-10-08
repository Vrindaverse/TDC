"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ErrorFallback({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertCircle aria-hidden="true" className="size-6" />
      </span>
      <p className="tdc-mono-label text-[11px] text-primary">
        something went wrong
      </p>
      <h1 className="text-2xl font-bold tracking-tight">
        We couldn&apos;t load this page
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        An unexpected error occurred. You can try again, or head back home.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={retry}>
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
      {error.digest ? (
        <p className="text-xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      ) : null}
    </div>
  );
}