import { CheckCircle2, TriangleAlert } from "lucide-react";
import Link from "next/link";

import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth/guards";
import { adminUsersRows } from "@/lib/admin/list-queries";

function formatDate(value: Date | string | null | undefined) {
  if (value == null) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

export const instant = false;

const bannerClass =
  "mb-6 flex items-start gap-3 rounded-lg border p-4 text-sm";
const successBanner = `${bannerClass} border-primary/30 bg-primary/5 text-foreground`;
const errorBanner = `${bannerClass} border-destructive/30 bg-destructive/5`;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}) {
  const { deleted, error } = await searchParams;
  const session = await getSession();
  const users = await adminUsersRows();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            {users.length} registered member
            {users.length === 1 ? "" : "s"}.
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/api/admin/export/users">Download CSV</Link>
        </Button>
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

        {error === "last_admin" ? (
          <div role="alert" className={errorBanner}>
            <TriangleAlert
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-destructive"
            />
            <p>
              That&apos;s the only admin left — delete another member first or
              keep at least one admin.
            </p>
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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">College</th>
                <th className="py-2 pr-4 font-medium">Enrollment</th>
                <th className="py-2 pr-4 font-medium">Mobile</th>
                <th className="py-2 pr-4 font-medium">Role</th>
                <th className="py-2 pr-4 font-medium">Joined</th>
                <th className="py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
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
                  <td className="py-2 pr-4 font-mono text-xs">{user.mobile}</td>
                  <td className="py-2 pr-4">
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-2 pr-4 text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="py-2 text-right">
                    <DeleteUserButton
                      userId={user.userId}
                      self={user.userId === session?.user?.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            No members yet.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}