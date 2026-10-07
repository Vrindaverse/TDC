import { desc, eq } from "drizzle-orm";
import { CalendarDays, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AvatarUpload } from "@/components/profile/avatar-upload";
import { RegistrationSuccessDialog } from "@/components/registration-success-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOutAction } from "@/lib/auth/actions";
import { avatarPublicUrl } from "@/lib/avatar";
import { requireProfile } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { colleges, events, registrations } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Profile",
};

export const instant = false;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const { registered } = await searchParams;
  const { session, profile } = await requireProfile();
  const avatarUrl = profile.avatarKey
    ? avatarPublicUrl(profile.avatarKey)
    : null;

  const college = profile.collegeId
    ? (
        await db
          .select({
            name: colleges.name,
            code: colleges.code,
          })
          .from(colleges)
          .where(eq(colleges.id, profile.collegeId))
          .limit(1)
      )[0]
    : null;

  const myRegistrations = await db
    .select({
      registrationId: registrations.id,
      createdAt: registrations.createdAt,
      eventId: events.id,
      title: events.title,
      startsAt: events.startsAt,
      location: events.location,
    })
    .from(registrations)
    .innerJoin(events, eq(registrations.eventId, events.id))
    .where(eq(registrations.profileId, profile.id))
    .orderBy(desc(registrations.createdAt))
    .limit(10);

  const firstName = profile.name.split(" ")[0];

  return (
    <>
      {registered ? (
        <RegistrationSuccessDialog message="You can track and manage your sign-ups here." />
      ) : null}

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 md:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="tdc-mono-label">tdc / profile</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back, {firstName}
            </h1>
            {profile.role === "ADMIN" ? (
              <Link href="/admin">
                <Badge>Admin</Badge>
              </Link>
            ) : null}
          </div>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </header>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-6 pt-6">
          <AvatarUpload name={profile.name} avatarUrl={avatarUrl} />
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {profile.role === "ADMIN" ? "TDC admin" : "TDC member"}
            </p>
            <h2 className="truncate text-lg font-semibold tracking-tight">
              {profile.name}
            </h2>
            <p className="truncate text-sm text-muted-foreground">
              {college ? `${college.name} (${college.code})` : "No college set"}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your details</CardTitle>
            <CardDescription>Managed by Neon Auth.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ProfileRow label="Name" value={profile.name} />
            <ProfileRow label="Email" value={session.user.email} />
            <ProfileRow
              label="Mobile"
              value={profile.mobile}
              className="font-mono"
            />
            <ProfileRow
              label="Enrollment"
              value={profile.enrollmentNumber}
              className="font-mono"
            />
            <ProfileRow
              label="College"
              value={college ? `${college.name} (${college.code})` : "Not set"}
            />
            <ProfileRow
              label="Member since"
              value={formatDate(profile.createdAt)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event registrations</CardTitle>
            <CardDescription>Your latest sign-ups.</CardDescription>
          </CardHeader>
          <CardContent>
            {myRegistrations.length === 0 ? (
              <div className="flex flex-col items-start gap-3 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                <p>You haven&apos;t registered for any events yet.</p>
                <Link href="/events">
                  <Button size="sm" variant="outline">
                    Browse events
                  </Button>
                </Link>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {myRegistrations.map((registration) => (
                  <li
                    key={registration.registrationId}
                    className="flex flex-col gap-1 rounded-md border p-3"
                  >
                    <span className="text-sm font-medium">
                      {registration.title}
                    </span>
                    <span className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays
                          aria-hidden="true"
                          className="size-3.5"
                        />
                        {formatDate(registration.startsAt)}
                      </span>
                      {registration.location ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin aria-hidden="true" className="size-3.5" />
                          {registration.location}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}

function ProfileRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={`text-sm font-medium ${className ?? ""}`}>{value}</span>
    </div>
  );
}