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
import { adminRegistrationsRows } from "@/lib/admin/list-queries";

function formatDate(value: Date | string | null | undefined) {
  if (value == null) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export const instant = false;

export default async function AdminRegistrationsPage() {
  const rows = await adminRegistrationsRows();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle>Registrations</CardTitle>
          <CardDescription>
            {rows.length} registration{rows.length === 1 ? "" : "s"} across all
            events.
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/api/admin/export/registrations">Download CSV</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No registrations yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Registrant</th>
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">Mobile</th>
                  <th className="py-2 pr-4 font-medium">Enrollment</th>
                  <th className="py-2 pr-4 font-medium">Sem</th>
                  <th className="py-2 pr-4 font-medium">Event</th>
                  <th className="py-2 pr-4 font-medium">Event date</th>
                  <th className="py-2 font-medium">Registered</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.email}-${String(row.createdAt)}-${index}`}
                    className="border-b last:border-0"
                  >
                    <td className="py-2 pr-4 font-medium">
                      <span className="inline-flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-2">
                          {row.name}
                          {row.isMember ? null : (
                            <Badge variant="outline">Guest</Badge>
                          )}
                        </span>
                        {row.college ? (
                          <span className="text-xs font-normal text-muted-foreground">
                            {row.college}
                          </span>
                        ) : null}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {row.email}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">
                      {row.mobile ?? "—"}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">
                      {row.enrollmentNumber ?? "—"}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {row.semester ? `Sem ${row.semester}` : "—"}
                    </td>
                    <td className="py-2 pr-4">{row.title}</td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {formatDate(row.startsAt)}
                    </td>
                    <td className="py-2">
                      <Badge variant="outline">
                        {formatDate(row.createdAt)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
