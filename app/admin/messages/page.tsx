import { count, eq } from "drizzle-orm";
import { Inbox, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  deleteMessageAction,
  markMessageReadAction,
} from "@/app/admin/messages/actions";
import { adminMessagesRows } from "@/lib/admin/list-queries";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";

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

export const instant = false;

export default async function AdminMessagesPage() {
  const rows = await adminMessagesRows();

  const [unreadCount] = await db
    .select({ count: count() })
    .from(contactMessages)
    .where(eq(contactMessages.status, "new"));

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Messages</CardTitle>
            <CardDescription>
              Contact messages sent by registered members.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              {Number(unreadCount?.count ?? 0)} unread
            </span>
            <Button asChild variant="outline" size="sm">
              <Link href="/api/admin/export/messages">Download CSV</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Inbox
                aria-hidden="true"
                className="size-8 text-muted-foreground"
              />
              <p className="text-sm text-muted-foreground">
                No messages yet. When a member contacts you, it shows up here.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className={
                    row.status === "new"
                      ? "flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4"
                      : "flex flex-col gap-3 rounded-lg border bg-card p-4"
                  }
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-sm font-semibold">
                        {row.subject}
                        {row.status === "new" ? (
                          <span className="ml-2 inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground uppercase">
                            New
                          </span>
                        ) : null}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {categoryLabels[row.category] ?? row.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        from {row.name}{" "}
                        <span className="text-muted-foreground/70">· {row.email}</span>
                        {row.college ? ` · ${row.college}` : ""}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(row.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {row.status === "new" ? (
                        <form action={markMessageReadAction}>
                          <input type="hidden" name="id" value={row.id} />
                          <Button variant="outline" size="sm">
                            Mark as read
                          </Button>
                        </form>
                      ) : null}
                      <form action={deleteMessageAction}>
                        <input
                          type="hidden"
                          name="id"
                          value={row.id}
                        />
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 aria-hidden="true" className="size-4" />
                          Delete
                        </Button>
                      </form>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {row.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}