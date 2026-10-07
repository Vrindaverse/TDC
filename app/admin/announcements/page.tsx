import { desc } from "drizzle-orm";
import {
  CheckCircle2,
  Megaphone,
  Pencil,
  Pin,
  PinOff,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";

import { AnnouncementForm } from "@/components/admin/announcement-form";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import {
  deleteAnnouncementAction,
  toggleAnnouncementAction,
} from "@/app/admin/announcements/actions";
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

const bannerClass = "flex items-start gap-3 rounded-lg border p-4 text-sm";
const successBanner = `${bannerClass} border-primary/30 bg-primary/5 text-foreground`;
const errorBanner = `${bannerClass} border-destructive/30 bg-destructive/5`;

export const instant = false;

const errorMessages: Record<string, string> = {
  delete: "We couldn't delete that announcement. Please try again.",
  update: "We couldn't update that announcement. Please try again.",
  not_found: "That announcement no longer exists.",
};

export default async function AdminAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    edit?: string;
    updated?: string;
    deleted?: string;
  }>;
}) {
  const { error, edit, updated, deleted } = await searchParams;

  const rows = await db
    .select()
    .from(announcements)
    .orderBy(desc(announcements.pinned), desc(announcements.createdAt))
    .limit(100);

  const editing =
    edit && /^[0-9a-f-]{36}$/i.test(edit)
      ? rows.find((row) => row.id === edit)
      : undefined;

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
        {editing ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/announcements">Cancel editing</Link>
          </Button>
        ) : null}
      </header>

      <Card>
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Megaphone aria-hidden="true" className="size-5" />
          </span>
          <div>
            <CardTitle className="text-sm font-semibold">
              {editing ? "Edit announcement" : "New announcement"}
            </CardTitle>
            <CardDescription className="text-xs">
              {editing
                ? "Changes show up for every member right away."
                : "Active announcements appear for every member."}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <AnnouncementForm
            announcement={
              editing
                ? { id: editing.id, title: editing.title, body: editing.body }
                : undefined
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Megaphone aria-hidden="true" className="size-5" />
          </span>
          <CardTitle className="text-sm font-semibold">
            All announcements
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {updated ? (
            <div role="status" className={successBanner}>
              <CheckCircle2
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-primary"
              />
              <p>Announcement updated.</p>
            </div>
          ) : null}
          {deleted ? (
            <div role="status" className={successBanner}>
              <CheckCircle2
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-primary"
              />
              <p>Announcement deleted.</p>
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

          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No announcements yet. Publish the first one above.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {rows.map((announcement) => (
                <li
                  key={announcement.id}
                  className={
                    editing?.id === announcement.id
                      ? "flex flex-col gap-3 rounded-md border border-primary/40 bg-primary/5 p-3"
                      : "flex flex-col gap-3 rounded-md border p-3"
                  }
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
                        {announcement.updatedAt.getTime() !==
                        announcement.createdAt.getTime()
                          ? ` · edited ${formatDate(announcement.updatedAt)}`
                          : ""}
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
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/admin/announcements?edit=${announcement.id}`}
                          aria-label={`Edit ${announcement.title}`}
                        >
                          <Pencil aria-hidden="true" className="size-3.5" />
                          Edit
                        </Link>
                      </Button>
                      <ConfirmSubmitButton
                        action={deleteAnnouncementAction}
                        fields={{ id: announcement.id }}
                        label="Delete"
                        confirmLabel="Confirm delete"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        ariaLabel="Delete announcement"
                      />
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
