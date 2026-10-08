export function DomainMarquee({ items }: { items: readonly string[] }) {
  const track = (
    <div
      className="tdc-marquee-track"
      style={{ gap: "3rem", paddingRight: "3rem" }}
    >
      {items.map((item, index) => (
        <span key={item} className="flex items-center gap-12">
          <span
            className={`whitespace-nowrap text-3xl font-bold uppercase tracking-tight sm:text-5xl ${
              index % 2 === 0
                ? "text-foreground"
                : "text-transparent [-webkit-text-stroke:1.5px_var(--foreground)]"
            }`}
          >
            {item}
          </span>
          <span aria-hidden="true" className="text-xl text-primary sm:text-2xl">
            ◆
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden">
      <div className="tdc-marquee" style={{ animationDuration: "28s" }}>
        {track}
        <div className="tdc-marquee-track" data-tdc-duplicate aria-hidden="true" style={{ gap: "3rem", paddingRight: "3rem" }}>
          {items.map((item, index) => (
            <span key={item} className="flex items-center gap-12">
              <span
                className={`whitespace-nowrap text-3xl font-bold uppercase tracking-tight sm:text-5xl ${
                  index % 2 === 0
                    ? "text-foreground"
                    : "text-transparent [-webkit-text-stroke:1.5px_var(--foreground)]"
                }`}
              >
                {item}
              </span>
              <span aria-hidden="true" className="text-xl text-primary sm:text-2xl">
                ◆
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
