import { cn } from "@/lib/utils";

interface MarqueeProps {
  items: readonly string[];
  /** Rendered between items, as a dim separator. */
  separator?: string;
  className?: string;
}

/**
 * Infinite horizontal ticker built from two identical tracks. Pure CSS, no
 * client JavaScript: the second copy is hidden from assistive tech and the
 * whole thing collapses to a static wrapping list under reduced motion.
 */
export function Marquee({
  items,
  separator = "/",
  className,
}: MarqueeProps) {
  const track = (duplicated: boolean) => (
    <div
      className="tdc-marquee-track"
      {...(duplicated ? { "data-tdc-duplicate": "" } : {})}
      {...(duplicated ? { "aria-hidden": true as const } : {})}
    >
      {items.map((item) => (
        <span key={item} className="flex items-center gap-2.5">
          <span className="tdc-mono text-sm font-medium tracking-wide whitespace-nowrap text-foreground sm:text-base">
            {item}
          </span>
          <span aria-hidden="true" className="tdc-mono text-sm text-muted-foreground">
            {separator}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={cn("overflow-hidden", className)}>
      <div className="tdc-marquee">{track(false)}{track(true)}</div>
    </div>
  );
}
