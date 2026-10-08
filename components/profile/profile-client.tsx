"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  Info,
  LogOut,
  MapPin,
  Megaphone,
  Share2,
  Trophy,
  UserPlus,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { RegistrationSuccessDialog } from "@/components/registration-success-dialog";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
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
import {
  cancelRegistrationAction,
  type SimpleActionState,
} from "@/app/profile/actions";
import { useCsrfToken } from "@/hooks/use-csrf";
import { daysUntil, formatDate } from "@/lib/format";
import {
  TeamPostsSection,
  type ApprovedTeamPost,
  type MyTeamPost,
} from "@/components/profile/team-posts";
import { EditProfileForm } from "@/components/profile/edit-profile-form";

type Profile = {
  id: string;
  name: string;
  mobile: string;
  collegeId: string | null;
  enrollmentNumber: string;
  avatarKey: string | null;
  role: string;
  createdAt: Date;
  skills: string[];
  bio: string | null;
};

type Registration = {
  registrationId: string;
  createdAt: Date;
  eventId: string;
  title: string;
  startsAt: Date;
  endsAt: Date | null;
  location: string | null;
};

type Announcement = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: Date;
};

type College = {
  name: string;
  code: string;
} | null;

type Tab = "overview" | "events" | "team" | "settings";

const PROFILE_ERROR_LABELS: Record<string, string> = {
  csrf: "Your session expired. Refresh the page and try again.",
  not_found: "That registration no longer exists.",
  invalid_registration: "That registration isn't in your account.",
  event_started: "That event has already started, so it can't be cancelled.",
};

export function ProfileClient({
  registered,
  cancelled,
  error,
  profile,
  avatarUrl,
  profileCompletion,
  college,
  teamName,
  myRegistrations,
  pastRegistrations,
  announcementsData,
  email,
  collegeList,
  approvedTeamPosts,
  myTeamPosts,
  upcomingEventList,
}: {
  registered: string | undefined;
  cancelled: string | undefined;
  error: string | undefined;
  profile: Profile;
  avatarUrl: string | null;
  profileCompletion: number;
  college: College;
  teamName: string | null;
  myRegistrations: Registration[];
  pastRegistrations: Registration[];
  announcementsData: Announcement[];
  email: string;
  collegeList: { id: string; name: string; code: string }[];
  approvedTeamPosts: ApprovedTeamPost[];
  myTeamPosts: MyTeamPost[];
  upcomingEventList: { id: string; title: string }[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const firstName = profile.name.split(" ")[0];

  const [now] = useState(() => Date.now());
  const upcoming = myRegistrations.filter(
    (r) => new Date(r.startsAt).getTime() > now,
  );
  const ongoing = myRegistrations.filter((r) => {
    const start = new Date(r.startsAt).getTime();
    const end = r.endsAt ? new Date(r.endsAt).getTime() : start;
    return start <= now && end >= now;
  });

  return (
    <>
      {registered ? (
        <RegistrationSuccessDialog message="Welcome to your member portal! Track your events, manage your profile, and stay updated with the community." />
      ) : null}

      {cancelled ? (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-foreground"
        >
          <Info
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-primary"
          />
          <p>Your registration was cancelled. The seat is free again.</p>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm"
        >
          <AlertCircle
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-destructive"
          />
          <p>{PROFILE_ERROR_LABELS[error] ?? "Something went wrong. Please try again."}</p>
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-4">
          <AvatarUpload name={profile.name} avatarUrl={avatarUrl} />
          <div>
            <p className="tdc-mono-label">tdc / member portal</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-muted-foreground">{email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {profile.role === "ADMIN" ? (
                <Link href="/admin">
                  <Badge>Admin</Badge>
                </Link>
              ) : (
                <Badge variant="secondary">Member</Badge>
              )}
              {college ? <Badge variant="outline">{college.code}</Badge> : null}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-72">
          <div className="flex justify-between text-sm font-medium">
            <span>Profile completeness</span>
            <span>{profileCompletion}%</span>
          </div>
          <div className="mt-2 h-2.5 w-full rounded-full bg-muted/50">
            <div
              className="h-2.5 rounded-full bg-primary transition-all duration-500"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          {profileCompletion < 100 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Add your avatar and college to complete your profile.
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              Your profile is complete.
            </p>
          )}
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MemberStatCard
          label="Upcoming"
          value={upcoming.length.toString()}
          description="Registered events ahead"
          icon={Zap}
        />
        <MemberStatCard
          label="Happening now"
          value={ongoing.length.toString()}
          description="Events in progress"
          icon={CalendarDays}
        />
        <MemberStatCard
          label="Attended"
          value={pastRegistrations.length.toString()}
          description="Past community events"
          icon={Trophy}
        />
        <MemberStatCard
          label="Announcements"
          value={announcementsData.length.toString()}
          description="Latest from the TDC team"
          icon={Megaphone}
        />
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b">
        {(
          [
            ["overview", "Overview"],
            ["events", "My Events"],
            ["team", "Team Finder"],
            ["settings", "Settings"],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <OverviewSection
          profile={profile}
          college={college}
          teamName={teamName}
          announcements={announcementsData}
          email={email}
        />
      )}
      {activeTab === "events" && (
        <EventsSection
          upcoming={upcoming}
          ongoing={ongoing}
          past={pastRegistrations}
        />
      )}
      {activeTab === "team" && (
        <TeamPostsSection
          approvedPosts={approvedTeamPosts}
          myPosts={myTeamPosts}
          events={upcomingEventList}
        />
      )}
      {activeTab === "settings" && (
        <SettingsSection profile={profile} collegeList={collegeList} />
      )}
    </>
  );
}

function OverviewSection({
  profile,
  college,
  teamName,
  announcements,
  email,
}: {
  profile: Profile;
  college: College;
  teamName: string | null;
  announcements: Announcement[];
  email: string;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>About you</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="Name" value={profile.name} />
            <DetailRow label="Email" value={email} className="break-all" />
            <DetailRow label="Mobile" value={profile.mobile} />
            <DetailRow label="Enrollment" value={profile.enrollmentNumber} />
            <DetailRow
              label="College"
              value={college ? `${college.name} (${college.code})` : "Not set"}
            />
            <DetailRow label="Team" value={teamName ?? "Not assigned"} />
            <DetailRow
              label="Member since"
              value={formatDate(profile.createdAt)}
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Bio
              </span>
              <span className="text-sm">
                {profile.bio?.trim() ? profile.bio : "No bio yet — add one in Settings."}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.length > 0 ? (
                  profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No skills listed yet.
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump back into the community</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <QuickAction
              href="/events"
              title="Browse events"
              description="Find your next workshop or hackathon"
            />
            <QuickAction
              href="/join"
              title="Register now"
              description="Register for an upcoming event"
            />
            <QuickAction
              href="/contact"
              title="Contact team"
              description="Reach out with questions"
            />
            <QuickAction
              href="/about"
              title="About TDC"
              description="Learn what the community offers"
            />
          </CardContent>
        </Card>
      </div>

      {announcements.length > 0 ? (
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Megaphone aria-hidden="true" className="size-5" />
            </span>
            <div>
              <CardTitle className="text-sm font-semibold">
                Latest announcements
              </CardTitle>
              <CardDescription className="text-xs">
                From the TDC team
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnnouncementsFilter announcements={announcements} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function EventsSection({
  upcoming,
  ongoing,
  past,
}: {
  upcoming: Registration[];
  ongoing: Registration[];
  past: Registration[];
}) {
  const empty =
    upcoming.length === 0 && ongoing.length === 0 && past.length === 0;

  return (
    <div className="space-y-6">
      {ongoing.length > 0 ? (
        <EventListCard
          title="Happening now"
          description="Events you're part of right now"
          events={ongoing}
          variant="live"
        />
      ) : null}

      {upcoming.length > 0 ? (
        <EventListCard
          title="Upcoming events"
          description="Events you're registered for"
          events={upcoming}
          variant="upcoming"
        />
      ) : null}

      {past.length > 0 ? (
        <EventListCard
          title="Past events"
          description="Events you've attended"
          events={past}
          variant="past"
        />
      ) : null}

      {empty ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              You haven&apos;t registered for any events yet.
            </p>
            <Link href="/events" className="mt-4 inline-block">
              <Button variant="outline">Browse events</Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function EventListCard({
  title,
  description,
  events,
  variant,
}: {
  title: string;
  description: string;
  events: Registration[];
  variant: "upcoming" | "live" | "past";
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((event) => (
          <div key={event.registrationId} className="rounded-md border p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="font-medium">{event.title}</h3>
              <EventBadge event={event} variant={variant} />
            </div>
            <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4" aria-hidden="true" />
                <span>{formatDate(event.startsAt)}</span>
              </div>
              {event.location ? (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" aria-hidden="true" />
                  <span>{event.location}</span>
                </div>
              ) : null}
              {event.endsAt ? (
                <p className="text-xs">Ends {formatDate(event.endsAt)}</p>
              ) : null}
            </div>
            <EventActions event={event} variant={variant} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EventBadge({
  event,
  variant,
}: {
  event: Registration;
  variant: "upcoming" | "live" | "past";
}) {
  if (variant === "live") {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        Live now
      </Badge>
    );
  }
  if (variant === "past") {
    return <Badge variant="secondary">Attended</Badge>;
  }
  const days = daysUntil(event.startsAt);
  if (days <= 0) {
    return <Badge variant="secondary">Starts today</Badge>;
  }
  return (
    <Badge variant="outline">
      {days === 1 ? "Tomorrow" : `In ${days} days`}
    </Badge>
  );
}

function SettingsSection({
  profile,
  collegeList,
}: {
  profile: Profile;
  collegeList: { id: string; name: string; code: string }[];
}) {
  const [prefs, setPrefs] = useState({
    eventUpdates: true,
    announcements: true,
    newsletter: false,
    profileDiscovery: true,
    socialSharing: false,
  });

  const toggle = (key: keyof typeof prefs) =>
    setPrefs((previous) => ({ ...previous, [key]: !previous[key] }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Signed in as {profile.enrollmentNumber}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="mr-2 size-4" aria-hidden="true" />
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
          <CardDescription>
            Update your details, bio, and skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditProfileForm
            name={profile.name}
            mobile={profile.mobile}
            collegeId={profile.collegeId}
            colleges={collegeList}
            enrollmentNumber={profile.enrollmentNumber}
            bio={profile.bio}
            skills={profile.skills}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Change your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification preferences</CardTitle>
          <CardDescription>
            Choose which updates you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PreferenceToggle
            icon={Zap}
            title="Event updates"
            description="Notices about upcoming events and registrations"
            checked={prefs.eventUpdates}
            onToggle={() => toggle("eventUpdates")}
          />
          <PreferenceToggle
            icon={AlertCircle}
            title="Announcements"
            description="Important community announcements"
            checked={prefs.announcements}
            onToggle={() => toggle("announcements")}
          />
          <PreferenceToggle
            icon={Info}
            title="Newsletter"
            description="Monthly community newsletter and highlights"
            checked={prefs.newsletter}
            onToggle={() => toggle("newsletter")}
          />
          <PreferenceToggle
            icon={UserPlus}
            title="Profile discovery"
            description="Let other members find and connect with you"
            checked={prefs.profileDiscovery}
            onToggle={() => toggle("profileDiscovery")}
          />
          <PreferenceToggle
            icon={Share2}
            title="Social sharing"
            description="Allow sharing your profile on social platforms"
            checked={prefs.socialSharing}
            onToggle={() => toggle("socialSharing")}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function PreferenceToggle({
  icon: Icon,
  title,
  description,
  checked,
  onToggle,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Icon className="size-5 text-primary" aria-hidden="true" />
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block size-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function DetailRow({
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

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-md border p-3 transition-colors hover:bg-muted/50"
    >
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Link>
  );
}

function MemberStatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
}) {
  const Icon = icon;
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function AnnouncementsFilter({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const [filter, setFilter] = useState<"all" | "pinned">("all");
  const visible =
    filter === "pinned"
      ? announcements.filter((a) => a.pinned)
      : announcements;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(["all", "pinned"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {value === "all" ? "All" : "Pinned"}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No pinned announcements.
        </p>
      ) : (
        visible.map((announcement) => (
          <div key={announcement.id} className="rounded-md border p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <h3 className="font-medium">{announcement.title}</h3>
              {announcement.pinned ? (
                <Badge variant="secondary">Pinned</Badge>
              ) : null}
            </div>
            <p className="mb-2 text-sm text-muted-foreground">
              {announcement.body}
            </p>
            <time className="text-xs text-muted-foreground">
              {formatDate(announcement.createdAt)}
            </time>
          </div>
        ))
      )}
    </div>
  );
}

function EventActions({
  event,
  variant,
}: {
  event: Registration;
  variant: "upcoming" | "live" | "past";
}) {
  const [copied, setCopied] = useState(false);
  const [state, formAction, pending] = useActionState<
    SimpleActionState,
    FormData
  >(cancelRegistrationAction, null);
  const csrfToken = useCsrfToken();

  function share() {
    const text = `${event.title} — ${formatDate(event.startsAt)}${
      event.location ? ` @ ${event.location}` : ""
    }`;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <button
        type="button"
        onClick={share}
        className="rounded-md border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {copied ? "Copied!" : "Copy details"}
      </button>
      {variant !== "past" ? (
        <form action={formAction} className="inline">
          <input type="hidden" name="_csrf" value={csrfToken} />
          <input
            type="hidden"
            name="registrationId"
            value={event.registrationId}
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md border border-destructive/40 px-2.5 py-1 text-xs text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
          >
            {pending ? "Cancelling…" : "Cancel registration"}
          </button>
        </form>
      ) : null}
      {state?.error ? (
        <span role="alert" className="text-xs text-destructive">
          {state.error}
        </span>
      ) : null}
    </div>
  );
}
