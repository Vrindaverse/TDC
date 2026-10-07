import type { Metadata } from "next";
import Link from "next/link";
import { eq, and, lt, desc } from "drizzle-orm";
import { ProfileClient, calculateProfileCompletion } from "@/components/profile/profile-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOutAction } from "@/lib/auth/actions";
import { avatarPublicUrl } from "@/lib/avatar";
import { requireProfile } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { announcements, colleges, events, registrations } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Member Portal",
};

export const instant = false;

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
  const profileCompletion = calculateProfileCompletion(profile);

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

  const [myRegistrations, pastRegistrations, announcementsData] = await Promise.all([
    db
      .select({
        registrationId: registrations.id,
        createdAt: registrations.createdAt,
        eventId: events.id,
        title: events.title,
        startsAt: events.startsAt,
        endsAt: events.endsAt,
        location: events.location,
      })
      .from(registrations)
      .innerJoin(events, eq(registrations.eventId, events.id))
      .where(eq(registrations.profileId, profile.id))
      .orderBy(desc(registrations.createdAt))
      .limit(10),
    
    db
      .select({
        registrationId: registrations.id,
        createdAt: registrations.createdAt,
        eventId: events.id,
        title: events.title,
        startsAt: events.startsAt,
        endsAt: events.endsAt,
        location: events.location,
      })
      .from(registrations)
      .innerJoin(events, eq(registrations.eventId, events.id))
      .where(
        and(
          eq(registrations.profileId, profile.id),
          lt(events.endsAt, new Date())
        )
      )
      .orderBy(desc(registrations.createdAt))
      .limit(5),
    
    db
      .select()
      .from(announcements)
      .where(eq(announcements.isActive, true))
      .orderBy(desc(announcements.pinned), desc(announcements.createdAt))
      .limit(5)
  ]);

  return (
    <ProfileClient
      registered={registered}
      profile={profile}
      avatarUrl={avatarUrl}
      profileCompletion={profileCompletion}
      college={college}
      myRegistrations={myRegistrations}
      pastRegistrations={pastRegistrations}
      announcementsData={announcementsData}
      email={session.user.email}
    />
  );
}
