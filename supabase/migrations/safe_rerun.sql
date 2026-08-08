-- Safe re-runnable migration for KalaVisual Management
-- All statements use IF NOT EXISTS / CREATE OR REPLACE

create extension if not exists pgcrypto;

-- ─── ENUMS (safe create) ───
DO $$ BEGIN CREATE TYPE public.contact_kind AS ENUM ('client','fg_model','crew','editor','vendor','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.shoot_type AS ENUM ('portrait','prewedding','wedding','graduation','brand','event','family','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.job_status AS ENUM ('draft','confirmed','completed','delivered','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.job_contact_role AS ENUM ('client','fg_model','crew','editor','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.payment_type AS ENUM ('dp','partial','final'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.payment_method AS ENUM ('cash','bank_transfer','ewallet','credit_card','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.expense_category AS ENUM ('fg_fee','crew_fee','equipment_rental','transport','meal','editing','studio_rent','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.reminder_type AS ENUM ('h_7','h_3','h_1','same_day','custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.reminder_target_type AS ENUM ('self','client','fg_model','crew','custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.reminder_channel AS ENUM ('internal','whatsapp'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.reminder_status AS ENUM ('pending','sent','failed','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── FUNCTIONS ───
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- ─── TABLES ───
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  business_name text,
  phone text,
  timezone text not null default 'Asia/Jakarta',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind public.contact_kind not null default 'other',
  display_name text not null,
  default_role public.job_contact_role,
  organization_name text,
  phone text,
  email text,
  instagram_handle text,
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  shoot_type public.shoot_type not null default 'other',
  client_contact_id uuid references public.contacts(id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  location text,
  total_price numeric(12, 2) not null default 0 check (total_price >= 0),
  currency text not null default 'IDR',
  status public.job_status not null default 'draft',
  notes text,
  concept text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint jobs_end_after_start check (end_at >= start_at)
);

create table if not exists public.job_contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  role public.job_contact_role not null default 'crew',
  is_primary boolean not null default false,
  send_reminder boolean not null default true,
  fee_amount numeric(12, 2) check (fee_amount is null or fee_amount >= 0),
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (job_id, contact_id, role)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  payment_type public.payment_type not null default 'dp',
  payment_method public.payment_method not null default 'bank_transfer',
  amount numeric(12, 2) not null check (amount > 0),
  payment_date date not null default current_date,
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  vendor_contact_id uuid references public.contacts(id) on delete set null,
  category public.expense_category not null default 'other',
  description text not null,
  amount numeric(12, 2) not null check (amount > 0),
  expense_date date not null default current_date,
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  reminder_type public.reminder_type not null,
  target_type public.reminder_target_type not null default 'self',
  target_contact_id uuid references public.contacts(id) on delete set null,
  recipient_name text,
  recipient_phone text,
  channel public.reminder_channel not null default 'whatsapp',
  scheduled_for timestamptz not null,
  message text not null,
  status public.reminder_status not null default 'pending',
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.reminder_deliveries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  reminder_id uuid not null references public.reminders(id) on delete cascade,
  channel public.reminder_channel not null,
  target_phone text,
  payload jsonb not null default '{}'::jsonb,
  status public.reminder_status not null default 'pending',
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- ─── INDEXES (safe) ───
create index if not exists contacts_owner_kind_idx on public.contacts(owner_id, kind);
create index if not exists jobs_owner_status_idx on public.jobs(owner_id, status);
create index if not exists jobs_owner_start_at_idx on public.jobs(owner_id, start_at desc);
create index if not exists job_contacts_job_id_idx on public.job_contacts(job_id);
create index if not exists job_contacts_contact_id_idx on public.job_contacts(contact_id);
create index if not exists payments_job_id_idx on public.payments(job_id, payment_date desc);
create index if not exists expenses_job_id_idx on public.expenses(job_id, expense_date desc);
create index if not exists reminders_scheduled_idx on public.reminders(owner_id, status, scheduled_for);
create index if not exists reminders_job_id_idx on public.reminders(job_id, scheduled_for);
create index if not exists reminder_deliveries_reminder_idx on public.reminder_deliveries(reminder_id);

-- ─── TRIGGERS (drop + create) ───
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists set_contacts_updated_at on public.contacts;
create trigger set_contacts_updated_at before update on public.contacts for each row execute function public.set_updated_at();

drop trigger if exists set_jobs_updated_at on public.jobs;
create trigger set_jobs_updated_at before update on public.jobs for each row execute function public.set_updated_at();

drop trigger if exists set_job_contacts_updated_at on public.job_contacts;
create trigger set_job_contacts_updated_at before update on public.job_contacts for each row execute function public.set_updated_at();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at before update on public.payments for each row execute function public.set_updated_at();

drop trigger if exists set_expenses_updated_at on public.expenses;
create trigger set_expenses_updated_at before update on public.expenses for each row execute function public.set_updated_at();

drop trigger if exists set_reminders_updated_at on public.reminders;
create trigger set_reminders_updated_at before update on public.reminders for each row execute function public.set_updated_at();

-- ─── AUTH TRIGGER (handle new user → auto profile) ───
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, business_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'business_name',
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- ─── RPC: save_job_with_contacts ───
create or replace function public.save_job_with_contacts(
  p_job_id uuid,
  p_title text,
  p_shoot_type public.shoot_type,
  p_client_contact_id uuid,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_location text,
  p_total_price numeric,
  p_currency text,
  p_status public.job_status,
  p_notes text,
  p_concept text,
  p_contacts jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_owner_id uuid := auth.uid();
  v_job_id uuid;
begin
  if v_owner_id is null then
    raise exception 'Authentication required';
  end if;

  if p_job_id is null then
    insert into public.jobs (
      owner_id, title, shoot_type, client_contact_id,
      start_at, end_at, location, total_price, currency,
      status, notes, concept
    )
    values (
      v_owner_id, p_title, coalesce(p_shoot_type, 'other'),
      p_client_contact_id, p_start_at, p_end_at,
      nullif(p_location, ''), coalesce(p_total_price, 0),
      coalesce(nullif(p_currency, ''), 'IDR'),
      coalesce(p_status, 'draft'), nullif(p_notes, ''),
      nullif(p_concept, '')
    )
    returning id into v_job_id;
  else
    update public.jobs
    set
      title = p_title,
      shoot_type = coalesce(p_shoot_type, shoot_type),
      client_contact_id = p_client_contact_id,
      start_at = p_start_at,
      end_at = p_end_at,
      location = nullif(p_location, ''),
      total_price = coalesce(p_total_price, 0),
      currency = coalesce(nullif(p_currency, ''), 'IDR'),
      status = coalesce(p_status, status),
      notes = nullif(p_notes, ''),
      concept = nullif(p_concept, ''),
      updated_at = timezone('utc'::text, now())
    where id = p_job_id and owner_id = v_owner_id
    returning id into v_job_id;

    if v_job_id is null then
      raise exception 'Job not found';
    end if;

    delete from public.job_contacts
    where job_id = v_job_id and owner_id = v_owner_id;
  end if;

  insert into public.job_contacts (
    owner_id, job_id, contact_id, role,
    is_primary, send_reminder, fee_amount, notes
  )
  select
    v_owner_id, v_job_id,
    (item ->> 'contact_id')::uuid,
    coalesce((item ->> 'role')::public.job_contact_role, 'crew'),
    coalesce((item ->> 'is_primary')::boolean, false),
    coalesce((item ->> 'send_reminder')::boolean, true),
    nullif(item ->> 'fee_amount', '')::numeric,
    nullif(item ->> 'notes', '')
  from jsonb_array_elements(coalesce(p_contacts, '[]'::jsonb)) as item
  where item ? 'contact_id';

  return v_job_id;
end;
$$;

-- ─── VIEW ───
create or replace view public.job_financials
with (security_invoker = true) as
select
  jobs.id as job_id,
  jobs.owner_id,
  jobs.title,
  jobs.shoot_type,
  jobs.start_at,
  jobs.end_at,
  jobs.location,
  jobs.status,
  jobs.currency,
  jobs.total_price as gross_income,
  jobs.client_contact_id,
  client.display_name as client_name,
  coalesce(payment_totals.total_paid, 0) as paid_income,
  jobs.total_price - coalesce(payment_totals.total_paid, 0) as outstanding_balance,
  coalesce(expense_totals.total_expenses, 0) as total_expenses,
  jobs.total_price - coalesce(expense_totals.total_expenses, 0) as net_income,
  case
    when coalesce(payment_totals.total_paid, 0) <= 0 then 'unpaid'
    when coalesce(payment_totals.total_paid, 0) < jobs.total_price then 'partially_paid'
    else 'paid'
  end as payment_status
from public.jobs
left join public.contacts client on client.id = jobs.client_contact_id
left join (
  select job_id, sum(amount) as total_paid
  from public.payments
  group by job_id
) as payment_totals on payment_totals.job_id = jobs.id
left join (
  select job_id, sum(amount) as total_expenses
  from public.expenses
  group by job_id
) as expense_totals on expense_totals.job_id = jobs.id;

-- ─── RLS ───
alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.jobs enable row level security;
alter table public.job_contacts enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.reminders enable row level security;
alter table public.reminder_deliveries enable row level security;

-- Policies (drop + recreate to avoid "already exists")
DO $$ BEGIN
  drop policy if exists "profiles_select_own" on public.profiles;
  drop policy if exists "profiles_insert_own" on public.profiles;
  drop policy if exists "profiles_update_own" on public.profiles;
  drop policy if exists "contacts_all_own" on public.contacts;
  drop policy if exists "jobs_all_own" on public.jobs;
  drop policy if exists "job_contacts_all_own" on public.job_contacts;
  drop policy if exists "payments_all_own" on public.payments;
  drop policy if exists "expenses_all_own" on public.expenses;
  drop policy if exists "reminders_all_own" on public.reminders;
  drop policy if exists "reminder_deliveries_all_own" on public.reminder_deliveries;
END $$;

create policy "profiles_select_own" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "contacts_all_own" on public.contacts for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "jobs_all_own" on public.jobs for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "job_contacts_all_own" on public.job_contacts for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "payments_all_own" on public.payments for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "expenses_all_own" on public.expenses for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "reminders_all_own" on public.reminders for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "reminder_deliveries_all_own" on public.reminder_deliveries for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
