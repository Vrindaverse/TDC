export default function EventsLoading() {
  const card = (key: number) => (
    <div
      key={key}
      className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm"
    >
      <div className="h-28 animate-pulse rounded-lg bg-muted" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-10 animate-pulse rounded-md bg-muted" />
    </div>
  );

  return (
    <div role="status" aria-live="polite" className="flex flex-col">
      <span className="sr-only">Loading events…</span>
      <header aria-hidden="true" className="py-16 sm:py-20">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 sm:px-6">
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-8 w-80 max-w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
        </div>
      </header>
      <div aria-hidden="true" className="border-y bg-muted/40">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => card(index))}
        </div>
      </div>
      <div
        aria-hidden="true"
        className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: 3 }, (_, index) => card(index + 3))}
      </div>
    </div>
  );
}