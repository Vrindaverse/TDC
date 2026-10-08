import { CsrfInput } from "@/components/csrf-input";
import { desc } from "drizzle-orm";
import {
  CheckCircle2,
  Megaphone,
  Pencil,
  Pin,
  PinOff,
  Trash2,
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
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { announcements, teams } from "@/lib/db/schema";

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
  csrf: "Your session expired. Refresh the page and try again.",
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

  const teamRows = await db
    .select({ id: teams.id, name: teams.name })
    .from(teams)
    .orderBy(teams.name);

  const editing =
    edit && /^[0-9a-f-]{36}$/i.test(edit)
      ? rows.find((row) => row.id === edit)
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border bg-gradient-to-r from-card to-card/80 px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <p className="tdc-mono-label text-[11px] text-primary">
            consoles / announcements
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Announcements
          </h1>
          <p className="text-sm text-muted-foreground">
            Posts shown on the member profile page.
          </p>
        </div>
        {editing ? (
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/admin/announcements">Cancel editing</Link>
          </Button>
        ) : null}
      </header>

      <Card className="admin-card-hover border shadow-sm">
        <CardHeader className="flex-row items-center gap-3 space-y-0 border-b pb-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
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
        <CardContent className="p-4">
          <AnnouncementForm
            teams={teamRows}
            announcement={
              editing
                ? {
                    id: editing.id,
                    title: editing.title,
                    body: editing.body,
                    audience: editing.audience,
                    teamId: editing.teamId,
                  }
                : undefined
            }
          />
        </CardContent>
      </Card>

      <Card className="admin-card-hover border shadow-sm">
        <CardHeader className="flex-row items-center gap-3 space-y-0 border-b pb-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
            <Megaphone aria-hidden="true" className="size-5" />
          </span>
          <CardTitle className="text-base font-semibold">
            All announcements
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-4">
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
            <p className="py-8 text-sm text-muted-foreground">
              No announcements yet. Publish the first one above.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {rows.map((announcement) => (
                <li
                  key={announcement.id}
                  className={cn(
                    "group flex flex-col gap-3 rounded-xl border p-4 transition-all",
                    editing?.id === announcement.id
                      ? "border-primary/40 bg-gradient-to-r from-primary/5 to-card shadow-sm"
                      : "border-border/60 bg-card/60 hover:border-primary/30 hover:shadow-sm"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        {announcement.title}
                        {announcement.pinned ? (
                          <Badge variant="secondary" className="text-[10px] font-medium">
                            <Pin aria-hidden="true" className="mr-1 size-3" />
                            Pinned
                          </Badge>
                        ) : null}
                        {announcement.isActive ? (
                          <Badge variant="default" className={cn("text-[10px] font-semibold", "admin-badge-live")}>
                            Live
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
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
                    <div className="flex items-center gap-1.5">
                      <form action={toggleAnnouncementAction}>
                        <CsrfInput />
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
                          className="h-8 gap-1.5 text-xs"
                          aria-label={
                            announcement.isActive ? "Hide" : "Publish"
                          }
                        >
                          {announcement.isActive ? "Hide" : "Publish"}
                        </Button>
                      </form>
                      <form action={toggleAnnouncementAction}>
                        <CsrfInput />
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
                          className="h-8 w-8 p-0"
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
                        </Button>
                      </form>
                      <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
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
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        ariaLabel="Delete announcement"
                        icon={
                          <Trash2 aria-hidden="true" className="size-4" />
                        }
                        iconOnly
                      />
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
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
