import { desc } from "drizzle-orm";
import { Megaphone, Pin, PinOff, Trash2 } from "lucide-react";

import { AnnouncementForm } from "@/components/admin/announcement-form";
import { deleteAnnouncementAction, toggleAnnouncementAction } from "@/app/admin/announcements/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { announcements } from "@/lib/db/schema";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export const instant = false;

export default async function AdminAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const rows = await db
    .select()
    .from(announcements)
    .orderBy(desc(announcements.pinned), desc(announcements.createdAt))
    .limit(100);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border bg-card px-5 py-4">
        <div className="flex flex-col gap-1">
          <p className="tdc-mono-label text-[11px] text-primary">
            consoles / announcements
          </p>
          <h1 className="text-xl font-semibold tracking-tight">
            Announcements
          </h1>
          <p className="text-sm text-muted-foreground">
            Posts shown on the member profile page.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Megaphone aria-hidden="true" className="size-5" />
          </span>
          <div>
            <CardTitle className="text-sm font-semibold">
              New announcement
            </CardTitle>
            <CardDescription className="text-xs">
              Active announcements appear for every member.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <AnnouncementForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Megaphone aria-hidden="true" className="size-5" />
          </span>
          <CardTitle className="text-sm font-semibold">All announcements</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {error === "delete" ? (
            <div
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              We couldn&apos;t delete that announcement. Please try again.
            </div>
          ) : null}
          {error === "update" ? (
            <div
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              We couldn&apos;t update that announcement. Please try again.
            </div>
          ) : null}
          {error === "not_found" ? (
            <div
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              That announcement no longer exists.
            </div>
          ) : null}

          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No announcements yet. Publish the first one above.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {rows.map((announcement) => (
                <li
                  key={announcement.id}
                  className="flex flex-col gap-3 rounded-md border p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                        {announcement.title}
                        {announcement.pinned ? (
                          <Badge variant="secondary" className="text-xs">
                            <Pin aria-hidden="true" className="mr-1 size-3" />
                            Pinned
                          </Badge>
                        ) : null}
                        {announcement.isActive ? (
                          <Badge variant="default" className="text-xs">
                            Live
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Hidden
                          </Badge>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Posted {formatDate(announcement.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <form action={toggleAnnouncementAction}>
                        <input type="hidden" name="id" value={announcement.id} />
                        <input
                          type="hidden"
                          name="field"
                          value="isActive"
                        />
                        <input
                          type="hidden"
                          name="value"
                          value={String(!announcement.isActive)}
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          aria-label={
                            announcement.isActive ? "Hide" : "Publish"
                          }
                        >
                          {announcement.isActive ? "Hide" : "Publish"}
                        </Button>
                      </form>
                      <form action={toggleAnnouncementAction}>
                        <input type="hidden" name="id" value={announcement.id} />
                        <input type="hidden" name="field" value="pinned" />
                        <input
                          type="hidden"
                          name="value"
                          value={String(!announcement.pinned)}
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          aria-label={
                            announcement.pinned
                              ? "Unpin announcement"
                              : "Pin announcement"
                          }
                        >
                          {announcement.pinned ? (
                            <PinOff aria-hidden="true" className="size-4" />
                          ) : (
                            <Pin aria-hidden="true" className="size-4" />
                          )}
                          {announcement.pinned ? "Unpin" : "Pin"}
                        </Button>
                      </form>
                      <DeleteAnnouncementButton id={announcement.id} />
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {announcement.body}
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

function DeleteAnnouncementButton({ id }: { id: string }) {
  return (
    <form action={deleteAnnouncementAction}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        aria-label="Delete announcement"
      >
        <Trash2 aria-hidden="true" className="size-4" />
      </Button>
    </form>
  );
}