import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";

import { CollegeForm } from "@/components/admin/college-form";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import {
  deleteCollegeAction,
  toggleCollegeAction,
} from "@/app/admin/colleges/actions";
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
import { cn } from "@/lib/utils";
import { adminCollegesRows } from "@/lib/admin/list-queries";

const PAGE_SIZE = 20;

function formatDate(value: Date | string | null | undefined) {
  if (value == null) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

function buildHref(
  base: string,
  params: { q?: string; status?: string; page?: number }
) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.page !== undefined && params.page > 1) {
    search.set("page", String(params.page));
  }
  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

export const instant = false;

const bannerClass = "flex items-start gap-3 rounded-lg border p-4 text-sm";
const successBanner = `${bannerClass} border-primary/30 bg-primary/5 text-foreground`;
const errorBanner = `${bannerClass} border-destructive/30 bg-destructive/5`;

function Banner({
  kind,
  children,
}: {
  kind: "success" | "error";
  children: React.ReactNode;
}) {
  return (
    <div
      role={kind === "success" ? "status" : "alert"}
      className={kind === "success" ? successBanner : errorBanner}
    >
      {kind === "success" ? (
        <CheckCircle2
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-primary"
        />
      ) : (
        <TriangleAlert
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-destructive"
        />
      )}
      <p>{children}</p>
    </div>
  );
}

export default async function AdminCollegesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
    created?: string;
    updated?: string;
    toggled?: string;
    deleted?: string;
    error?: string;
  }>;
}) {
  const { q, status, page, created, updated, toggled, deleted, error } =
    await searchParams;

  const query = q?.trim().slice(0, 100) ?? "";
  const statusFilter =
    status === "active" || status === "inactive" ? status : undefined;
  const pageNumber = Number.isFinite(Number(page)) ? Math.floor(Number(page)) : 1;

  const { rows, total } = await adminCollegesRows({
    q: query,
    status: statusFilter,
    page: pageNumber,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(pageNumber, 1), totalPages);
  const hasFilters = Boolean(query || statusFilter);

  const errorMessages: Record<string, string> = {
    not_found: "That college no longer exists.",
    in_use: "Members still use this college — deactivate it instead of deleting.",
    update: "We couldn't update that college. Please try again.",
    delete: "We couldn't delete that college. Please try again.",
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border bg-gradient-to-r from-card to-card/80 px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <p className="tdc-mono-label text-[11px] text-primary">
            consoles / colleges
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Colleges</h1>
          <p className="text-sm text-muted-foreground">
            {total} college{total === 1 ? "" : "s"} members can pick during
            sign-up.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href="/api/admin/export/colleges">Download CSV</Link>
        </Button>
      </header>

      <Card className="admin-card-hover border shadow-sm">
        <CardHeader className="flex-row items-center gap-3 space-y-0 border-b pb-4">
          <div>
            <CardTitle className="text-sm font-semibold">
              Add a college
            </CardTitle>
            <CardDescription className="text-xs">
              A short code keeps the list readable in exports.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CollegeForm />
        </CardContent>
      </Card>

      <Card className="admin-card-hover border shadow-sm">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0 border-b pb-4">
          <div>
            <CardTitle className="text-base">All colleges</CardTitle>
            <CardDescription>
              Showing page {currentPage} of {totalPages}.
            </CardDescription>
          </div>
          <form method="get" className="flex flex-wrap items-center gap-3">
            <Input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search name or code"
              className="w-56"
              aria-label="Search colleges"
            />
            <select
              name="status"
              defaultValue={statusFilter ?? "ALL"}
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              aria-label="Filter by status"
            >
              <option value="ALL">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <Button type="submit" variant="outline" size="sm">
              Filter
            </Button>
            {hasFilters ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/colleges">Clear</Link>
              </Button>
            ) : null}
          </form>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-0">
          {created ? (
            <Banner kind="success">College added. Members can pick it now.</Banner>
          ) : null}
          {updated ? (
            <Banner kind="success">College updated.</Banner>
          ) : null}
          {toggled ? (
            <Banner kind="success">College status updated.</Banner>
          ) : null}
          {deleted ? (
            <Banner kind="success">College deleted.</Banner>
          ) : null}
          {error && errorMessages[error] ? (
            <Banner kind="error">{errorMessages[error]}</Banner>
          ) : null}

          {rows.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">
              {hasFilters
                ? "No colleges match your filters."
                : "No colleges yet. Add the first one above."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium">Members</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Added</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((college) => (
                    <tr key={college.id} className="admin-table-row border-b border-border/60 last:border-0">
                      <td className="px-4 py-3 font-medium">{college.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {college.code}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {college.memberCount}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={college.isActive ? "default" : "outline"}
                          className={cn(
                            "text-[10px] font-semibold",
                            college.isActive && "admin-badge-live"
                          )}
                        >
                          {college.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(college.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Link
                              href={`/admin/colleges/${college.id}`}
                              aria-label={`Edit ${college.name}`}
                            >
                              <Pencil aria-hidden="true" className="size-4" />
                            </Link>
                          </Button>
                          <form action={toggleCollegeAction}>
                            <input
                              type="hidden"
                              name="id"
                              value={college.id}
                            />
                            <input
                              type="hidden"
                              name="value"
                              value={String(!college.isActive)}
                            />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs"
                              aria-label={
                                college.isActive
                                  ? `Deactivate ${college.name}`
                                  : `Activate ${college.name}`
                              }
                            >
                              {college.isActive ? "Deactivate" : "Activate"}
                            </Button>
                          </form>
                          {college.memberCount === 0 ? (
                            <ConfirmSubmitButton
                              action={deleteCollegeAction}
                              fields={{ id: college.id }}
                              label="Delete"
                              confirmLabel="Confirm delete"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              ariaLabel={`Delete ${college.name}`}
                            />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
                    href={buildHref("/admin/colleges", {
                      q: query,
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
                    href={buildHref("/admin/colleges", {
                      q: query,
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
        </CardContent>
      </Card>
    </div>
  );
}
