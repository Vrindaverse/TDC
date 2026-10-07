import { sql } from "@/lib/db";

/**
 * Neon Auth owns its own tables, so identity lookups (email, verification
 * state) happen with raw SQL against `neon_auth."user"` instead of Drizzle
 * models. Never write to `neon_auth.*` from the app.
 */

export async function findUserIdByEmail(email: string): Promise<string | null> {
  const rows = await sql`
    select id
      from neon_auth."user"
     where lower(email) = ${email.toLowerCase()}
     limit 1
  `;
  return (rows[0]?.id as string | undefined) ?? null;
}

export async function isEmailVerified(email: string): Promise<boolean> {
  const rows = await sql`
    select "emailVerified"
      from neon_auth."user"
     where lower(email) = ${email.toLowerCase()}
     limit 1
  `;
  return rows[0]?.emailVerified === true;
}
