# Doctor Signal ("Before You Pay"): Product Requirements Document

**Status:** FINAL (v1.1, class demo build)
**Date:** 12 October 2026
**Owner:** Group E, IE EMBA Start-up Lab (3rd Term)
**Scope:** buildable in one session
**Changes from v1.0:** live status updates (Supabase Realtime), patient cannot write answers (tighter RLS), corrected security note, removed unneeded `pgcrypto`, added label mappings, seed data, demo script and RAT measurement.

Decisions not in the original brief are tagged **[ASSUMPTION]** and listed in section 13.

---

## 1. Summary

**Name:** Doctor Signal (working name). Customer-facing line: "Before You Pay".

**One-liner:** Order an independent check of the Korean doctor and clinic you are about to pay, and get one page with four answers before your deposit leaves.

**Target user:** a foreign patient, or the family member driving the decision, who has already chosen a plastic surgery clinic in South Korea. They found it through an influencer, an agency or Xiaohongshu. They are days or weeks away from paying a non-refundable deposit. Main source markets: China, Japan, Kazakhstan and Central Asia.

**Problem:** in the week before the deposit, the patient cannot answer four questions. The answers exist only in Korean, or sit with a party the clinic pays.

1. **Who is this doctor?** Licence, specialty, board registration.
2. **What do locals say?** Korean-language reviews and signals.
3. **What does it cost?** All-in price, in writing from the clinic.
4. **What if it goes wrong?** Revision policy, in writing.

Agencies are paid commission by the clinic. Platforms verify the clinic, not the individual doctor. Patients book anyway, and worry. That is the moment we sell into.

**What this build tests (RAT):** will a patient pay us directly, USD 120 and fully refundable, for an independent brief, instead of taking what the clinic or agency gives them for free?

---

## 2. Scope

**Cut, and why** (matches the team MoSCoW board, Miro 4):

| Feature | Decision | Reason |
|---|---|---|
| Doctor directory or search | WON'T | Needs supply scale we do not have |
| Booking and payments to clinics | WON'T | No clinic system integrates (INT-01) |
| Doctor reviews or ratings | WON'T, anti-feature | Reviews are the distrusted incumbent (INT-08) |
| Sponsored or paid doctor placement | NEVER | If a clinic pays us, the check is worthless |
| In-app payment | Cut for this build | The app shows an external refundable deposit link (Wise or Revolut) |
| Multi-language UI | Cut for this build | UI is English. The patient picks the language of the brief |
| Operator or admin screen | Cut for this build | The team fills answers in the Supabase table editor **[ASSUMPTION]** |

**Fully out of scope:** authentication, notifications (email, push, messenger), clinic accounts, 90-day post-treatment contact, doctor comparison, currency converter, clinic maps, editing a request after submission, file uploads (licence scans), dark mode, in-app analytics.

**Scope check:** 2 tables, 3 screens, no auth, no payments, no admin UI. Live updates add about 15 minutes. Everything fits one session.

---

## 3. Platform and stack (fixed)

- Mobile-first web app, designed for a 390px phone screen, run in the browser. On wider screens the layout stays centered at max 430px. **[ASSUMPTION]**
- React + Vite + TypeScript, Tailwind CSS. shadcn/ui components are allowed if the build tool ships them (e.g. Lovable).
- React Router with three routes: `/` (My checks), `/new` (New check), `/check/:id` (Brief).
- Supabase as database and Realtime only, through `@supabase/supabase-js`. No Supabase Auth.
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DEPOSIT_URL`.

### 3.1 Security consequence (read this)

There is no login and there is one shared view. The anon key ships inside the browser bundle. With the policies in section 6.1, **anyone who has the app URL can read every request, including patient names and contact details, and can create or delete any request.** They cannot change requests or answers. Everyone who opens the demo link sees every check submitted by anyone else.

This is acceptable **only for a class demo with fictitious data. No real patient data may be entered into this build.**

Before any real pilot: add Supabase Auth, a `user_id` column with per-user RLS (`auth.uid()`), a separate operator role, and a review of personal-data rules in the source and destination markets. Procedure intent counts as health-related data.

---

## 4. User stories

1. As a patient about to pay a deposit, I want to submit the doctor and clinic I have chosen, so that someone independent checks them before I pay.
2. As a patient, I want to choose the language of my brief, so that I can read it without translating.
3. As a patient, I want to see the price and a refundable deposit link, so that I know what I am committing to.
4. As a patient, I want to see when my brief is due, so that I know if it arrives before my deposit date.
5. As a patient, I want each of the four answers to show a clear verdict (Verified, Not verified, Concern, Clinic refused), so that I can decide quickly.
6. As a patient, I want a clinic's refusal to answer shown on the page, so that I treat silence as information.
7. As a patient, I want to cancel a request I no longer need, so that my details are removed.
8. As the operator (team member), I want to fill in each answer in the database and have the patient's screen update by itself within a few seconds, so that no admin screen is needed.

---

## 5. Labels and mappings

Database codes stay in English. The UI shows these labels.

| Procedure code | UI label |
|---|---|
| `rhinoplasty` | Rhinoplasty |
| `eyelid` | Eyelid surgery |
| `facelift` | Facelift / lifting |
| `contouring` | Facial contouring (jaw, cheekbone) |
| `breast` | Breast surgery |
| `liposuction` | Liposuction / body contouring |
| `other` | Other |

| Question code | Card title (fixed order) |
|---|---|
| `who` | 1. Who is this doctor |
| `locals` | 2. What locals say |
| `cost` | 3. What it costs |
| `fix` | 4. If it goes wrong |

| Verdict code | Badge | Color |
|---|---|---|
| `verified` | Verified | green |
| `not_verified` | Not verified | grey |
| `concern` | Concern | red |
| `clinic_refused` | Clinic refused | orange |
| (no row) | Pending, "We are checking this" | outlined |

| Language code | UI label |
|---|---|
| `en` | English |
| `ru` | Русский |
| `zh` | 中文 |

Badges and chips always show text, not only color.

---

## 6. Screens

Navigation: My checks → "Check a doctor" → New check → Submit → My checks. My checks → tap a card → Brief → back arrow or delete → My checks.

### 6.1 Screen 1: My checks (`/`)

**Elements**
- Header: "Doctor Signal" and the line "Before you pay, know who you are paying."
- Summary line: "N briefs ready of M", e.g. "1 brief ready of 2".
- List of requests, newest first. Each card shows:
  - Doctor name (bold) and clinic name
  - Procedure label
  - Status chip: Submitted (grey), In progress (amber), Ready (green). Derived, see rule 7.3.
  - "Due by Wed 14 Oct, 16:30" in device local time, or "Overdue" (red) if past due and not Ready
  - Warning icon with the text "Due after deposit" when rule 7.6 applies
- Bottom button, fixed: "Check a doctor" → New check.
- Tapping a card opens its Brief.
- The list updates by itself when an answer or request changes (rule 7.10).

**States**
- **Loading:** 3 skeleton cards and a skeleton summary bar. No empty state flashes.
- **Empty:** a card with "No checks yet. Tell us the doctor and clinic you are about to pay, and get four answers before your deposit." Button: "Check my first doctor". Summary line hidden.
- **Error:** "Could not load your checks. Check your connection." Button: "Try again" (refetches).

### 6.2 Screen 2: New check (`/new`)

**Elements**
- Back arrow → My checks. Discards input, no confirmation.
- Fields:
  - **Your name** (required, 1 to 80 characters, trimmed)
  - **Contact** (required, 3 to 120 characters): email, WhatsApp, Telegram or WeChat handle, free text. Hint: "Where we send your brief."
  - **Doctor's name** (required, 1 to 120 characters, any script, e.g. Hangul or Latin)
  - **Clinic name** (required, 1 to 120 characters)
  - **Procedure** (required, single select, section 5)
  - **Deposit date** (required, date picker, `min` set to device local today)
  - **Brief language** (required, single select). Default English.
- Price block (static): "USD 120, fully refundable if we cannot deliver within 72 hours." Button "Pay refundable deposit" opens `VITE_DEPOSIT_URL` in a new tab. The app does not track payment. **[ASSUMPTION]**
- Disclaimer (static): "We verify facts and collect written answers. We do not give medical advice."
- Demo notice (static, small grey text): "Demo build. Use made-up details only."
- Primary button: "Submit check". Disabled until all required fields are valid.

**States**
- **Validation:** inline message under each invalid field after blur or a submit attempt, e.g. "Deposit date cannot be in the past".
- **Warning (non-blocking):** when the deposit date is today, tomorrow or the day after (fewer than 3 calendar days away): "Your brief may arrive after your deposit date. Consider asking the clinic to hold the deposit."
- **Saving:** button shows a spinner and "Submitting...". All inputs disabled. No double submit.
- **Error:** banner "Could not submit. Your details are still here. Try again." Inputs keep their values.
- **Success:** go to My checks. The new card is at the top with status Submitted.

### 6.3 Screen 3: Brief (`/check/:id`)

**Elements**
- Back arrow → My checks.
- Header: doctor name, clinic name, procedure label, brief language.
- Status chip and "Due by ..." or "Overdue".
- Deposit date, with the "Due after deposit" warning when rule 7.6 applies.
- Progress line: "N of 4 answers ready".
- Four answer cards, always in the order of section 5. Each card shows:
  - Verdict badge
  - Summary text (when not Pending)
  - Source line when present, e.g. "Specialist board registry, checked 10 Oct 2026"
  - For **Clinic refused**, an extra line: "The clinic would not answer this in writing. A refusal before the deposit is information in itself."
- Footer disclaimer: "We do not give medical advice. This brief reports facts and written answers only."
- "Cancel this check" (red text button). Opens a dialog: "Cancel this check? Your details and any answers will be permanently deleted." Buttons: "Keep it" and "Delete" (red).
- The cards update by themselves when the operator adds or edits an answer (rule 7.10). A card that just changed gets a short highlight. **[ASSUMPTION]**

**States**
- **Loading:** header skeleton and 4 skeleton cards.
- **No answers yet:** all 4 cards show Pending, status Submitted, "0 of 4 answers ready".
- **Not found** (unknown id, or deleted elsewhere, including while open): "This check no longer exists." Button: "Back to my checks".
- **Error (load):** "Could not load this brief." Button: "Try again".
- **Deleting:** "Delete" shows a spinner. Both dialog buttons are disabled.
- **Error (delete):** dialog closes, banner "Could not delete. Try again." The request stays.
- **Delete success:** go to My checks without that card.

---

## 7. Business rules

1. **Today is the device's local date, not UTC.** Build it as `YYYY-MM-DD` from `getFullYear()`, `getMonth()` and `getDate()`. Never use `toISOString()` for dates. Used for deposit date validation and the 3-day warning.
2. **Price:** USD 120 per brief, fully refundable if not delivered within 72 hours. Shown only. Payment happens outside the app.
3. **Status** is derived from the number of answer rows for the request:
   - 0 answers → Submitted
   - 1 to 3 answers → In progress
   - 4 answers → Ready
4. **Due time** = `created_at` + 72 hours, shown in device local time.
5. **Overdue** when now is past the due time and status is not Ready. Due and Overdue labels recompute every 60 seconds, so an open screen turns Overdue without a reload. **[ASSUMPTION]**
6. **Deposit risk warning:**
   - On a saved request: shown when the local date of the due time is later than `deposit_date`.
   - On the form: shown when the deposit date is fewer than 3 calendar days from local today.
   - The warning never blocks submission.
7. **Deposit date** must be today or later at submission. It is not checked again later. A past deposit date on an old request is fine.
8. **One answer per question per request**, enforced by the unique constraint `(request_id, question)`.
9. **Clinic refused counts as answered.** A refusal is a valid, final verdict and moves the request toward Ready.
10. **Live updates.** The app subscribes to Supabase Realtime changes on `brief_answers` and `check_requests`. On any change it refetches the affected data. The patient sees new answers within 5 seconds, with no reload.
11. **The brief is read-only for the patient.** The patient can only create and delete requests. Only the operator writes answers, through the Supabase table editor.
12. **Deleting a request deletes all its answers** through `on delete cascade`.
13. **Independence rules (permanent):** no user reviews or star ratings, no doctor ranking, no sponsored placement, no clinic-paid content. Nothing in the UI may say or suggest that a clinic paid to appear.
14. **No medical advice.** The disclaimer appears on New check and on the Brief.
15. **Fixed card order:** who, locals, cost, fix.

---

## 8. Data model

Two tables. Status is not stored. It is derived from the answers (rule 7.3), so the operator only ever edits `brief_answers`. A missing answer row means that question is Pending.

### 8.1 Schema, RLS and Realtime

Run once in the Supabase SQL editor. `gen_random_uuid()` is built into Postgres 13+, so no extension is needed.

```sql
-- 1. Check requests (one per doctor/clinic check)
create table public.check_requests (
  id             uuid primary key default gen_random_uuid(),
  patient_name   text not null check (char_length(btrim(patient_name)) between 1 and 80),
  contact        text not null check (char_length(btrim(contact)) between 3 and 120),
  doctor_name    text not null check (char_length(btrim(doctor_name)) between 1 and 120),
  clinic_name    text not null check (char_length(btrim(clinic_name)) between 1 and 120),
  procedure      text not null check (procedure in (
                   'rhinoplasty','eyelid','facelift','contouring',
                   'breast','liposuction','other')),
  deposit_date   date not null,
  brief_language text not null default 'en' check (brief_language in ('en','ru','zh')),
  created_at     timestamptz not null default now()
);

create index check_requests_created_at_idx on public.check_requests (created_at desc);

-- 2. Brief answers (at most one per question per request)
create table public.brief_answers (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.check_requests(id) on delete cascade,
  question    text not null check (question in ('who','locals','cost','fix')),
  verdict     text not null check (verdict in ('verified','not_verified','concern','clinic_refused')),
  summary     text not null check (char_length(btrim(summary)) between 1 and 1000),
  source      text check (source is null or char_length(source) <= 200),
  updated_at  timestamptz not null default now(),
  constraint brief_answers_request_question_key unique (request_id, question)
);
-- The unique constraint also indexes request_id, so no extra index is needed.

-- Keep updated_at current when the operator edits an answer
create or replace function public.doctor_signal_set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger brief_answers_set_updated_at
before update on public.brief_answers
for each row execute function public.doctor_signal_set_updated_at();

-- 3. Row Level Security: DEMO ONLY (see section 3.1)
alter table public.check_requests enable row level security;
alter table public.brief_answers  enable row level security;

-- Patient (anon) can read, create and delete requests. No update.
create policy "demo anon read requests"   on public.check_requests for select to anon using (true);
create policy "demo anon insert requests" on public.check_requests for insert to anon with check (true);
create policy "demo anon delete requests" on public.check_requests for delete to anon using (true);

-- Patient (anon) can only read answers. The operator writes them in the
-- table editor, which bypasses RLS. Cascade deletes also bypass RLS.
create policy "demo anon read answers"    on public.brief_answers  for select to anon using (true);

-- 4. Realtime: push changes to the app (rule 7.10)
alter publication supabase_realtime add table public.check_requests, public.brief_answers;
```

Notes:
- `deposit_date >= today` is checked in the app, not in SQL, because "today" is the device's local date and the database runs in UTC.
- Requests cannot be edited after submission, so there is no `update` policy on `check_requests`.

### 8.2 Demo seed data (fictitious)

Run after 8.1 to show every state in the demo. All names, clinics and findings are made up.

```sql
insert into public.check_requests
  (id, patient_name, contact, doctor_name, clinic_name, procedure, deposit_date, brief_language, created_at)
values
  ('11111111-1111-1111-1111-111111111111', 'Aigerim T. (demo)', 'telegram: @aigerim_demo',
   'Dr. Kim Min-su (김민수)', 'Seoul Line Clinic (demo)', 'rhinoplasty',
   current_date + 10, 'ru', now() - interval '80 hours'),   -- In progress, Overdue
  ('22222222-2222-2222-2222-222222222222', 'Mei L. (demo)', 'wechat: mei_demo',
   'Dr. Park Ji-hoon (박지훈)', 'Gangnam Face Clinic (demo)', 'eyelid',
   current_date + 1, 'zh', now() - interval '20 hours'),    -- Submitted, due after deposit
  ('33333333-3333-3333-3333-333333333333', 'Yuki S. (demo)', 'yuki.demo@example.com',
   'Dr. Lee Seo-yeon (이서연)', 'Apgujeong V Clinic (demo)', 'contouring',
   current_date + 14, 'en', now() - interval '60 hours');   -- Ready

insert into public.brief_answers (request_id, question, verdict, summary, source) values
  ('11111111-1111-1111-1111-111111111111', 'who', 'verified',
   'Licensed doctor. Board-certified plastic surgeon since 2014.', 'Specialist board registry (demo), checked 10 Oct 2026'),
  ('11111111-1111-1111-1111-111111111111', 'locals', 'concern',
   'Several Korean forum posts mention a different surgeon operating on the day.', 'Korean forums (demo), checked 11 Oct 2026'),
  ('11111111-1111-1111-1111-111111111111', 'fix', 'not_verified',
   'Clinic described a revision policy by phone but has not sent it in writing yet.', null),
  ('33333333-3333-3333-3333-333333333333', 'who', 'verified',
   'Licensed doctor. Board-certified plastic surgeon since 2011.', 'Specialist board registry (demo), checked 9 Oct 2026'),
  ('33333333-3333-3333-3333-333333333333', 'locals', 'verified',
   'Consistent positive Korean-language reviews over three years. No safety complaints found.', 'Korean review sites (demo), checked 9 Oct 2026'),
  ('33333333-3333-3333-3333-333333333333', 'cost', 'clinic_refused',
   'We asked for an all-in written quote including anesthesia and aftercare. The clinic declined.', 'Email to clinic (demo), 10 Oct 2026'),
  ('33333333-3333-3333-3333-333333333333', 'fix', 'verified',
   'Written policy: one free revision within 12 months, patient pays travel.', 'Clinic email (demo), 10 Oct 2026');
```

**Live demo moment:** during the demo, add the missing `cost` answer for request `1111...` in the table editor. The patient's screen moves from In progress to Ready within 5 seconds.

### 8.3 TypeScript shapes

```ts
type Procedure = 'rhinoplasty' | 'eyelid' | 'facelift' | 'contouring' | 'breast' | 'liposuction' | 'other';
type Question  = 'who' | 'locals' | 'cost' | 'fix';
type Verdict   = 'verified' | 'not_verified' | 'concern' | 'clinic_refused';
type Language  = 'en' | 'ru' | 'zh';
type Status    = 'submitted' | 'in_progress' | 'ready';   // derived, never stored

interface CheckRequest {
  id: string;
  patient_name: string;
  contact: string;
  doctor_name: string;
  clinic_name: string;
  procedure: Procedure;
  deposit_date: string;   // 'YYYY-MM-DD'
  brief_language: Language;
  created_at: string;     // ISO timestamp
}

interface BriefAnswer {
  id: string;
  request_id: string;
  question: Question;
  verdict: Verdict;
  summary: string;
  source: string | null;
  updated_at: string;
}
```

---

## 9. Acceptance criteria

### 9.1 My checks

- **AC-1.1** Given there are no requests, When I open the app, Then I see the empty state and a "Check my first doctor" button that opens New check.
- **AC-1.2** Given two requests exist and one has 4 answers, When I open the app, Then the summary reads "1 brief ready of 2" and the requests are listed newest first.
- **AC-1.3** Given a request has 0 answers, When the list loads, Then its chip shows "Submitted". With 2 answers it shows "In progress". With 4 it shows "Ready".
- **AC-1.4** Given a request was created more than 72 hours ago with 3 answers, When the list loads, Then it shows "Overdue" instead of "Due by".
- **AC-1.5** Given a request's due date falls after its deposit date, When the list loads, Then its card shows the "Due after deposit" warning.
- **AC-1.6** Given the database request fails, When the list loads, Then I see the error message and "Try again", and tapping it refetches.
- **AC-1.7** Given data is loading, When the screen first renders, Then skeleton cards show and no empty state flashes.
- **AC-1.8** Given the list is open, When the operator adds a 4th answer to a request in the table editor, Then that card's chip changes to "Ready" within 5 seconds without a reload.

### 9.2 New check

- **AC-2.1** Given any required field is empty, When I view the form, Then "Submit check" is disabled.
- **AC-2.2** Given I pick a deposit date before my device's local today, When I leave the field, Then I see "Deposit date cannot be in the past" and cannot submit.
- **AC-2.3** Given today is 12 October in local time and I pick 13 October, When I leave the field, Then the non-blocking warning appears and I can still submit.
- **AC-2.4** Given all fields are valid, When I tap "Submit check", Then one row is inserted into `check_requests`, I return to My checks, and the new card is at the top with status "Submitted".
- **AC-2.5** Given I tap "Submit check" twice quickly, When the save is in progress, Then only one row is created.
- **AC-2.6** Given the insert fails, When I tap "Submit check", Then I see the error banner and all my input is kept.
- **AC-2.7** Given I tap "Pay refundable deposit", When the link opens, Then it opens `VITE_DEPOSIT_URL` in a new tab and the form keeps its values.
- **AC-2.8** Given I type a doctor name in Hangul, Cyrillic or Chinese (e.g. 김민수), When I submit, Then it is saved and shown exactly as typed.
- **AC-2.9** Given my device is in UTC+5 (Almaty) at 01:00 on 13 October, When I open the date picker, Then 13 October is the earliest date I can pick.

### 9.3 Brief

- **AC-3.1** Given a request has no answers, When I open its brief, Then all 4 cards show "Pending", the status is "Submitted" and progress reads "0 of 4 answers ready".
- **AC-3.2** Given the brief is open, When the operator adds a "who" answer with verdict "verified" and a source, Then within 5 seconds and without a reload card 1 shows the Verified badge, the summary and the source, and the status is "In progress".
- **AC-3.3** Given the "cost" answer has verdict "clinic_refused", When I view the brief, Then card 3 shows the Clinic refused badge and the refusal explanation line.
- **AC-3.4** Given all four answers exist, When I view the brief, Then the status is "Ready" and progress reads "4 of 4 answers ready".
- **AC-3.5** Given answers were entered out of order, When I view the brief, Then the cards still appear in the order who, locals, cost, fix.
- **AC-3.6** Given I tap "Cancel this check", When the dialog appears and I tap "Keep it", Then nothing is deleted and I stay on the brief.
- **AC-3.7** Given I tap "Cancel this check" and confirm "Delete", When the delete succeeds, Then the request and all its `brief_answers` rows are removed and I return to My checks without that card.
- **AC-3.8** Given I open `/check/<id>` for a deleted or unknown id, When the screen loads, Then I see "This check no longer exists" and a button back to My checks.
- **AC-3.9** Given the screen is 390px wide, When I scroll, Then there is no horizontal scroll and the disclaimer is visible at the bottom.
- **AC-3.10** Given I use the anon key directly, When I try to insert or update a `brief_answers` row, Then Supabase rejects it.

---

## 10. Testing

- **Unit tests (Vitest)** for the pure functions: `toLocalDateKey(date)`, `deriveStatus(answerCount)`, `dueAt(createdAt)`, `isOverdue(createdAt, answerCount, now)`, `dueAfterDeposit(createdAt, depositDate)`, `isDepositSoon(depositDate, today)`. Cover month ends and a UTC+9 (Seoul) and UTC+5 (Almaty) device. **[ASSUMPTION]**
- **Manual run-through** of every criterion in section 9 at 390px width, using the seed data in 8.2.
- **RLS check:** AC-3.10 from the browser console with the anon key.

---

## 11. Demo script (5 minutes)

1. Open My checks with seed data. Point out the three states: Overdue, due after deposit, Ready.
2. Open the Ready brief (Yuki). Show the Clinic refused card: "silence is information".
3. Tap "Check a doctor". Fill the form with made-up details and a deposit date tomorrow. Show the warning, the USD 120 price and the deposit link. Submit.
4. Open the new check. All four cards are Pending.
5. In the Supabase table editor, add the `cost` answer for Aigerim's request. Switch back: her brief turns Ready live.
6. Close on the RAT: "Would you pay USD 120, refundable, before a USD 2,000 deposit?"

---

## 12. Definition of done

| Check | Result |
|---|---|
| Problem, target user, user stories | Sections 1, 4 |
| Exactly three screens with elements and empty, loading, error states | Section 6 |
| CREATE TABLE SQL for both tables, RLS policies and Realtime | Section 8.1 |
| Anon RLS consequence stated correctly | Section 3.1 |
| Business rules, local-date rule explicit | Section 7 |
| Given/When/Then criteria per screen | Section 9, 27 criteria |
| Scope fits one session | Yes: 2 tables, 3 screens, no auth, no payments, no admin UI |
| Matches team MoSCoW (no directory, booking, reviews, sponsored placement) | Section 2 |
| Demo can show every state with seed data | Sections 8.2, 11 |
| Assumptions tagged | Section 13 |

**How we measure the RAT (outside the app):** requests in `check_requests` = interest. Deposits received in Wise or Revolut = willingness to pay. Conversion = paid ÷ submitted. Target before the next coaching session: set by the team. **[ASSUMPTION]**

---

## 13. Assumptions log

| # | Decision |
|---|---|
| 1 | Layout centered, max 430px wide on larger screens |
| 2 | External deposit link via `VITE_DEPOSIT_URL`; payment not tracked in the app |
| 3 | Operator fills answers in the Supabase table editor; no admin screen |
| 4 | Patient (anon) can read answers but cannot write them; cascade delete still removes them |
| 5 | Live updates through Supabase Realtime, within 5 seconds |
| 6 | Due and Overdue labels recompute every 60 seconds |
| 7 | Changed answer card gets a short highlight |
| 8 | Demo notice "Use made-up details only" on the form |
| 9 | Vitest for unit tests of date and status logic |
| 10 | RAT measured outside the app (Supabase rows vs. payments received) |

## 14. Open questions (non-blocking, after the demo)

1. Charge the patient (current RAT, USD 120) or the clinic? This build assumes the patient pays.
2. Which corridor first: Kazakhstan and Central Asia, China (Xiaohongshu), or Japan and Taiwan (Meta ads test)?
3. Will clinics confirm in writing which doctor operates on the day (assumption A2)?
