# Doctor Signal

Bilingual (RU/EN) landing page and consultation request form for independent surgeon checks in South Korea. IE Business School Startup Lab project, Group E.

Live (Lovable version): https://doctor-signal-connect.lovable.app

## Stack
- TanStack Start (React 19, Vite, Tailwind 4)
- Supabase (Postgres, Auth, row level security), project `zgukqkdfqqdmzuhaktud`

## Pages
- `/` landing page and lead form (anyone can submit)
- `/auth` admin sign in (email link or password)
- `/admin` lead list, counters and CSV export (admin only: khayal.baghirov@gmail.com)

## Run locally
```
bun install
bun run dev
```

## Database
Migrations are in `supabase/migrations`. They are already applied to the Supabase project.
- `leads`: consultation requests. Public can insert, only admins can read.
- `user_roles` + `is_admin()` / `claim_admin()`: admin access.

## Deploy (Vercel)
1. Import this repo at vercel.com/new. Framework preset: Other. Build command: `bun run build`.
2. Add environment variables: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (same values as `.env`).
3. In Supabase, Authentication > URL Configuration: set Site URL to the Vercel domain and add `https://<domain>/admin` to Redirect URLs.
