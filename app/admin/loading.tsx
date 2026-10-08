export default function AdminLoading() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">Loading…</span>
      <header
        aria-hidden="true"
        className="flex flex-col gap-3 rounded-xl border bg-gradient-to-r from-card to-card/80 px-5 py-5 shadow-sm"
      >
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-7 w-48 animate-pulse rounded bg-muted" />
        <div className="h-3 w-64 max-w-full animate-pulse rounded bg-muted" />
      </header>
      <div aria-hidden="true" className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 border-b p-4 last:border-b-0"
          >
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}