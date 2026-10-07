import { desc } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { getProfile } from "@/lib/auth/guards";
import { auth } from "@/lib/auth/server";
import {
  adminAuditRows,
  adminCollegesRows,
  adminMessagesRows,
  adminRegistrationsRows,
  adminUsersRows,
  MESSAGE_CATEGORIES,
} from "@/lib/admin/list-queries";
import { AUDIT_ACTIONS } from "@/lib/admin/audit";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";

const TABLES = [
  "registrations",
  "users",
  "messages",
  "events",
  "colleges",
  "activity",
] as const;

type TableName = (typeof TABLES)[number];

const EXPORT_ROW_LIMIT = 5000;

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

function searchParam(request: NextRequest, key: string): string | undefined {
  const value = request.nextUrl.searchParams.get(key)?.trim();
  return value ? value.slice(0, 100) : undefined;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ table: string }> }
) {
  const table = (await context.params).table as TableName;
  if (!TABLES.includes(table)) {
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
    const rawEvent = request.nextUrl.searchParams.get("event");
    const eventId =
      rawEvent && /^[0-9a-f-]{36}$/i.test(rawEvent) ? rawEvent : undefined;
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
    const { rows } = await adminRegistrationsRows({
      eventId,
      q: searchParam(request, "q"),
      pageSize: EXPORT_ROW_LIMIT,
    });
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
    filename = eventId ? "tdc-registrations-event.csv" : "tdc-registrations.csv";
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
    const { rows } = await adminUsersRows({ pageSize: EXPORT_ROW_LIMIT });
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
    const rawStatus = request.nextUrl.searchParams.get("status");
    const rawCategory = request.nextUrl.searchParams.get("category");
    headers = [
      "Category",
      "Subject",
      "Message",
      "From",
      "Email",
      "College",
      "Status",
      "Created at",
      "Read at",
    ];
    const { rows } = await adminMessagesRows({
      q: searchParam(request, "q"),
      category:
        rawCategory && (MESSAGE_CATEGORIES as readonly string[]).includes(rawCategory)
          ? rawCategory
          : undefined,
      status: rawStatus === "new" || rawStatus === "read" ? rawStatus : undefined,
      pageSize: EXPORT_ROW_LIMIT,
    });
    body = rows.map((row) => [
      row.category,
      row.subject,
      row.message,
      row.name,
      row.email,
      row.college,
      row.status,
      toIso(row.createdAt),
      toIso(row.readAt),
    ]);
    filename = "tdc-messages.csv";
  } else if (table === "colleges") {
    headers = ["Name", "Code", "Status", "Members", "Added at"];
    const { rows } = await adminCollegesRows({
      pageSize: EXPORT_ROW_LIMIT,
    });
    body = rows.map((row) => [
      row.name,
      row.code,
      row.isActive ? "Active" : "Inactive",
      row.memberCount,
      toIso(row.createdAt),
    ]);
    filename = "tdc-colleges.csv";
  } else if (table === "activity") {
    const rawAction = request.nextUrl.searchParams.get("action");
    headers = ["When", "Admin", "Action", "Target type", "Target id", "Detail"];
    const { rows } = await adminAuditRows({
      action:
        rawAction && (AUDIT_ACTIONS as readonly string[]).includes(rawAction)
          ? rawAction
          : undefined,
      pageSize: EXPORT_ROW_LIMIT,
    });
    body = rows.map((row) => [
      toIso(row.createdAt),
      row.actorName,
      row.action,
      row.targetType,
      row.targetId,
      row.detail,
    ]);
    filename = "tdc-activity.csv";
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
