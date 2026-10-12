# Doctor Signal ("Before You Pay")

Class demo build of the PRD in [PRD.md](PRD.md). React + Vite + TypeScript + Tailwind, with Supabase as the database.

This is the product flow (order a check, read the brief). The landing page with the lead form lives in the repo root. Both use the same Supabase project.

**Demo only. Use made-up details. Anyone with the link can read and delete every check (PRD section 3.1).**

## Run it

Needs Node.js 20 or later. Run these from this `before-you-pay` folder.

1. Copy `.env.example` to `.env.local`.
2. Paste the **anon / publishable** key from Supabase (Project Settings → API) into `VITE_SUPABASE_ANON_KEY`. Never use the `service_role` key.
3. Install and start:

```bash
npm install
npm run dev
```

Open http://localhost:5173 and set the browser to phone width (about 390px).

## Settings

`.env.local` holds the Supabase URL and public anon key. It is not committed. Add your Wise or Revolut link to `VITE_DEPOSIT_URL`. Until you do, the form shows "Deposit link not set up yet".

## Deploy (Vercel)

Import the repo at vercel.com/new, set **Root Directory** to `before-you-pay`, framework preset Vite. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and `VITE_DEPOSIT_URL` as environment variables. Add a rewrite of all paths to `/index.html` so `/new` and `/check/:id` work on refresh.

## Operator: filling in a brief

In the Supabase dashboard, go to Table editor → `brief_answers` → Insert row:

| Column | Value |
|---|---|
| `request_id` | the check's id (from `check_requests`) |
| `question` | `who`, `locals`, `cost` or `fix` |
| `verdict` | `verified`, `not_verified`, `concern` or `clinic_refused` |
| `summary` | what you found, 1 to 1000 characters |
| `source` | optional, e.g. "Clinic email, 12 Oct 2026" |

The patient's screen updates within a few seconds. 4 answers = Ready.

## Demo moment

Aigerim's check (Dr. Kim Min-su) has 3 of 4 answers. During the demo, add her `cost` answer in the table editor and her brief turns Ready live.

## Reset the demo data

The Overdue and "due after deposit" states depend on today's date. On demo day, run this in the Supabase SQL editor, then run the seed SQL from PRD section 8.2:

```sql
delete from public.check_requests;
```

This deletes all checks and their answers.

## Tests

```bash
npm test
```

21 unit tests cover the date and status rules, run as a device in Almaty (UTC+5).
