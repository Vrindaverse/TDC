import { desc } from "drizzle-orm";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";

import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { deleteRegistrationAction } from "@/app/admin/registrations/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { adminRegistrationsRows } from "@/lib/admin/list-queries";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";

const PAGE_SIZE = 20;

function formatDate(value: Date | string | null | undefined) {
  if (value == null) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function buildHref(
  base: string,
  params: { event?: string; q?: string; page?: number }
) {
  const search = new URLSearchParams();
  if (params.event) search.set("event", params.event);
  if (params.q) search.set("q", params.q);
  if (params.page !== undefined && params.page > 1) {
    search.set("page", String(params.page));
  }
  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

const bannerClass = "flex items-start gap-3 rounded-lg border p-4 text-sm";
const successBanner = `${bannerClass} border-primary/30 bg-primary/5 text-foreground`;
const errorBanner = `${bannerClass} border-destructive/30 bg-destructive/5`;

export const instant = false;

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    event?: string;
    q?: string;
    page?: string;
    deleted?: string;
    error?: string;
  }>;
}) {
  const { event, q, page, deleted, error } = await searchParams;
  const eventId = event && /^[0-9a-f-]{36}$/i.test(event) ? event : undefined;
  const query = q?.trim().slice(0, 100) ?? "";
  const pageNumber = Number.isFinite(Number(page)) ? Math.floor(Number(page)) : 1;

  const eventList = await db
    .select({ id: events.id, title: events.title })
    .from(events)
    .orderBy(desc(events.startsAt))
    .limit(200);

  const selectedEvent = eventId
    ? eventList.find((candidate) => candidate.id === eventId)
    : undefined;

  const { rows, total } = await adminRegistrationsRows({
    eventId,
    q: query,
    page: pageNumber,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(pageNumber, 1), totalPages);
  const backPath = buildHref("/admin/registrations", {
    event: eventId,
    q: query,
    page: currentPage,
  });
  const exportHref = buildHref("/api/admin/export/registrations", {
    event: eventId,
    q: query,
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border bg-gradient-to-r from-card to-card/80 px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <p className="tdc-mono-label text-[11px] text-primary">
            consoles / registrations
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            {total} registration{total === 1 ? "" : "s"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {selectedEvent
              ? `For ${selectedEvent.title}.`
              : "Across all events."}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href={exportHref}>Download CSV</Link>
        </Button>
      </header>

      <Card className="admin-card-hover border shadow-sm">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0 border-b pb-4">
          <div>
            <CardTitle className="text-base">Registrations</CardTitle>
            <CardDescription>
              Showing page {currentPage} of {totalPages}.
            </CardDescription>
          </div>
          <form method="get" className="flex flex-wrap items-center gap-3">
            <Input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search name, email, enrollment, event"
              className="w-full sm:w-64"
              aria-label="Search registrations"
            />
            <select
              name="event"
              defaultValue={eventId ?? ""}
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              aria-label="Filter by event"
            >
              <option value="">All events</option>
              {eventList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline" size="sm">
              Filter
            </Button>
            {query || eventId ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/registrations">Clear</Link>
              </Button>
            ) : null}
          </form>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-0">
          {deleted ? (
            <div role="status" className={successBanner}>
              <CheckCircle2
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-primary"
              />
              <p>Registration removed. The seat is open again.</p>
            </div>
          ) : null}
          {error === "not_found" ? (
            <div role="alert" className={errorBanner}>
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-destructive"
              />
              <p>That registration no longer exists.</p>
            </div>
          ) : null}
          {error === "delete" ? (
            <div role="alert" className={errorBanner}>
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-destructive"
              />
              <p>We couldn&apos;t remove that registration. Please try again.</p>
            </div>
          ) : null}
          {error === "csrf" ? (
            <div role="alert" className={errorBanner}>
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-destructive"
              />
              <p>Your session expired. Refresh the page and try again.</p>
            </div>
          ) : null}
          {error &&
          error !== "not_found" &&
          error !== "delete" &&
          error !== "csrf" ? (
            <div role="alert" className={errorBanner}>
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-destructive"
              />
              <p>Something went wrong. Please try again.</p>
            </div>
          ) : null}

          {rows.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">
              {query || eventId
                ? "No registrations match your filters."
                : "No registrations yet."}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Registrant</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Mobile</th>
                      <th className="px-4 py-3 font-medium">Enrollment</th>
                      <th className="px-4 py-3 font-medium">Sem</th>
                      <th className="px-4 py-3 font-medium">Event</th>
                      <th className="px-4 py-3 font-medium">Event date</th>
                      <th className="px-4 py-3 font-medium">Registered</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="admin-table-row border-b border-border/60 last:border-0">
                        <td className="px-4 py-3 font-medium">
                          <span className="inline-flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-2">
                              {row.name}
                              {row.isMember ? null : (
                                <Badge variant="outline" className="text-[10px]">Guest</Badge>
                              )}
                            </span>
                            {row.college ? (
                              <span className="text-xs font-normal text-muted-foreground">
                                {row.college}
                              </span>
                            ) : null}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.email}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {row.mobile ?? "—"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {row.enrollmentNumber ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.semester ? `Sem ${row.semester}` : "—"}
                        </td>
                        <td className="px-4 py-3">{row.title}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(row.startsAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px]">
                            {formatDate(row.createdAt)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end">
                            <ConfirmSubmitButton
                              action={deleteRegistrationAction}
                              fields={{ id: row.id, back: backPath }}
                              label="Remove"
                              confirmLabel="Confirm remove"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              ariaLabel={`Remove ${row.name} from ${row.title}`}
                              icon={
                                <Trash2 aria-hidden="true" className="size-4" />
                              }
                              iconOnly
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 ? (
                <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    {currentPage * PAGE_SIZE - PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, total)} of {total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      aria-disabled={currentPage <= 1}
                    >
                      <Link
                        href={buildHref("/admin/registrations", {
                          event: eventId,
                          q: query,
                          page: currentPage - 1,
                        })}
                        aria-label="Previous page"
                        className={
                          currentPage <= 1
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                      >
                        <ChevronLeft aria-hidden="true" className="size-4" />
                        Previous
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      aria-disabled={currentPage >= totalPages}
                    >
                      <Link
                        href={buildHref("/admin/registrations", {
                          event: eventId,
                          q: query,
                          page: currentPage + 1,
                        })}
                        aria-label="Next page"
                        className={
                          currentPage >= totalPages
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                      >
                        Next
                        <ChevronRight aria-hidden="true" className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
