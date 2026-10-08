interface VerticalMarqueeProps {
  /** Text repeated down each rail. */
  text?: string;
  /** Scroll the right rail in the opposite direction. */
  reverse?: boolean;
  className?: string;
}

const ROWS_PER_COPY = 14;
const COPIES = 2;

/**
 * Tall, purely decorative vertical marquee that fills the empty gutter beside
 * centered page content on desktop. Two identical copies are stacked inside one
 * track so a single `-50%` translate loops seamlessly.
 */
export function VerticalMarquee({
  text = "TDC",
  reverse = false,
  className,
}: VerticalMarqueeProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none flex select-none items-center overflow-hidden text-xs font-bold tracking-[0.35em] text-muted-foreground/40 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] ${className ?? ""}`}
    >
      <div
        className="flex flex-col gap-7"
        style={{
          animation: `tdc-vertical-scroll 26s linear infinite${reverse ? " reverse" : ""}`,
        }}
      >
        {Array.from({ length: COPIES }).map((_, copy) => (
          <div key={copy} className="flex flex-col gap-7">
            {Array.from({ length: ROWS_PER_COPY }).map((_, row) => (
              <span key={row} className="whitespace-nowrap">
                {text}
                <span className="mx-4 text-muted-foreground/25">/</span>
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}