import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(url);

const COLLEGES = [
  { name: "TDC Test College", code: "TDC-TEST" },
];

for (const college of COLLEGES) {
  const rows = await sql`
    insert into public.colleges (name, code, is_active)
    values (${college.name}, ${college.code}, true)
    on conflict (code) do update
      set name = excluded.name,
          is_active = true
    returning id, name, code, is_active
  `;
  console.log("Seeded:", rows[0].name, `(${rows[0].code})`);
}

const count = await sql`select count(*)::int as n from public.colleges`;
console.log(`colleges table now has ${count[0].n} row(s).`);
