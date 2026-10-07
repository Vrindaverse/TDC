import { neon } from "@neondatabase/serverless";

const email = (process.argv[2] || "").trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run db:make-admin -- <email>");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(url);

const users = await sql`
  select id, email from neon_auth."user" where lower(email) = ${email}
`;
if (users.length === 0) {
  console.error(`No Neon Auth user found for ${email}. Register first.`);
  process.exit(1);
}

const updated = await sql`
  update public.profiles
     set role = 'ADMIN', updated_at = now()
   where user_id = ${users[0].id}
  returning role
`;

if (updated.length === 0) {
  console.error(
    `User ${email} exists in Neon Auth but has no TDC profile yet. Finish registration first.`
  );
  process.exit(1);
}

console.log(`${email} is now an ADMIN.`);
