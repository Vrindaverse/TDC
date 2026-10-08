export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:py-10 lg:px-8"
    >
      <span className="sr-only">Loading…</span>
      <header className="flex flex-col gap-3 rounded-xl border bg-gradient-to-r from-card to-card/80 px-5 py-5 shadow-sm">
        <div
          aria-hidden="true"
          className="h-3 w-24 animate-pulse rounded bg-muted"
        />
        <div
          aria-hidden="true"
          className="h-6 w-48 animate-pulse rounded bg-muted"
        />
        <div
          aria-hidden="true"
          className="h-3 w-64 max-w-full animate-pulse rounded bg-muted"
        />
      </header>
      <div aria-hidden="true" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm"
          >
            <div className="h-28 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-10 animate-pulse rounded-md bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}