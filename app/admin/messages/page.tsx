import { CsrfInput } from "@/components/csrf-input";
import { count, eq } from "drizzle-orm";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Inbox,
  MailOpen,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";

import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import {
  deleteMessageAction,
  setMessageStatusAction,
} from "@/app/admin/messages/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  MESSAGE_CATEGORIES,
  adminMessagesRows,
} from "@/lib/admin/list-queries";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";

const PAGE_SIZE = 10;

function formatDate(value: Date | string | null | undefined) {
  if (value == null) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const categoryLabels: Record<string, string> = {
  general: "General enquiry",
  membership: "Membership",
  event: "Event",
  collaboration: "Collaboration",
  support: "Support",
  feedback: "Feedback",
  other: "Other",
};

type Filters = { q?: string; category?: string; status?: string; page?: number };

function buildHref(base: string, params: Filters) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  if (params.status) search.set("status", params.status);
  if (params.page !== undefined && params.page > 1) {
    search.set("page", String(params.page));
  }
  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

const bannerClass = "flex items-start gap-3 rounded-lg border p-4 text-sm";
const successBanner = `${bannerClass} border-primary/30 bg-primary/5 text-foreground`;
const errorBanner = `${bannerClass} border-destructive/30 bg-destructive/5`;

const errorMessages: Record<string, string> = {
  update: "We couldn't update that message. Please try again.",
  delete: "We couldn't delete that message. Please try again.",
  not_found: "That message no longer exists.",
  csrf: "Your session expired. Refresh the page and try again.",
};

export const instant = false;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: string;
    page?: string;
    deleted?: string;
    error?: string;
  }>;
}) {
  const { q, category, status, page, deleted, error } = await searchParams;

  const query = q?.trim().slice(0, 100) ?? "";
  const categoryFilter =
    category && (MESSAGE_CATEGORIES as readonly string[]).includes(category)
      ? category
      : undefined;
  const statusFilter =
    status === "new" || status === "read" ? status : undefined;
  const pageNumber = Number.isFinite(Number(page)) ? Math.floor(Number(page)) : 1;

  const { rows, total } = await adminMessagesRows({
    q: query,
    category: categoryFilter,
    status: statusFilter,
    page: pageNumber,
    pageSize: PAGE_SIZE,
  });

  const [unreadCount] = await db
    .select({ count: count() })
    .from(contactMessages)
    .where(eq(contactMessages.status, "new"));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(pageNumber, 1), totalPages);
  const hasFilters = Boolean(query || categoryFilter || statusFilter);
  const backPath = buildHref("/admin/messages", {
    q: query,
    category: categoryFilter,
    status: statusFilter,
    page: currentPage,
  });
  const exportHref = buildHref("/api/admin/export/messages", {
    q: query,
    category: categoryFilter,
    status: statusFilter,
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border bg-gradient-to-r from-card to-card/80 px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <p className="tdc-mono-label text-[11px] text-primary">
            consoles / messages
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-sm text-muted-foreground">
            {total} message{total === 1 ? "" : "s"}
            {hasFilters ? " match your filters." : " from registered members."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary admin-badge-live" aria-hidden="true" />
            {Number(unreadCount?.count ?? 0)} unread
          </span>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href={exportHref}>Download CSV</Link>
          </Button>
        </div>
      </header>

      <Card className="admin-card-hover border shadow-sm">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0 border-b pb-4">
          <div>
            <CardTitle className="text-base">Inbox</CardTitle>
            <CardDescription>
              Showing page {currentPage} of {totalPages}.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              {Number(unreadCount?.count ?? 0)} unread
            </span>
            <Button asChild variant="outline" size="sm">
              <Link href={exportHref}>Download CSV</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-4">
          <form
            method="get"
            className="flex flex-wrap items-center gap-3"
            aria-label="Filter messages"
          >
            <Input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search subject, body, sender"
              className="w-64"
              aria-label="Search messages"
            />
            <select
              name="category"
              defaultValue={categoryFilter ?? "ALL"}
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              aria-label="Filter by category"
            >
              <option value="ALL">All categories</option>
              {MESSAGE_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {categoryLabels[value] ?? value}
                </option>
              ))}
            </select>
            <select
              name="status"
              defaultValue={statusFilter ?? "ALL"}
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              aria-label="Filter by status"
            >
              <option value="ALL">All statuses</option>
              <option value="new">Unread</option>
              <option value="read">Read</option>
            </select>
            <Button type="submit" variant="outline" size="sm">
              Filter
            </Button>
            {hasFilters ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/messages">Clear</Link>
              </Button>
            ) : null}
          </form>

          {deleted ? (
            <div role="status" className={successBanner}>
              <CheckCircle2
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-primary"
              />
              <p>Message deleted.</p>
            </div>
          ) : null}
          {error && errorMessages[error] ? (
            <div role="alert" className={errorBanner}>
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-destructive"
              />
              <p>{errorMessages[error]}</p>
            </div>
          ) : null}
          {error && !errorMessages[error] ? (
            <div role="alert" className={errorBanner}>
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-destructive"
              />
              <p>Something went wrong. Please try again.</p>
            </div>
          ) : null}

          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Inbox
                aria-hidden="true"
                className="size-8 text-muted-foreground"
              />
              <p className="text-sm text-muted-foreground">
                {hasFilters
                  ? "No messages match your filters."
                  : "No messages yet. When a member contacts you, it shows up here."}
              </p>
            </div>
          ) : (
            <>
              <ul className="flex flex-col gap-3">
                {rows.map((row) => (
                  <li
                    key={row.id}
                    className={cn(
                      "group flex flex-col gap-3 rounded-xl border p-4 transition-all",
                      row.status === "new"
                        ? "border-primary/30 bg-gradient-to-r from-primary/5 to-card shadow-sm"
                        : "border-border/60 bg-card/60 hover:border-primary/30 hover:shadow-sm"
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                          {row.subject}
                          {row.status === "new" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground uppercase">
                              <span className="size-1.5 rounded-full bg-primary-foreground admin-badge-live" />
                              New
                            </span>
                          ) : null}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {categoryLabels[row.category] ?? row.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          from {row.name}{" "}
                          <span className="text-muted-foreground/70">· {row.email}</span>
                          {row.college ? ` · ${row.college}` : ""}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(row.createdAt)}
                          {row.readAt ? ` · read ${formatDate(row.readAt)}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <form action={setMessageStatusAction}>
                        <CsrfInput />
                          <input type="hidden" name="id" value={row.id} />
                          <input
                            type="hidden"
                            name="status"
                            value={row.status === "new" ? "read" : "unread"}
                          />
                          <input type="hidden" name="back" value={backPath} />
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                          >
                            {row.status === "new" ? (
                              "Mark as read"
                            ) : (
                              <>
                                <MailOpen
                                  aria-hidden="true"
                                  className="size-3.5"
                                />
                                Mark unread
                              </>
                            )}
                          </Button>
                        </form>
                        <ConfirmSubmitButton
                          action={deleteMessageAction}
                          fields={{ id: row.id, back: backPath }}
                          label="Delete"
                          confirmLabel="Confirm delete"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          ariaLabel="Delete message"
                        />
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                      {row.message}
                    </p>
                  </li>
                ))}
              </ul>

              {totalPages > 1 ? (
                <div className="flex items-center justify-between gap-3 pt-2">
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
                        href={buildHref("/admin/messages", {
                          q: query,
                          category: categoryFilter,
                          status: statusFilter,
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
                        href={buildHref("/admin/messages", {
                          q: query,
                          category: categoryFilter,
                          status: statusFilter,
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
