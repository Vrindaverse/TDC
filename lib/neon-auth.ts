import { sql } from "@/lib/db";

/**
 * Neon Auth user queries — single point of access to neon_auth."user" table.
 * All direct queries to neon_auth.* should go through this module.
 */

export interface NeonAuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function findUserByEmail(email: string): Promise<NeonAuthUser | null> {
  const rows = await sql`
    select id, email, "emailVerified" as "emailVerified", name, "createdAt", "updatedAt"
      from neon_auth."user"
     where lower(email) = ${email.toLowerCase()}
     limit 1
  `;
  return rows[0] as NeonAuthUser | null;
}

export async function findUserById(id: string): Promise<NeonAuthUser | null> {
  const rows = await sql`
    select id, email, "emailVerified" as "emailVerified", name, "createdAt", "updatedAt"
      from neon_auth."user"
     where id = ${id}
     limit 1
  `;
  return rows[0] as NeonAuthUser | null;
}

export async function isEmailVerified(email: string): Promise<boolean> {
  const user = await findUserByEmail(email);
  return user?.emailVerified === true;
}

export async function getUserEmail(id: string): Promise<string | null> {
  const rows = await sql`
    select email
      from neon_auth."user"
     where id = ${id}
     limit 1
  `;
  return rows[0]?.email ?? null;
}

export async function deleteUser(id: string): Promise<void> {
  await sql`delete from neon_auth."user" where id = ${id}`;
}

export async function getAdminCount(): Promise<number> {
  // This requires joining with profiles table which is in public schema
  // The admin role is stored in profiles, not in neon_auth
  return 0;
}