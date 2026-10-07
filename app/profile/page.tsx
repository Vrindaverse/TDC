import type { Metadata } from "next";
import { eq, and, lt, desc } from "drizzle-orm";
import { ProfileClient } from "@/components/profile/profile-client";
import {
  PendingApprovalScreen,
  RejectedApprovalScreen,
} from "@/components/profile/membership-gate";
import { calculateProfileCompletion } from "@/lib/profile-completion";
import { avatarPublicUrl } from "@/lib/avatar";
import { requireProfile } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import {
  announcements,
  colleges,
  events,
  profiles,
  registrations,
  teamPosts,
  teams,
} from "@/lib/db/schema";

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

  if (profile.status === "pending") {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <PendingApprovalScreen />
      </div>
    );
  }
  if (profile.status === "rejected") {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <RejectedApprovalScreen />
      </div>
    );
  }
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

  const team = profile.teamId
    ? (
        await db
          .select({ name: teams.name })
          .from(teams)
          .where(eq(teams.id, profile.teamId))
          .limit(1)
      )[0]
    : null;

  const [myRegistrations, pastRegistrations, announcementsData, collegeList] =
    await Promise.all([
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
            lt(events.endsAt, new Date()),
          ),
        )
        .orderBy(desc(registrations.createdAt))
        .limit(5),

      db
        .select()
        .from(announcements)
        .where(eq(announcements.isActive, true))
        .orderBy(desc(announcements.pinned), desc(announcements.createdAt))
        .limit(5),

      db
        .select({ id: colleges.id, name: colleges.name, code: colleges.code })
        .from(colleges)
        .where(eq(colleges.isActive, true))
        .orderBy(colleges.name),
    ]);

  const [approvedTeamPosts, myTeamPosts, upcomingEventList] =
    await Promise.all([
      db
        .select({
          id: teamPosts.id,
          title: teamPosts.title,
          body: teamPosts.body,
          createdAt: teamPosts.createdAt,
          authorName: profiles.name,
          eventTitle: events.title,
        })
        .from(teamPosts)
        .innerJoin(profiles, eq(teamPosts.profileId, profiles.id))
        .leftJoin(events, eq(teamPosts.eventId, events.id))
        .where(eq(teamPosts.status, "approved"))
        .orderBy(desc(teamPosts.createdAt))
        .limit(10),

      db
        .select({
          id: teamPosts.id,
          title: teamPosts.title,
          status: teamPosts.status,
          createdAt: teamPosts.createdAt,
        })
        .from(teamPosts)
        .where(eq(teamPosts.profileId, profile.id))
        .orderBy(desc(teamPosts.createdAt))
        .limit(10),

      db
        .select({ id: events.id, title: events.title })
        .from(events)
        .orderBy(desc(events.startsAt))
        .limit(20),
    ]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <ProfileClient
        registered={registered}
        profile={profile}
        avatarUrl={avatarUrl}
        profileCompletion={profileCompletion}
        college={college}
        teamName={team?.name ?? null}
        myRegistrations={myRegistrations}
        pastRegistrations={pastRegistrations}
        announcementsData={announcementsData}
        email={session.user.email}
        collegeList={collegeList}
        approvedTeamPosts={approvedTeamPosts}
        myTeamPosts={myTeamPosts}
        upcomingEventList={upcomingEventList}
      />
    </div>
  );
}
