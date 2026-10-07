import { desc, eq, and, lt } from "drizzle-orm";
import { 
  CalendarDays, 
  MapPin, 
  Megaphone, 
  Settings, 
  Trophy, 
  UserPlus,
  Zap,
  AlertCircle,
  Info,
  GitHub,
  LinkedIn
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { useState } from "react";

import { AvatarUpload } from "@/components/profile/avatar-upload";
import { RegistrationSuccessDialog } from "@/components/registration-success-dialog";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
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
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'activity' | 'settings'>('overview');

  // Calculate profile completion percentage
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

  // Get member statistics
  const [myRegistrations, pastRegistrations, announcementsData] = await Promise.all([
    // Upcoming registrations
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
    
    // Past registrations (events that have ended)
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
    
    // Active announcements
    db
      .select()
      .from(announcements)
      .where(eq(announcements.isActive, true))
      .orderBy(desc(announcements.pinned), desc(announcements.createdAt))
      .limit(5)
  ]);

  const firstName = profile.name.split(" ")[0];

  return (
    <>
      {registered ? (
        <RegistrationSuccessDialog message="Welcome to your member portal! Here you can track your journey, manage your profile, and stay updated with community activities." />
      ) : null}

      {/* Profile Completion Banner */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col">
            <p className="tdc-mono-label">tdc / member portal</p>
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
          
          {/* Profile Completion Progress */}
          <div className="w-full sm:w-64">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Profile Completeness</span>
                <span>{profileCompletion}%</span>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2.5">
                <div 
                  className={`bg-primary h-2.5 rounded-full transition-all duration-500`}
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
              {profileCompletion < 100 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Complete your profile to unlock all community features
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Member Statistics */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MemberStatCard 
          label="Events Attended" 
          value={pastRegistrations.length.toString()}
          description="Community events you've participated in"
          icon={CalendarDays}
        />
        <MemberStatCard 
          label="Upcoming Events" 
          value={myRegistrations.filter(r => 
            new Date(r.startsAt) > new Date()
          ).length.toString()}
          description="Events you're registered for"
          icon={Zap}
        />
        <MemberStatCard 
          label="Community Role" 
          value={profile.role === "ADMIN" ? "Admin" : "Member"}
          description="Your role in the TDC community"
          icon={profile.role === "ADMIN" ? Settings : UserPlus}
        />
      </div>

      <div className="mb-6">
        {/* Tab Navigation */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-4 py-3 text-sm font-medium text-center 
              ${activeTab === 'overview' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 px-4 py-3 text-sm font-medium text-center
              ${activeTab === 'events'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'}`}
          >
            My Events
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 px-4 py-3 text-sm font-medium text-center
              ${activeTab === 'activity'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'}`}
          >
            Activity
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-4 py-3 text-sm font-medium text-center
              ${activeTab === 'settings'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'}`}
          >
            Settings
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewSection 
            profile={profile} 
            college={college} 
            avatarUrl={avatarUrl}
            announcements={announcementsData}
          />
        )}
        
        {activeTab === 'events' && (
          <EventsSection 
            upcoming={myRegistrations} 
            past={pastRegistrations}
          />
        )}
        
        {activeTab === 'activity' && (
          <ActivitySection 
            profile={profile}
          />
        )}
        
        {activeTab === 'settings' && (
          <SettingsSection 
            profile={profile}
          />
        )}
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

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(profile: any): number {
  let completed = 0;
  const totalFields = 6; // name, mobile, collegeId, enrollmentNumber, avatarKey, userId (from auth)
  
  // Check each field that contributes to profile completeness
  if (profile.name) completed++;
  if (profile.mobile) completed++;
  if (profile.collegeId) completed++;
  if (profile.enrollmentNumber) completed++;
  if (profile.avatarKey) completed++;
  // userId comes from auth session, so we'll count it as completed if we have a profile
  if (profile.id) completed++;
  
  return Math.round((completed / totalFields) * 100);
}

// Member Stat Card Component
function MemberStatCard({ 
  label, 
  value, 
  description, 
  icon 
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  const Icon = icon;
  
  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="size-5 text-primary" aria-hidden="true" />
            <div>
              <h3 className="font-medium">{label}</h3>
              <p className="text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Overview Section
function OverviewSection({ 
  profile, 
  college, 
  avatarUrl,
  announcements 
}: {
  profile: any;
  college: any;
  avatarUrl: string | null;
  announcements: any[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>About You</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Name
              </span>
              <span className="text-sm font-medium">{profile.name}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Email
              </span>
              <span className="break-all text-sm font-medium">{session.user.email}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Mobile
              </span>
              <span className="text-sm font-medium mono">{profile.mobile}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Enrollment
              </span>
              <span className="text-sm font-medium mono">{profile.enrollmentNumber}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                College
              </span>
              <span className="text-sm font-medium">
                {college ? `${college.name} (${college.code})` : "Not set"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Member Since
              </span>
              <span className="text-sm font-medium">
                {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Skills & Interests</CardTitle>
            <CardDescription>Showcase what you're passionate about</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {/* These would come from extended profile fields in a real implementation */}
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                Web Development
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                JavaScript
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                React
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                Open Source
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
            >
              Add Skills
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {announcements.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Megaphone aria-hidden="true" className="size-5" />
            </span>
            <div>
              <CardTitle className="text-sm font-semibold">
                Latest Announcements
              </CardTitle>
              <CardDescription className="text-xs">
                From the TDC team
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="border p-3 rounded-md">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">{announcement.title}</h3>
                  {announcement.pinned && (
                    <Badge variant="secondary" size="sm">
                      Pinned
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {announcement.body}
                </p>
                <time className="text-xs text-muted-foreground">
                  {new Date(announcement.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </time>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Events Section
function EventsSection({ 
  upcoming, 
  past 
}: {
  upcoming: any[];
  past: any[];
}) {
  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Events you're registered for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcoming.map((event) => (
                <div key={event.registrationId} className="border p-3 rounded-md">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">{event.title}</h3>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      Upcoming
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-4" aria-hidden="true" />
                      <span>
                        {new Date(event.startsAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4" aria-hidden="true" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                    {event.endsAt && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        Ends: 
                        {new Date(event.endsAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
      
      {past.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Events</CardTitle>
            <CardDescription>Events you've attended</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {past.map((event) => (
              <div key={event.registrationId} className="border p-3 rounded-md">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">{event.title}</h3>
                  <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full">
                    Attended
                  </span>
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    <span>
                      {new Date(event.startsAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4" aria-hidden="true" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  Duration: 
                  {/* Calculate duration */}
                  {new Date(event.endsAt).getDate() - new Date(event.startsAt).getDate() + 1} days
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {(upcoming.length === 0 && past.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Event Registrations</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              You haven't registered for any events yet.
            </p>
            <Link href="/events" className="mt-4 inline-block">
              <Button variant="outline">Browse Events</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Activity Section
function ActivitySection({ profile }: { profile: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Community Activity</CardTitle>
          <CardDescription>Your engagement with the TDC community</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="border p-3 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Events Participated</h3>
                <span className="text-2xl font-bold">0</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Community events you've attended
              </p>
            </div>
            <div className="border p-3 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Connections Made</h3>
                <span className="text-2xl font-bold">0</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Members you've connected with
              </p>
            </div>
            <div className="border p-3 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Contributions</h3>
                <span className="text-2xl font-bold">0</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Resources shared or created
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Placeholder for recent activity feed */}
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No recent activity to display
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Start participating in events to see your activity here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Settings Section
function SettingsSection({ profile }: { profile: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="size-5 text-primary" aria-hidden="true" />
              <div>
                <span className="font-medium">Event Updates</span>
                <p className="text-sm text-muted-foreground">
                  Get notified about upcoming events and registrations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={true} className="h-4 w-8" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 text-destructive" aria-hidden="true" />
              <div>
                <span className="font-medium">Announcements</span>
                <p className="text-sm text-muted-foreground">
                  Receive important community announcements
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={true} className="h-4 w-8" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="size-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <span className="font-medium">Newsletter</span>
                <p className="text-sm text-muted-foreground">
                  Monthly community newsletter and highlights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={false} className="h-4 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Visibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserPlus className="size-5 text-primary" aria-hidden="true" />
              <div>
                <span className="font-medium">Profile Discovery</span>
                <p className="text-sm text-muted-foreground">
                  Allow other members to find and connect with you
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={true} className="h-4 w-8" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitHub className="size-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <span className="font-medium">Social Sharing</span>
                <p className="text-sm text-muted-foreground">
                  Share your profile on social platforms
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={false} className="h-4 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline"
            size="sm"
            className="w-full"
          >
            Export My Data
          </Button>
          <Button 
            variant="destructive"
            size="sm"
            className="w-full mt-3"
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Switch Component (simple implementation)
function Switch({ 
  checked, 
  className, 
  ...props 
}: {
  checked: boolean;
  className?: string;
}) {
  return (
    <div className={`relative h-6 w-11 ${className ?? ""}`}>
      <input
        type="checkbox"
        checked={checked}
        className="sr-only peer"
        {...props}
      />
      <div className="pointer-events-none inline-flex h-full w-full cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out">
        <div className={`pointer-events-none inline-flex h-5 w-5 rounded-full bg-white ring-0 shadow-md transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'} `} />
      </div>
    </div>
  );
}