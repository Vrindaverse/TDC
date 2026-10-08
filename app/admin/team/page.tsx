import { CsrfInput } from "@/components/csrf-input";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { desc, eq } from "drizzle-orm";
import { Users } from "lucide-react";

import {
  deleteTeamPostAction,
  setTeamPostStatusAction,
} from "@/app/admin/team/actions";
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
import { events, profiles, teamPosts } from "@/lib/db/schema";
import { formatDateTime } from "@/lib/format";

export const instant = false;

export default async function AdminTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; deleted?: string; error?: string }>;
}) {
  const { updated, deleted, error } = await searchParams;

  const rows = await db
    .select({
      id: teamPosts.id,
      title: teamPosts.title,
      body: teamPosts.body,
      status: teamPosts.status,
      createdAt: teamPosts.createdAt,
      authorName: profiles.name,
      eventTitle: events.title,
    })
    .from(teamPosts)
    .innerJoin(profiles, eq(teamPosts.profileId, profiles.id))
    .leftJoin(events, eq(teamPosts.eventId, events.id))
    .orderBy(desc(teamPosts.createdAt))
    .limit(100);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5 rounded-xl border bg-gradient-to-r from-card to-card/80 px-5 py-5 shadow-sm">
        <p className="tdc-mono-label text-[11px] text-primary">
          consoles / team finder
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Team Finder</h1>
        <p className="text-sm text-muted-foreground">
          Approve or reject member posts looking for teammates.
        </p>
      </header>

      {updated ? (
        <p role="status" className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
          Post updated.
        </p>
      ) : null}
      {deleted ? (
        <p role="status" className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
          Post deleted.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          Something went wrong. Please try again.
        </p>
      ) : null}

      <Card>
        <CardHeader className="flex-row items-center gap-3 space-y-0 border-b pb-4">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users aria-hidden="true" className="size-5" />
          </span>
          <CardTitle className="text-base font-semibold">All posts</CardTitle>
          <CardDescription>{rows.length} total</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-4">
          {rows.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">
              No posts yet.
            </p>
          ) : (
            rows.map((post) => (
              <div key={post.id} className="rounded-md border p-4">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-medium">{post.title}</h3>
                  <Badge
                    variant={
                      post.status === "approved"
                        ? "default"
                        : post.status === "rejected"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {post.status}
                  </Badge>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">{post.body}</p>
                <p className="mb-3 text-xs text-muted-foreground">
                  {post.authorName}
                  {post.eventTitle ? ` · ${post.eventTitle}` : ""} ·{" "}
                  {formatDateTime(post.createdAt)}
                </p>
                <div className="flex gap-2">
                  {post.status !== "approved" ? (
                    <form action={setTeamPostStatusAction}>
                      <CsrfInput />
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="status" value="approved" />
                      <Button type="submit" size="sm" variant="outline">
                        Approve
                      </Button>
                    </form>
                  ) : null}
                  {post.status !== "rejected" ? (
                    <form action={setTeamPostStatusAction}>
                      <CsrfInput />
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <Button type="submit" size="sm" variant="outline">
                        Reject
                      </Button>
                    </form>
                  ) : null}
                  <ConfirmSubmitButton
                    action={deleteTeamPostAction}
                    fields={{ id: post.id }}
                    label="Delete"
                    confirmLabel="Confirm delete"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    ariaLabel={`Delete post "${post.title}"`}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
