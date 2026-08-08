# KalaVisual Management

Production-style MVP for a freelance photographer management system built with Next.js, Supabase, TypeScript, zod, react-hook-form, and shadcn-style UI primitives.

## What this app covers

- Upcoming shoot tracking and dashboard visibility
- Job management with multiple contacts per job
- Contacts CRUD for clients, FG/model, crew, and vendors
- Payments CRUD with DP and final payment tracking
- Expenses CRUD with automatic gross and net profit calculation
- Reminders CRUD with a gateway abstraction for future WhatsApp delivery
- Financial summaries across all jobs
- Supabase Auth and row-level security

## Business rules implemented

- Gross income = `jobs.total_price`
- Net income = `jobs.total_price - sum(expenses.amount)`
- Outstanding balance = `jobs.total_price - sum(payments.amount)`
- One job can have many contacts through `job_contacts`
- Reminders can target `self`, `client`, `fg_model`, `crew`, or `custom`
- Reminder delivery is abstracted in [`lib/services/reminders.ts`](/Users/admin/DATA%20D/KalaVisual%20Management%20/lib/services/reminders.ts)

## Folder structure

```text
app/
  (auth)/login/              auth entry
  (app)/                     protected app shell
    dashboard/               overview and KPIs
    jobs/                    jobs list, detail, create, edit
    contacts/                contacts CRUD
    payments/                payments CRUD
    expenses/                expenses CRUD
    reminders/               reminders CRUD
    finance/                 cross-job financial summary
  api/
    auth/                    Supabase auth callback/logout
    reminders/process/       reminder processing endpoint
components/
  contacts/                  contact forms
  dashboard/                 dashboard cards
  expenses/                  expense forms
  forms/                     auth form
  jobs/                      job forms and badges
  layout/                    app shell
  payments/                  payment forms
  reminders/                 reminder forms
  ui/                        shadcn-style UI primitives
lib/
  actions/                   typed server actions for CRUD
  queries/                   server-side data loading
  services/                  reminder gateway abstraction
  supabase/                  browser/server/service clients
  validation/                zod schemas
supabase/
  migrations/                SQL schema, RLS, functions, and view
```

## Database assets

- Main migration: [`supabase/migrations/202604230001_init.sql`](/Users/admin/DATA%20D/KalaVisual%20Management%20/supabase/migrations/202604230001_init.sql)
- Database types: [`lib/database.types.ts`](/Users/admin/DATA%20D/KalaVisual%20Management%20/lib/database.types.ts)

Key schema pieces:

- `profiles`
- `contacts`
- `jobs`
- `job_contacts`
- `payments`
- `expenses`
- `reminders`
- `reminder_deliveries`
- `job_financials` view
- `save_job_with_contacts(...)` transactional function

## Environment variables

Copy `.env.example` into `.env.local` and fill:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
REMINDER_CRON_SECRET=
```

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the Supabase SQL migration in your Supabase project.
3. Start the app:
   ```bash
   npm run dev
   ```

## Reminder processing

The reminder queue is intentionally abstracted for future WhatsApp support.

- Current gateway: `LoggingReminderGateway`
- Processing route: `POST /api/reminders/process`
- Optional protection header: `x-reminder-secret: $REMINDER_CRON_SECRET`

Example:

```bash
curl -X POST http://localhost:3000/api/reminders/process \
  -H "x-reminder-secret: your-secret"
```

## Notes for the next iteration

- Add filtering, search, and pagination
- Add WhatsApp gateway implementation
- Add recurring reminder templates relative to `jobs.shoot_at`
- Add file uploads for contracts or moodboards
- Add richer analytics and export
