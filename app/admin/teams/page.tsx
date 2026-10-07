import { desc, eq } from "drizzle-orm";
import { Users } from "lucide-react";

import { assignTeamAction, createTeamAction } from "@/app/admin/actions";
import { CsrfInput } from "@/components/csrf-input";
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
import { db } from "@/lib/db";
import { profiles, teams } from "@/lib/db/schema";

export const instant = false;

export default async function AdminTeamsPage({
  searchParams,
}: {
  searchParams: Promise<{
    created?: string;
    assigned?: string;
    error?: string;
  }>;
}) {
  const { created, assigned, error } = await searchParams;

  const [teamRows, memberRows, approvedMembers] = await Promise.all([
    db.select().from(teams).orderBy(teams.name),
    db
      .select({
        id: profiles.id,
        name: profiles.name,
        teamId: profiles.teamId,
        status: profiles.status,
      })
      .from(profiles)
      .where(eq(profiles.status, "approved"))
      .orderBy(desc(profiles.createdAt)),
    db
      .select({ id: profiles.id, name: profiles.name })
      .from(profiles)
      .where(eq(profiles.status, "approved"))
      .orderBy(profiles.name),
  ]);

  const membersByTeam = new Map<string, typeof memberRows>();
  for (const member of memberRows) {
    if (!member.teamId) continue;
    const list = membersByTeam.get(member.teamId) ?? [];
    list.push(member);
    membersByTeam.set(member.teamId, list);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5 rounded-xl border bg-gradient-to-r from-card to-card/80 px-5 py-5 shadow-sm">
        <p className="tdc-mono-label text-[11px] text-primary">
          consoles / teams
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
        <p className="text-sm text-muted-foreground">
          Create teams and assign approved members to them.
        </p>
      </header>

      {created ? (
        <p role="status" className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
          Team created.
        </p>
      ) : null}
      {assigned ? (
        <p role="status" className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
          Member assignment updated.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error === "duplicate"
            ? "A team with that name already exists."
            : error === "bad_name"
              ? "Team name must be 2–60 characters."
              : "Something went wrong. Please try again."}
        </p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New team</CardTitle>
            <CardDescription>e.g. Web Dev, AI/ML, Cybersecurity</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createTeamAction} className="flex flex-col gap-3">
              <CsrfInput />
              <div className="flex flex-col gap-2">
                <Label htmlFor="team-name">Team name</Label>
                <Input id="team-name" name="name" placeholder="Web Development" />
              </div>
              <Button type="submit" className="sm:w-fit">
                Create team
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assign member</CardTitle>
            <CardDescription>
              Only approved members can be assigned.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={assignTeamAction} className="flex flex-col gap-3">
              <CsrfInput />
              <div className="flex flex-col gap-2">
                <Label htmlFor="assign-member">Member</Label>
                <select
                  id="assign-member"
                  name="profileId"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {approvedMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="assign-team">Team</Label>
                <select
                  id="assign-team"
                  name="teamId"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">No team</option>
                  {teamRows.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="sm:w-fit">
                Assign
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-3 space-y-0 border-b pb-4">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users aria-hidden="true" className="size-5" />
          </span>
          <CardTitle className="text-base font-semibold">All teams</CardTitle>
          <CardDescription>{teamRows.length} teams</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-4">
          {teamRows.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">
              No teams yet. Create the first one above.
            </p>
          ) : (
            teamRows.map((team) => {
              const members = membersByTeam.get(team.id) ?? [];
              return (
                <div key={team.id} className="rounded-md border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium">{team.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {members.length} member{members.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  {members.length > 0 ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {members.map((member) => (
                        <li
                          key={member.id}
                          className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary"
                        >
                          {member.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No members assigned yet.
                    </p>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
