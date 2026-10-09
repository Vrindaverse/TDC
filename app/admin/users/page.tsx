import { CsrfInput } from "@/components/csrf-input";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShieldCheck,
  ShieldOff,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";

import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { setMemberStatusAction, setUserRoleAction } from "@/app/admin/actions";
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
import { getSession } from "@/lib/auth/guards";
import { adminUsersRows } from "@/lib/admin/list-queries";

const PAGE_SIZE = 20;

function formatDate(value: Date | string | null | undefined) {
  if (value == null) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

function buildHref(
  base: string,
  params: { q?: string; role?: string; page?: number }
) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.role) search.set("role", params.role);
  if (params.page !== undefined && params.page > 1) {
    search.set("page", String(params.page));
  }
  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

function FilterForm({
  q,
  role,
}: {
  q: string;
  role: string | null;
}) {
  return (
    <form
      method="get"
      className="flex flex-wrap items-center gap-3"
    >
      <Input
        type="search"
        name="q"
        defaultValue={q}
        placeholder="Search name, email, mobile, enrollment"
        className="w-full sm:w-64"
        aria-label="Search members"
      />
      <select
        name="role"
        defaultValue={role ?? "ALL"}
        className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        aria-label="Filter by role"
      >
        <option value="ALL">All roles</option>
        <option value="ADMIN">Admins</option>
        <option value="USER">Members</option>
      </select>
      <Button type="submit" variant="outline" size="sm">
        Filter
      </Button>
      {q || role ? (
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/users">Clear</Link>
        </Button>
      ) : null}
    </form>
  );
}

export const instant = false;

const bannerClass =
  "mb-6 flex items-start gap-3 rounded-lg border p-4 text-sm";
const successBanner = `${bannerClass} border-primary/30 bg-primary/5 text-foreground`;
const errorBanner = `${bannerClass} border-destructive/30 bg-destructive/5`;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    role?: string;
    page?: string;
    deleted?: string;
    error?: string;
  }>;
}) {
  const { q, role, page, deleted, error } = await searchParams;
  const session = await getSession();

  const query = q?.trim().slice(0, 100) ?? "";
  const roleFilter =
    role === "ADMIN" || role === "USER" ? (role as "ADMIN" | "USER") : undefined;
  const pageNumber = Number.isFinite(Number(page)) ? Math.floor(Number(page)) : 1;

  const { rows, total } = await adminUsersRows({
    q: query,
    role: roleFilter,
    page: pageNumber,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(pageNumber, 1), totalPages);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-gradient-to-r from-card to-card/80 px-5 py-4 shadow-sm">
        <div>
          <p className="tdc-mono-label text-[11px] text-primary">
            consoles / members
          </p>
          <p className="text-xl font-bold tracking-tight">
            {total} member{total === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href="/api/admin/export/users">
            Download CSV
          </Link>
        </Button>
      </header>

      <Card className="admin-card-hover border shadow-sm">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0 border-b pb-4">
          <div>
            <CardTitle className="text-base">Members</CardTitle>
            <CardDescription>
              Showing page {currentPage} of {totalPages}.
            </CardDescription>
          </div>
          <FilterForm q={query} role={roleFilter ?? null} />
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-0">
          {deleted ? (
            <div role="status" className={successBanner}>
              <CheckCircle2
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-primary"
              />
              <p>User deleted. Their sign-ups, messages and avatar were removed.</p>
            </div>
          ) : null}

          {error === "self" ? (
            <div role="alert" className={errorBanner}>
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-destructive"
              />
              <p>You can&apos;t delete your own account.</p>
            </div>
          ) : null}

          {error === "self_role" ? (
            <div role="alert" className={errorBanner}>
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-destructive"
              />
              <p>You can&apos;t change your own role from here.</p>
            </div>
          ) : null}

          {error === "last_admin" ? (
            <div role="alert" className={errorBanner}>
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-destructive"
              />
              <p>
                That&apos;s the only admin left — keep at least one admin.
              </p>
            </div>
          ) : null}

          {error === "bad_role" ? (
            <div role="alert" className={errorBanner}>
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-destructive"
              />
              <p>That role change wasn&apos;t valid.</p>
            </div>
          ) : null}

          {error === "not_found" ? (
            <div role="alert" className={errorBanner}>
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-destructive"
              />
              <p>That user no longer exists.</p>
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

          {error === "bad_status" ? (
            <div role="alert" className={errorBanner}>
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-destructive"
              />
              <p>That status change wasn&apos;t valid.</p>
            </div>
          ) : null}

          {error === "admin_status" ? (
            <div role="alert" className={errorBanner}>
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-destructive"
              />
              <p>You can&apos;t deactivate an admin account.</p>
            </div>
          ) : null}

          {error && error !== "self" && error !== "self_role" && error !== "last_admin" && error !== "bad_role" && error !== "not_found" && error !== "csrf" && error !== "bad_status" && error !== "admin_status" ? (
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
              {query || roleFilter ? "No members match your filters." : "No members yet."}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">College</th>
                      <th className="px-4 py-3 font-medium">Enrollment</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((user) => (
                      <tr key={user.id} className="admin-table-row border-b border-border/60 last:border-0">
                        <td className="px-4 py-3 font-medium">{user.name}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-2">
                            {user.email}
                            {user.emailVerified ? null : (
                              <Badge variant="outline" className="text-[10px]">unverified</Badge>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {user.college ?? "—"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {user.enrollmentNumber}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={user.role === "ADMIN" ? "default" : "secondary"}
                            className="text-[10px] font-semibold"
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              user.status === "approved"
                                ? "default"
                                : user.status === "rejected"
                                  ? "destructive"
                                  : "outline"
                            }
                            className="text-[10px] font-semibold"
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/admin/users/${user.id}`}>
                              <Button variant="ghost" size="sm" aria-label="View member" className="h-8 w-8 p-0">
                                <Eye aria-hidden="true" className="size-4" />
                              </Button>
                            </Link>
                            {user.userId === session?.user?.id ? null : user.status !== "approved" ? (
                              <form action={setMemberStatusAction}>
                                <CsrfInput />
                                <input type="hidden" name="userId" value={user.userId} />
                                <input type="hidden" name="status" value="approved" />
                                <input type="hidden" name="back" value="/admin/users" />
                                <Button type="submit" variant="ghost" size="sm" className="h-8 px-2 text-xs">
                                  Approve
                                </Button>
                              </form>
                            ) : null}
                            {user.userId === session?.user?.id || user.role === "ADMIN" || user.status === "rejected" ? null : (
                              <form action={setMemberStatusAction}>
                                <CsrfInput />
                                <input type="hidden" name="userId" value={user.userId} />
                                <input type="hidden" name="status" value="rejected" />
                                <input type="hidden" name="back" value="/admin/users" />
                                <Button type="submit" variant="ghost" size="sm" className="h-8 px-2 text-xs text-destructive">
                                  Reject
                                </Button>
                              </form>
                            )}
                            {user.userId === session?.user?.id ? null : (
                              <form action={setUserRoleAction}>
                                <CsrfInput />
                                <input
                                  type="hidden"
                                  name="userId"
                                  value={user.userId}
                                />
                                <input
                                  type="hidden"
                                  name="role"
                                  value={user.role === "ADMIN" ? "USER" : "ADMIN"}
                                />
                                <input type="hidden" name="back" value="/admin/users" />
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="sm"
                                  aria-label={
                                    user.role === "ADMIN"
                                      ? "Remove admin"
                                      : "Make admin"
                                  }
                                  className="h-8 w-8 p-0"
                                >
                                  {user.role === "ADMIN" ? (
                                    <ShieldOff aria-hidden="true" className="size-4" />
                                  ) : (
                                    <ShieldCheck aria-hidden="true" className="size-4" />
                                  )}
                                </Button>
                              </form>
                            )}
                            <DeleteUserButton
                              userId={user.userId}
                              self={user.userId === session?.user?.id}
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
                        href={buildHref("/admin/users", {
                          q: query,
                          role: roleFilter,
                          page: currentPage - 1,
                        })}
                        aria-label="Previous page"
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : undefined}
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
                        href={buildHref("/admin/users", {
                          q: query,
                          role: roleFilter,
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