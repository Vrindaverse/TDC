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

export async function adminRegistrationsRows(): Promise<AdminRegistrationRow[]> {
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
     order by r.created_at desc
     limit 200
  `;
  return rows as AdminRegistrationRow[];
}

export async function adminUsersRows(): Promise<AdminUserRow[]> {
  const rows = await sql`
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
     order by p.created_at desc
     limit 200
  `;
  return rows as AdminUserRow[];
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