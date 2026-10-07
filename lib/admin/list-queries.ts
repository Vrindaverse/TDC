import { sql } from "@/lib/db";

export type AdminRegistrationRow = {
  id: string;
  profileId: string | null;
  createdAt: Date | string;
  title: string;
  eventId: string;
  startsAt: Date | string;
  name: string;
  email: string;
  mobile: string | null;
  enrollmentNumber: string | null;
  semester: number | null;
  college: string | null;
  isMember: boolean;
};

export type AdminUserRow = {
  id: string;
  userId: string;
  name: string;
  mobile: string;
  enrollmentNumber: string;
  role: string;
  createdAt: Date | string;
  college: string | null;
  email: string;
  emailVerified: boolean;
};

export type AdminMessageRow = {
  id: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Date | string;
  readAt: Date | string | null;
  name: string;
  role: string;
  email: string;
  college: string | null;
};

export type AdminCollegeRow = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date | string;
  memberCount: number;
};

export type AdminAuditRow = {
  id: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string | null;
  detail: string | null;
  createdAt: Date | string;
};

export type AdminUserFilter = {
  q?: string;
  role?: "USER" | "ADMIN";
  page?: number;
  pageSize?: number;
};

export type AdminRegistrationFilter = {
  eventId?: string;
  q?: string;
  page?: number;
  pageSize?: number;
};

export type AdminMessageFilter = {
  q?: string;
  category?: string;
  status?: "new" | "read";
  page?: number;
  pageSize?: number;
};

export type AdminCollegeFilter = {
  q?: string;
  status?: "active" | "inactive";
  page?: number;
  pageSize?: number;
};

export type AdminAuditFilter = {
  action?: string;
  page?: number;
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 20;

export const MESSAGE_CATEGORIES = [
  "general",
  "membership",
  "event",
  "collaboration",
  "support",
  "feedback",
  "other",
] as const;

export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

export function normalizePage(page: unknown): number {
  const value = Number(page);
  return Number.isFinite(value) && value >= 1 ? Math.floor(value) : 1;
}

function buildWhere(clauses: string[]) {
  return clauses.length ? ` where ${clauses.join(" and ")}` : "";
}

export async function adminRegistrationsRows(
  input: AdminRegistrationFilter = {}
): Promise<{ rows: AdminRegistrationRow[]; total: number }> {
  const page = normalizePage(input.page);
  const pageSize = Math.min(
    5000,
    Math.max(1, input.pageSize ?? DEFAULT_PAGE_SIZE)
  );

  const clauses: string[] = [];
  const params: unknown[] = [];
  if (input.eventId && /^[0-9a-f-]{36}$/i.test(input.eventId)) {
    params.push(input.eventId);
    clauses.push(`e.id = $${params.length}`);
  }
  if (input.q) {
    params.push(`%${escapeLikePattern(input.q)}%`);
    const idx = params.length;
    clauses.push(
      `(coalesce(r.name, p.name) ilike $${idx} or coalesce(r.email, u.email) ilike $${idx} or coalesce(r.mobile, p.mobile) ilike $${idx} or coalesce(r.enrollment_number, p.enrollment_number) ilike $${idx} or e.title ilike $${idx})`
    );
  }
  const where = buildWhere(clauses);
  const offset = (page - 1) * pageSize;

  const from = `
      from public.registrations r
      join public.events e on e.id = r.event_id
      left join public.profiles p on p.id = r.profile_id
      left join neon_auth."user" u on u.id = p.user_id
      left join public.colleges c on c.id = p.college_id
  `;

  const rows = await sql.query(
    `
    select r.id as id,
           r.profile_id as "profileId",
           r.created_at as "createdAt",
           e.title as title,
           e.id as "eventId",
           e.starts_at as "startsAt",
           coalesce(r.name, p.name) as name,
           coalesce(r.email, u.email) as email,
           coalesce(r.mobile, p.mobile) as mobile,
           coalesce(r.enrollment_number, p.enrollment_number) as "enrollmentNumber",
           r.semester as semester,
           c.name as college,
           (r.profile_id is not null) as "isMember"
    ${from}
    ${where}
     order by r.created_at desc
     limit $${params.length + 1}
    offset $${params.length + 2}
  `,
    [...params, pageSize, offset]
  );

  const [totalRows] = await sql.query(
    `select count(*)::int as n ${from} ${where}`,
    params
  );

  return { rows: rows as AdminRegistrationRow[], total: Number(totalRows.n) };
}

function usersWhere(input: AdminUserFilter) {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (input.role) {
    params.push(input.role);
    clauses.push(`p.role = $${params.length}`);
  }
  if (input.q) {
    const q = `%${escapeLikePattern(input.q)}%`;
    params.push(q);
    const idx = params.length;
    clauses.push(
      `(p.name ilike $${idx} or u.email ilike $${idx} or p.mobile ilike $${idx} or p.enrollment_number ilike $${idx})`
    );
  }
  return {
    clause: clauses.length ? ` where ${clauses.join(" and ")}` : "",
    params,
  };
}

export async function adminUsersRows(
  input: AdminUserFilter = {}
): Promise<{ rows: AdminUserRow[]; total: number }> {
  const page = Math.max(1, Math.floor(input.page ?? 1));
  const pageSize = Math.min(5000, Math.max(1, input.pageSize ?? DEFAULT_PAGE_SIZE));
  const { clause, params } = usersWhere(input);
  const offset = (page - 1) * pageSize;

  const rowsQuery = `
    select p.id,
           u.id as "userId",
           p.name as name,
           p.mobile as mobile,
           p.enrollment_number as "enrollmentNumber",
           p.role as role,
           p.created_at as "createdAt",
           c.name as college,
           u.email as email,
           u."emailVerified" as "emailVerified"
      from public.profiles p
      left join public.colleges c on c.id = p.college_id
      join neon_auth."user" u on u.id = p.user_id
     ${clause}
     order by p.created_at desc
     limit $${params.length + 1}
    offset $${params.length + 2}
  `;
  const rows = await sql.query(rowsQuery, [...params, pageSize, offset]);

  const countQuery = `
    select count(*)::int as n
      from public.profiles p
      join neon_auth."user" u on u.id = p.user_id
     ${clause}
  `;
  const [totalRows] = await sql.query(countQuery, params);

  return { rows: rows as AdminUserRow[], total: Number(totalRows.n) };
}

export async function adminMessagesRows(
  input: AdminMessageFilter = {}
): Promise<{ rows: AdminMessageRow[]; total: number }> {
  const page = normalizePage(input.page);
  const pageSize = Math.min(
    5000,
    Math.max(1, input.pageSize ?? DEFAULT_PAGE_SIZE)
  );

  const clauses: string[] = [];
  const params: unknown[] = [];
  if (input.status === "new" || input.status === "read") {
    params.push(input.status);
    clauses.push(`m.status = $${params.length}`);
  }
  if (
    input.category &&
    (MESSAGE_CATEGORIES as readonly string[]).includes(input.category)
  ) {
    params.push(input.category);
    clauses.push(`m.category = $${params.length}`);
  }
  if (input.q) {
    params.push(`%${escapeLikePattern(input.q)}%`);
    const idx = params.length;
    clauses.push(
      `(m.subject ilike $${idx} or m.message ilike $${idx} or p.name ilike $${idx} or u.email ilike $${idx})`
    );
  }
  const where = buildWhere(clauses);
  const offset = (page - 1) * pageSize;

  const from = `
      from public.contact_messages m
      join public.profiles p on p.id = m.profile_id
      join neon_auth."user" u on u.id = p.user_id
      left join public.colleges c on c.id = p.college_id
  `;

  const rows = await sql.query(
    `
    select m.id as id,
           m.category as category,
           m.subject as subject,
           m.message as message,
           m.status as status,
           m.created_at as "createdAt",
           m.read_at as "readAt",
           p.name as name,
           p.role as role,
           u.email as email,
           c.name as college
    ${from}
    ${where}
     order by m.created_at desc
     limit $${params.length + 1}
    offset $${params.length + 2}
  `,
    [...params, pageSize, offset]
  );

  const [totalRows] = await sql.query(
    `select count(*)::int as n ${from} ${where}`,
    params
  );

  return { rows: rows as AdminMessageRow[], total: Number(totalRows.n) };
}

export async function adminCollegesRows(
  input: AdminCollegeFilter = {}
): Promise<{ rows: AdminCollegeRow[]; total: number }> {
  const page = normalizePage(input.page);
  const pageSize = Math.min(
    5000,
    Math.max(1, input.pageSize ?? DEFAULT_PAGE_SIZE)
  );

  const clauses: string[] = [];
  const params: unknown[] = [];
  if (input.status === "active" || input.status === "inactive") {
    params.push(input.status === "active");
    clauses.push(`c.is_active = $${params.length}`);
  }
  if (input.q) {
    params.push(`%${escapeLikePattern(input.q)}%`);
    const idx = params.length;
    clauses.push(`(c.name ilike $${idx} or c.code ilike $${idx})`);
  }
  const where = buildWhere(clauses);
  const offset = (page - 1) * pageSize;

  const from = `
      from public.colleges c
      left join public.profiles p on p.college_id = c.id
  `;

  const rows = await sql.query(
    `
    select c.id as id,
           c.name as name,
           c.code as code,
           c.is_active as "isActive",
           c.created_at as "createdAt",
           count(p.id)::int as "memberCount"
    ${from}
    ${where}
     group by c.id
     order by c.name asc
     limit $${params.length + 1}
    offset $${params.length + 2}
  `,
    [...params, pageSize, offset]
  );

  const [totalRows] = await sql.query(
    `select count(*)::int as n from public.colleges c ${where}`,
    params
  );

  return { rows: rows as AdminCollegeRow[], total: Number(totalRows.n) };
}

export async function adminAuditRows(
  input: AdminAuditFilter = {}
): Promise<{ rows: AdminAuditRow[]; total: number }> {
  const page = normalizePage(input.page);
  const pageSize = Math.min(
    5000,
    Math.max(1, input.pageSize ?? DEFAULT_PAGE_SIZE)
  );

  const clauses: string[] = [];
  const params: unknown[] = [];
  if (input.action) {
    params.push(input.action);
    clauses.push(`a.action = $${params.length}`);
  }
  const where = buildWhere(clauses);
  const offset = (page - 1) * pageSize;

  const rows = await sql.query(
    `
    select a.id as id,
           a.actor_name as "actorName",
           a.action as action,
           a.target_type as "targetType",
           a.target_id as "targetId",
           a.detail as detail,
           a.created_at as "createdAt"
      from public.audit_log a
     ${where}
     order by a.created_at desc
     limit $${params.length + 1}
    offset $${params.length + 2}
  `,
    [...params, pageSize, offset]
  );

  const [totalRows] = await sql.query(
    `select count(*)::int as n from public.audit_log a ${where}`,
    params
  );

  return { rows: rows as AdminAuditRow[], total: Number(totalRows.n) };
}
