import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface TerminalPanelProps {
  /** Text shown in the faux title bar, e.g. `~/tdc — zsh`. */
  title?: string;
  /** Right-aligned status text in the title bar. */
  badge?: string;
  /** Draw the CRT scanline overlay. */
  scanlines?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Window chrome wrapper that frames content as a terminal window. Purely
 * decorative chrome: the three dots and title are hidden from assistive tech so
 * screen readers do not announce them as content.
 */
export function TerminalPanel({
  title = "~/tdc",
  badge,
  scanlines = false,
  className,
  children,
}: TerminalPanelProps) {
  return (
    <div
      className={cn(
        "tdc-scanlines border bg-card",
        scanlines && "shadow-[0_1px_0_0_var(--border)]",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="flex items-center gap-2 border-b px-3 py-2 sm:px-4"
      >
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        </span>
        <span className="tdc-mono-label ml-1.5 truncate">{title}</span>
        {badge ? (
          <span className="tdc-mono-label ml-auto hidden shrink-0 sm:inline">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="relative px-4 py-5 sm:px-6 sm:py-7">{children}</div>
    </div>
  );
}
