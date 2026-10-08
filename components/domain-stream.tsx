interface DomainStreamProps {
  items: readonly string[];
  className?: string;
}

/**
 * Vertical "log feed" of community tracks — styled like a tailing terminal
 * log. Pure CSS (two identical stacked tracks translate upward), pauses on
 * hover, collapses to a static list under reduced motion.
 */
export function DomainStream({ items, className }: DomainStreamProps) {
  const Row = ({ item, index }: { item: string; index: number }) => (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="inline-block size-1.5 rounded-full bg-primary"
        />
        <span className="tdc-mono text-sm font-medium tracking-wide text-foreground">
          {item}
        </span>
      </span>
      <span className="tdc-mono text-xs text-muted-foreground">
        /track {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  );

  return (
    <div className={className}>
      <div className="tdc-stream">
        <div className="tdc-stream-track">
          {items.map((item, index) => (
            <Row key={item} item={item} index={index} />
          ))}
        </div>
        <div className="tdc-stream-track" aria-hidden="true">
          {items.map((item, index) => (
            <Row key={item} item={item} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
