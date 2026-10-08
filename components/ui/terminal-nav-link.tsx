import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * A navigation link styled as a shell command: monospaced, uppercase, with a
 * `❯` prompt marker that slides in on hover and an underline bar reading as
 * the "selected" terminal line. Server-safe: active state is passed in.
 */
export function TerminalNavLink({
  href,
  label,
  active = false,
  onNavigate,
}: {
  href: string;
  label: string;
  active?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "tdc-mono group relative inline-flex items-center gap-1 px-3 py-2 text-xs font-medium tracking-[0.14em] uppercase transition-colors duration-200 cursor-target",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "text-primary transition-opacity duration-200",
          active ? "opacity-100" : "opacity-0 group-hover:opacity-70"
        )}
      >
        ❯
      </span>
      {label}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-3 -bottom-0.5 h-px bg-primary transition-opacity duration-300",
          active
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
        )}
      />
    </Link>
  );
}