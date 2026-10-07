import {
  ChevronLeft,
  ChevronRight,
  History,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AUDIT_ACTIONS } from "@/lib/admin/audit";
import { adminAuditRows } from "@/lib/admin/list-queries";

const PAGE_SIZE = 25;

const actionLabels: Record<string, string> = {
  "user.delete": "Deleted member",
  "user.role": "Changed role",
  "event.create": "Created event",
  "event.update": "Updated event",
  "event.delete": "Deleted event",
  "event.status": "Changed registration status",
  "registration.delete": "Removed registration",
  "message.read": "Marked message read",
  "message.unread": "Marked message unread",
  "message.delete": "Deleted message",
  "announcement.create": "Published announcement",
  "announcement.update": "Edited announcement",
  "announcement.delete": "Deleted announcement",
  "announcement.toggle": "Toggled announcement",
  "college.create": "Added college",
  "college.update": "Edited college",
  "college.toggle": "Toggled college",
  "college.delete": "Deleted college",
};

const targetLabels: Record<string, string> = {
  user: "Member",
  event: "Event",
  registration: "Registration",
  message: "Message",
  announcement: "Announcement",
  college: "College",
};

function formatDateTime(value: Date | string | null | undefined) {
  if (value == null) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function buildHref(base: string, params: { action?: string; page?: number }) {
  const search = new URLSearchParams();
  if (params.action) search.set("action", params.action);
  if (params.page !== undefined && params.page > 1) {
    search.set("page", String(params.page));
  }
  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

export const instant = false;

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; page?: string }>;
}) {
  const { action, page } = await searchParams;

  const actionFilter =
    action && (AUDIT_ACTIONS as readonly string[]).includes(action)
      ? action
      : undefined;
  const pageNumber = Number.isFinite(Number(page)) ? Math.floor(Number(page)) : 1;

  const { rows, total } = await adminAuditRows({
    action: actionFilter,
    page: pageNumber,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(pageNumber, 1), totalPages);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border bg-gradient-to-r from-card to-card/80 px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <p className="tdc-mono-label text-[11px] text-primary">
            consoles / activity
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Admin activity
          </h1>
          <p className="text-sm text-muted-foreground">
            Every change made from this console, newest first.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href="/api/admin/export/activity">Download CSV</Link>
        </Button>
      </header>

      <Card className="admin-card-hover border shadow-sm">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0 border-b pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
              <History aria-hidden="true" className="size-5" />
            </span>
            <div>
              <CardTitle className="text-base font-semibold">
                {total} entr{total === 1 ? "y" : "ies"}
              </CardTitle>
              <CardDescription className="text-xs">
                Showing page {currentPage} of {totalPages}.
              </CardDescription>
            </div>
          </div>
          <form method="get" className="flex flex-wrap items-center gap-3">
            <select
              name="action"
              defaultValue={actionFilter ?? "ALL"}
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              aria-label="Filter by action"
            >
              <option value="ALL">All actions</option>
              {AUDIT_ACTIONS.map((value) => (
                <option key={value} value={value}>
                  {actionLabels[value] ?? value}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline" size="sm">
              Filter
            </Button>
            {actionFilter ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/activity">Clear</Link>
              </Button>
            ) : null}
          </form>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">
              {actionFilter
                ? "No entries match this filter."
                : "No admin actions recorded yet."}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 font-medium">When</th>
                      <th className="px-4 py-3 font-medium">Admin</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                      <th className="px-4 py-3 font-medium">Target</th>
                      <th className="px-4 py-3 font-medium">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="admin-table-row border-b border-border/60 last:border-0">
                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                          {formatDateTime(row.createdAt)}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {row.actorName}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="text-[10px] font-semibold">
                            {actionLabels[row.action] ?? row.action}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {targetLabels[row.targetType] ?? row.targetType}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.detail ?? "—"}
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
                        href={buildHref("/admin/activity", {
                          action: actionFilter,
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
                        href={buildHref("/admin/activity", {
                          action: actionFilter,
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
