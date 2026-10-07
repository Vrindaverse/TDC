import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Run `neon env pull` or add it to .env.local."
  );
}

/** Raw tagged-template client — only for reading Neon Auth's own tables. */
export const sql: NeonQueryFunction<false, false> = neon(url);
export const db = drizzle(sql, { schema });
