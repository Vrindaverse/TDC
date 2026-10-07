"use client";

import { Loader2, Users } from "lucide-react";
import { useActionState, useState } from "react";

import {
  createTeamPostAction,
  type SimpleActionState,
} from "@/app/profile/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCsrfToken } from "@/hooks/use-csrf";
import { formatDate } from "@/lib/format";

export type ApprovedTeamPost = {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  authorName: string;
  eventTitle: string | null;
};

export type MyTeamPost = {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
};

export function TeamPostsSection({
  approvedPosts,
  myPosts,
  events,
}: {
  approvedPosts: ApprovedTeamPost[];
  myPosts: MyTeamPost[];
  events: { id: string; title: string }[];
}) {
  const [state, formAction, pending] = useActionState<
    SimpleActionState,
    FormData
  >(createTeamPostAction, null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [eventId, setEventId] = useState("");
  const csrfToken = useCsrfToken();


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Looking for teammates?</CardTitle>
          <CardDescription>
            Post about a hackathon or event you&apos;re attending. An admin
            approves it, then every member can see it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="_csrf" value={csrfToken} />
            {state?.error ? (
              <p role="alert" className="text-sm text-destructive">
                {state.error}
              </p>
            ) : null}
            {state?.success ? (
              <p role="status" className="text-sm text-primary">
                Posted! It will show up once an admin approves it.
              </p>
            ) : null}
            <div className="flex flex-col gap-2">
              <Label htmlFor="team-title">Title</Label>
              <Input
                id="team-title"
                name="title"
                value={title}
                disabled={pending}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Need 2 teammates for HackSphere 2026"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="team-body">Details</Label>
              <Textarea
                id="team-body"
                name="body"
                rows={4}
                value={body}
                disabled={pending}
                onChange={(event) => setBody(event.target.value)}
                placeholder="What are you building, what skills are you looking for, how can people reach you?"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="team-event">Event (optional)</Label>
              <select
                id="team-event"
                name="eventId"
                value={eventId}
                disabled={pending}
                onChange={(event) => setEventId(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">No specific event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="sm:w-fit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  Posting…
                </>
              ) : (
                "Post for approval"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users aria-hidden="true" className="size-5" />
          </span>
          <div>
            <CardTitle className="text-sm font-semibold">
              Team finder
            </CardTitle>
            <CardDescription className="text-xs">
              Approved posts from the community
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {approvedPosts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No team posts yet. Be the first to post!
            </p>
          ) : (
            approvedPosts.map((post) => (
              <div key={post.id} className="rounded-md border p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h3 className="font-medium">{post.title}</h3>
                  {post.eventTitle ? (
                    <Badge variant="secondary">{post.eventTitle}</Badge>
                  ) : null}
                </div>
                <p className="mb-2 text-sm text-muted-foreground">{post.body}</p>
                <p className="text-xs text-muted-foreground">
                  {post.authorName} · {formatDate(post.createdAt)}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My team posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {myPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You haven&apos;t posted yet.
            </p>
          ) : (
            myPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between gap-2 rounded-md border p-3">
                <p className="text-sm font-medium">{post.title}</p>
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
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
