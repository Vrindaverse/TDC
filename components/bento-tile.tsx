import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface BentoTileProps {
  /** Path-like label shown in the tile's header, e.g. `~/tdc/about`. */
  label?: string;
  /** Short right-aligned header note, e.g. `md`. */
  hint?: string;
  /** Adds hover emphasis for tiles that link somewhere. */
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * One cell of the home page's bento grid. Deliberately flat and hairline-ruled
 * instead of shadowed, so a grid of them reads as a single dev-tool surface.
 */
export function BentoTile({
  label,
  hint,
  interactive = false,
  className,
  children,
}: BentoTileProps) {
  return (
    <div
      className={cn(
        "group flex flex-col border bg-card p-5 transition-colors sm:p-6",
        interactive &&
          "hover:border-foreground/25 focus-within:border-foreground/25",
        className
      )}
    >
      {label ? (
        <div className="mb-5 flex items-center gap-3">
          <span className="tdc-mono-label">{label}</span>
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
          {hint ? (
            <span className="tdc-mono-label shrink-0">{hint}</span>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
