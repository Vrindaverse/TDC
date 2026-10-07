# TDC — Technocrats Developer Community

Next.js 16 (App Router, Cache Components) + Drizzle ORM + Neon Postgres + Neon Auth.

## Commands

```bash
npm run dev          # dev server
npm run build        # production build
npm run lint         # eslint
npm run typecheck    # next typegen && tsc --noEmit
npm run db:push      # sync lib/db/schema.ts -> database
npm run db:seed      # seed colleges
npm run db:make-admin -- <email>  # promote an existing user to ADMIN
```

## Environment

Copy `.env.example` to `.env.local` and fill it from `neon env pull`.
All keys are required at **build time** too — prerendered pages query the
database while `next build` runs.

| Key | Used for |
| --- | --- |
| `DATABASE_URL` | Drizzle queries (Neon `production` branch) |
| `DATABASE_URL_UNPOOLED` | CLI/scripts (optional) |
| `NEON_AUTH_BASE_URL` | Neon Auth API |
| `NEON_AUTH_COOKIE_SECRET` | Session cookie signing |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` / `AWS_ENDPOINT_URL_S3` | Avatar uploads (S3-compatible storage) |
| `AWS_S3_BUCKET` | Avatar bucket name (defaults to `avatars`) |

`.env*` is gitignored — never commit secrets. `.env.example` is the tracked template.

## Deploying to Vercel

1. Import the repo in Vercel (framework auto-detected as Next.js).
   `vercel.json` pins the function region to `iad1`, the closest Vercel region
   to the Neon branch in `us-east-2`.
2. Add every key from `.env.example` in **Project → Settings → Environment
   Variables** for *Preview* and *Production*. The build fails without
   `DATABASE_URL` / `NEON_AUTH_*` because static pages read the DB at build time.
3. Push the schema and seed once against the production branch:
   ```bash
   neon env pull --env-file .env.local   # or set DATABASE_URL manually
   npm run db:push
   npm run db:seed
   npm run db:make-admin -- you@example.com
   ```
4. Deploy. Verify `/events`, login, and one admin page.
5. Day-to-day schema changes: edit `lib/db/schema.ts`, run `npm run db:push`
   locally, commit, and redeploy.

## Build notes

- `staticPageGenerationTimeout: 120` and `experimental.cpus: 4` in
  `next.config.ts` keep prerendering stable on small build machines — the
  default 16 workers / 60s timeout thrashed swap and retried page generation.
- `/api/profile/avatar` and `/api/admin/export/[table]` declare
  `maxDuration = 30` for upload/export work.
- Avatar files go to object storage, not `public/uploads` (gitignored, and
  ephemeral on serverless hosts).
