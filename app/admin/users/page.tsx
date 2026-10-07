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
import { setUserRoleAction } from "@/app/admin/actions";
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
        className="w-64"
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
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="tdc-mono-label text-[11px] text-primary">
            consoles / members
          </h1>
          <p className="text-xl font-semibold tracking-tight">
            {total} member{total === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/api/admin/export/users">Download CSV</Link>
        </Button>
      </header>

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              Showing page {currentPage} of {totalPages}.
            </CardDescription>
          </div>
          <FilterForm q={query} role={roleFilter ?? null} />
        </CardHeader>
        <CardContent>
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

          {rows.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              {query || roleFilter ? "No members match your filters." : "No members yet."}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Name</th>
                      <th className="py-2 pr-4 font-medium">Email</th>
                      <th className="py-2 pr-4 font-medium">College</th>
                      <th className="py-2 pr-4 font-medium">Enrollment</th>
                      <th className="py-2 pr-4 font-medium">Role</th>
                      <th className="py-2 pr-4 font-medium">Joined</th>
                      <th className="py-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((user) => (
                      <tr key={user.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-medium">{user.name}</td>
                        <td className="py-2 pr-4">
                          <span className="inline-flex items-center gap-2">
                            {user.email}
                            {user.emailVerified ? null : (
                              <Badge variant="outline">unverified</Badge>
                            )}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-muted-foreground">
                          {user.college ?? "—"}
                        </td>
                        <td className="py-2 pr-4 font-mono text-xs">
                          {user.enrollmentNumber}
                        </td>
                        <td className="py-2 pr-4">
                          <Badge
                            variant={user.role === "ADMIN" ? "default" : "secondary"}
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4 text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-2">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/users/${user.id}`}>
                              <Button variant="outline" size="sm" aria-label="View member">
                                <Eye aria-hidden="true" className="size-3.5" />
                              </Button>
                            </Link>
                            {user.userId === session?.user?.id ? null : (
                              <form action={setUserRoleAction}>
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
                                  variant="outline"
                                  size="sm"
                                  aria-label={
                                    user.role === "ADMIN"
                                      ? "Remove admin"
                                      : "Make admin"
                                  }
                                >
                                  {user.role === "ADMIN" ? (
                                    <ShieldOff aria-hidden="true" className="size-3.5" />
                                  ) : (
                                    <ShieldCheck aria-hidden="true" className="size-3.5" />
                                  )}
                                  {user.role === "ADMIN" ? "Remove" : "Admin"}
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
                <div className="mt-4 flex items-center justify-between gap-3 pt-4">
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