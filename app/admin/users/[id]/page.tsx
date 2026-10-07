import { count, desc, eq } from "drizzle-orm";
import { CalendarDays, Mail, MessageSquareText, ShieldCheck, ShieldOff } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { setUserRoleAction } from "@/app/admin/actions";
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
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { getUserById } from "@/lib/neon-auth";
import {
  contactMessages,
  events,
  profiles,
  registrations,
  colleges,
} from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Member",
};

export const instant = false;

function formatDate(value: Date | string | null | undefined) {
  if (value == null) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminUserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  const { id } = await params;
  const { error, updated } = await searchParams;
  const { session } = await requireAdmin();

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);
  if (!profile) notFound();

  const [college] = await db
    .select({ name: colleges.name })
    .from(colleges)
    .where(eq(colleges.id, profile.collegeId))
    .limit(1);

  const account = await getUserById(profile.userId);

  const memberRegistrations = await db
    .select({
      registrationId: registrations.id,
      createdAt: registrations.createdAt,
      title: events.title,
      startsAt: events.startsAt,
      location: events.location,
      semester: registrations.semester,
    })
    .from(registrations)
    .innerJoin(events, eq(registrations.eventId, events.id))
    .where(eq(registrations.profileId, profile.id))
    .orderBy(desc(registrations.createdAt))
    .limit(50);

  const [messageCount] = await db
    .select({ count: count() })
    .from(contactMessages)
    .where(eq(contactMessages.profileId, profile.id));

  const isSelf = profile.userId === session?.user?.id;
  const email = account?.email ?? "—";
  const emailVerified = Boolean(account?.emailVerified);

  const errorBanner = (message: string) => (
    <div
      role="alert"
      className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border bg-card px-5 py-4">
        <div className="flex flex-col gap-1">
          <p className="tdc-mono-label text-[11px] text-primary">
            consoles / members / {profile.name}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">
              {profile.name}
            </h1>
            <Badge variant={profile.role === "ADMIN" ? "default" : "secondary"}>
              {profile.role}
            </Badge>
            {emailVerified ? null : <Badge variant="outline">unverified</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSelf ? null : (
            <form action={setUserRoleAction}>
              <input type="hidden" name="userId" value={profile.userId} />
              <input
                type="hidden"
                name="role"
                value={profile.role === "ADMIN" ? "USER" : "ADMIN"}
              />
              <input type="hidden" name="back" value={`/admin/users/${id}`} />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                aria-label={
                  profile.role === "ADMIN" ? "Remove admin" : "Make admin"
                }
              >
                {profile.role === "ADMIN" ? (
                  <ShieldOff aria-hidden="true" className="size-4" />
                ) : (
                  <ShieldCheck aria-hidden="true" className="size-4" />
                )}
                {profile.role === "ADMIN" ? "Remove admin" : "Make admin"}
              </Button>
            </form>
          )}
          <DeleteUserButton userId={profile.userId} self={isSelf} />
        </div>
      </header>

      {updated ? <SuccessBanner /> : null}
      {error === "last_admin" ? (
        errorBanner(
          "That's the only admin left — keep at least one admin."
        )
      ) : null}
      {error === "self_role" ? (
        errorBanner("You can't change your own role from here.")
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Managed by Neon Auth.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <DetailRow label="Email" value={email} />
            <DetailRow label="Mobile" value={profile.mobile} mono />
            <DetailRow
              label="Enrollment"
              value={profile.enrollmentNumber}
              mono
            />
            <DetailRow
              label="College"
              value={college?.name ?? "Not set"}
            />
            <DetailRow
              label="Joined"
              value={formatDate(profile.createdAt)}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Event registrations</CardTitle>
            <CardDescription>
              {memberRegistrations.length} sign-up
              {memberRegistrations.length === 1 ? "" : "s"}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {memberRegistrations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No registrations yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {memberRegistrations.map((registration) => (
                  <li
                    key={registration.registrationId}
                    className="flex flex-col gap-1 rounded-md border p-3"
                  >
                    <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      <CalendarDays
                        aria-hidden="true"
                        className="size-3.5 text-muted-foreground"
                      />
                      {registration.title}
                      {registration.semester ? (
                        <Badge variant="outline" className="text-xs">
                          Sem {registration.semester}
                        </Badge>
                      ) : null}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(registration.startsAt)}
                      {registration.location
                        ? ` · ${registration.location}`
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Involvement</CardTitle>
          <CardDescription>Contact messages sent by this member.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-md border p-3 text-sm">
            <MessageSquareText
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            <span>
              <span className="font-semibold">{Number(messageCount?.count ?? 0)}</span>{" "}
              message{Number(messageCount?.count ?? 0) === 1 ? "" : "s"} sent via the
              contact form.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={`text-sm font-medium ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function SuccessBanner() {
  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400"
    >
      <Mail aria-hidden="true" className="size-4 shrink-0" />
      Role updated.
    </div>
  );
}