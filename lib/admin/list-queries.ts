import { sql } from "@/lib/db";

export type AdminRegistrationRow = {
  createdAt: Date | string;
  title: string;
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
  name: string;
  role: string;
  email: string;
  college: string | null;
};

export type AdminUserFilter = {
  q?: string;
  role?: "USER" | "ADMIN";
  page?: number;
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 20;

export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

export async function adminRegistrationsRows(input?: {
  eventId?: string;
}): Promise<AdminRegistrationRow[]> {
  const where =
    input?.eventId && /^[0-9a-f-]{36}$/i.test(input.eventId)
      ? sql` where e.id = ${input.eventId}`
      : sql``;
  const rows = await sql`
    select r.created_at as "createdAt",
           e.title as title,
           e.starts_at as "startsAt",
           coalesce(r.name, p.name) as name,
           coalesce(r.email, u.email) as email,
           coalesce(r.mobile, p.mobile) as mobile,
           coalesce(r.enrollment_number, p.enrollment_number) as "enrollmentNumber",
           r.semester as semester,
           c.name as college,
           (r.profile_id is not null) as "isMember"
      from public.registrations r
      join public.events e on e.id = r.event_id
      left join public.profiles p on p.id = r.profile_id
      left join neon_auth."user" u on u.id = p.user_id
      left join public.colleges c on c.id = p.college_id
     ${where}
     order by r.created_at desc
     limit 500
  `;
  return rows as AdminRegistrationRow[];
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
  const pageSize = Math.min(500, Math.max(1, input.pageSize ?? DEFAULT_PAGE_SIZE));
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

export async function adminMessagesRows(): Promise<AdminMessageRow[]> {
  const rows = await sql`
    select m.id as id,
           m.category as category,
           m.subject as subject,
           m.message as message,
           m.status as status,
           m.created_at as "createdAt",
           p.name as name,
           p.role as role,
           u.email as email,
           c.name as college
      from public.contact_messages m
      join public.profiles p on p.id = m.profile_id
      join neon_auth."user" u on u.id = p.user_id
      left join public.colleges c on c.id = p.college_id
     order by m.created_at desc
     limit 100
  `;
  return rows as AdminMessageRow[];
}