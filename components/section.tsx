import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  className?: string;
  children: ReactNode;
  /** Removes the default vertical rhythm when a section controls its own spacing. */
  bare?: boolean;
}

/**
 * Consistent page-width container plus vertical rhythm for every content band.
 */
export function Section({
  id,
  className,
  children,
  bare = false,
}: SectionProps) {
  return (
    <section id={id} className={cn(bare ? "" : "py-16 sm:py-20", className)}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

interface MutedBandProps {
  className?: string;
  children: ReactNode;
}

/** Neutral alternating band used to separate adjacent sections. */
export function MutedBand({ className, children }: MutedBandProps) {
  return (
    <div className={cn("border-y bg-muted/40", className)}>{children}</div>
  );
}