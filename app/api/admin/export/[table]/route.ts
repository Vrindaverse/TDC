import { desc } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { getProfile } from "@/lib/auth/guards";
import { auth } from "@/lib/auth/server";
import {
  adminMessagesRows,
  adminRegistrationsRows,
  adminUsersRows,
} from "@/lib/admin/list-queries";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";

type TableName = "registrations" | "users" | "messages" | "events";

export const maxDuration = 30;

function toIso(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function csvCell(value: unknown): string {
  if (value == null) return "";
  const text =
    value instanceof Date ? value.toISOString() : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(headers: string[], rows: (string | number | boolean | Date | null)[][]): string {
  const headerLine = headers.map(csvCell).join(",");
  const body = rows.map((row) => row.map(csvCell).join(","));
  return [headerLine, ...body].join("\n");
}

function unauthorized() {
  return new Response("Unauthorized", { status: 401 });
}

function notFound() {
  return new Response("Not found", { status: 404 });
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ table: string }> }
) {
  const table = (await context.params).table as TableName;
  if (!["registrations", "users", "messages", "events"].includes(table)) {
    return notFound();
  }

  const session = await auth.getSession();
  if (!session?.data?.user) return unauthorized();
  const profile = await getProfile(session.data.user.id);
  if (!profile || profile.role !== "ADMIN") return unauthorized();

  let filename = "tdc-export.csv";
  let headers: string[] = [];
  let body: (string | number | boolean | Date | null)[][] = [];

  if (table === "registrations") {
    headers = [
      "Name",
      "Email",
      "Mobile",
      "Enrollment",
      "Semester",
      "Event",
      "Event date",
      "College",
      "Type",
      "Registered at",
    ];
    const rows = await adminRegistrationsRows();
    body = rows.map((row) => [
      row.name,
      row.email,
      row.mobile,
      row.enrollmentNumber,
      row.semester,
      row.title,
      toIso(row.startsAt),
      row.college,
      row.isMember ? "Member" : "Guest",
      toIso(row.createdAt),
    ]);
    filename = "tdc-registrations.csv";
  } else if (table === "users") {
    headers = [
      "Name",
      "Email",
      "Mobile",
      "Enrollment",
      "Role",
      "College",
      "Email verified",
      "Joined at",
    ];
    const { rows } = await adminUsersRows({ pageSize: 500 });
    body = rows.map((row) => [
      row.name,
      row.email,
      row.mobile,
      row.enrollmentNumber,
      row.role,
      row.college,
      row.emailVerified ? "Yes" : "No",
      toIso(row.createdAt),
    ]);
    filename = "tdc-members.csv";
  } else if (table === "messages") {
    headers = [
      "Category",
      "Subject",
      "Message",
      "From",
      "Email",
      "College",
      "Status",
      "Created at",
    ];
    const rows = await adminMessagesRows();
    body = rows.map((row) => [
      row.category,
      row.subject,
      row.message,
      row.name,
      row.email,
      row.college,
      row.status,
      toIso(row.createdAt),
    ]);
    filename = "tdc-messages.csv";
  } else {
    headers = [
      "Title",
      "Description",
      "Domain",
      "Location",
      "Status",
      "Starts at",
      "Ends at",
      "Created at",
    ];
    const rows = await db
      .select()
      .from(events)
      .orderBy(desc(events.startsAt))
      .limit(1000);
    body = rows.map((row) => [
      row.title,
      row.description,
      row.domain,
      row.location,
      row.registrationStatus,
      toIso(row.startsAt),
      toIso(row.endsAt),
      toIso(row.createdAt),
    ]);
    filename = "tdc-events.csv";
  }

  return new Response(toCsv(headers, body), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}