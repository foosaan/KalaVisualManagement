-- ╔══════════════════════════════════════════════════╗
-- ║  CLEAN RESET: Drop everything, then rebuild     ║
-- ║  WARNING: This deletes ALL data!                ║
-- ╚══════════════════════════════════════════════════╝

-- 1. Drop views
drop view if exists public.job_financials cascade;

-- 2. Drop tables (order matters for FK)
drop table if exists public.reminder_deliveries cascade;
drop table if exists public.reminders cascade;
drop table if exists public.expenses cascade;
drop table if exists public.payments cascade;
drop table if exists public.job_contacts cascade;
drop table if exists public.jobs cascade;
drop table if exists public.contacts cascade;
drop table if exists public.profiles cascade;

-- 3. Drop functions
drop function if exists public.save_job_with_contacts cascade;
drop function if exists public.handle_new_user cascade;
drop function if exists public.set_updated_at cascade;

-- 4. Drop types
drop type if exists public.reminder_status cascade;
drop type if exists public.reminder_channel cascade;
drop type if exists public.reminder_target_type cascade;
drop type if exists public.reminder_type cascade;
drop type if exists public.expense_category cascade;
drop type if exists public.payment_method cascade;
drop type if exists public.payment_type cascade;
drop type if exists public.job_contact_role cascade;
drop type if exists public.job_status cascade;
drop type if exists public.shoot_type cascade;
drop type if exists public.contact_kind cascade;

-- ═══════════════════════════════════════════════════
-- NOW REBUILD EVERYTHING FRESH
-- ═══════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─── ENUMS ───
create type public.contact_kind as enum ('client','fg_model','crew','editor','vendor','other');
create type public.shoot_type as enum ('portrait','prewedding','wedding','graduation','brand','event','family','other');
create type public.job_status as enum ('draft','confirmed','completed','delivered','cancelled');
create type public.job_contact_role as enum ('client','fg_model','crew','editor','other');
create type public.payment_type as enum ('dp','partial','final');
create type public.payment_method as enum ('cash','bank_transfer','ewallet','credit_card','other');
create type public.expense_category as enum ('fg_fee','crew_fee','equipment_rental','transport','meal','editing','studio_rent','other');
create type public.reminder_type as enum ('h_7','h_3','h_1','same_day','custom');
create type public.reminder_target_type as enum ('self','client','fg_model','crew','custom');
create type public.reminder_channel as enum ('internal','whatsapp');
create type public.reminder_status as enum ('pending','sent','failed','cancelled');

-- ─── FUNCTIONS ───
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- ─── TABLES ───
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  business_name text,
  phone text,
  timezone text not null default 'Asia/Jakarta',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table public.contacts (
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

create table public.jobs (
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

create table public.job_contacts (
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

create table public.payments (
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

create table public.expenses (
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

create table public.reminders (
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

create table public.reminder_deliveries (
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

-- ─── INDEXES ───
create index contacts_owner_kind_idx on public.contacts(owner_id, kind);
create index jobs_owner_status_idx on public.jobs(owner_id, status);
create index jobs_owner_start_at_idx on public.jobs(owner_id, start_at desc);
create index job_contacts_job_id_idx on public.job_contacts(job_id);
create index job_contacts_contact_id_idx on public.job_contacts(contact_id);
create index payments_job_id_idx on public.payments(job_id, payment_date desc);
create index expenses_job_id_idx on public.expenses(job_id, expense_date desc);
create index reminders_scheduled_idx on public.reminders(owner_id, status, scheduled_for);
create index reminders_job_id_idx on public.reminders(job_id, scheduled_for);
create index reminder_deliveries_reminder_idx on public.reminder_deliveries(reminder_id);

-- ─── TRIGGERS ───
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_contacts_updated_at before update on public.contacts for each row execute function public.set_updated_at();
create trigger set_jobs_updated_at before update on public.jobs for each row execute function public.set_updated_at();
create trigger set_job_contacts_updated_at before update on public.job_contacts for each row execute function public.set_updated_at();
create trigger set_payments_updated_at before update on public.payments for each row execute function public.set_updated_at();
create trigger set_expenses_updated_at before update on public.expenses for each row execute function public.set_updated_at();
create trigger set_reminders_updated_at before update on public.reminders for each row execute function public.set_updated_at();

-- ─── AUTH TRIGGER ───
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
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

-- Backfill: create profile row for existing auth user(s) that may not have one
insert into public.profiles (id, full_name, business_name, phone)
select
  id,
  raw_user_meta_data ->> 'full_name',
  raw_user_meta_data ->> 'business_name',
  raw_user_meta_data ->> 'phone'
from auth.users
on conflict (id) do nothing;

-- ─── RPC ───
create or replace function public.save_job_with_contacts(
  p_job_id uuid, p_title text, p_shoot_type public.shoot_type,
  p_client_contact_id uuid, p_start_at timestamptz, p_end_at timestamptz,
  p_location text, p_total_price numeric, p_currency text,
  p_status public.job_status, p_notes text, p_concept text,
  p_contacts jsonb default '[]'::jsonb
)
returns uuid language plpgsql security invoker set search_path = public as $$
declare
  v_owner_id uuid := auth.uid();
  v_job_id uuid;
begin
  if v_owner_id is null then raise exception 'Authentication required'; end if;

  if p_job_id is null then
    insert into public.jobs (owner_id, title, shoot_type, client_contact_id, start_at, end_at, location, total_price, currency, status, notes, concept)
    values (v_owner_id, p_title, coalesce(p_shoot_type,'other'), p_client_contact_id, p_start_at, p_end_at, nullif(p_location,''), coalesce(p_total_price,0), coalesce(nullif(p_currency,''),'IDR'), coalesce(p_status,'draft'), nullif(p_notes,''), nullif(p_concept,''))
    returning id into v_job_id;
  else
    update public.jobs set title=p_title, shoot_type=coalesce(p_shoot_type,shoot_type), client_contact_id=p_client_contact_id, start_at=p_start_at, end_at=p_end_at, location=nullif(p_location,''), total_price=coalesce(p_total_price,0), currency=coalesce(nullif(p_currency,''),'IDR'), status=coalesce(p_status,status), notes=nullif(p_notes,''), concept=nullif(p_concept,''), updated_at=timezone('utc'::text,now())
    where id=p_job_id and owner_id=v_owner_id returning id into v_job_id;
    if v_job_id is null then raise exception 'Job not found'; end if;
    delete from public.job_contacts where job_id=v_job_id and owner_id=v_owner_id;
  end if;

  insert into public.job_contacts (owner_id, job_id, contact_id, role, is_primary, send_reminder, fee_amount, notes)
  select v_owner_id, v_job_id, (item->>'contact_id')::uuid, coalesce((item->>'role')::public.job_contact_role,'crew'), coalesce((item->>'is_primary')::boolean,false), coalesce((item->>'send_reminder')::boolean,true), nullif(item->>'fee_amount','')::numeric, nullif(item->>'notes','')
  from jsonb_array_elements(coalesce(p_contacts,'[]'::jsonb)) as item where item ? 'contact_id';

  return v_job_id;
end;
$$;

-- ─── VIEW ───
create or replace view public.job_financials with (security_invoker = true) as
select
  jobs.id as job_id, jobs.owner_id, jobs.title, jobs.shoot_type, jobs.start_at, jobs.end_at,
  jobs.location, jobs.status, jobs.currency, jobs.total_price as gross_income, jobs.client_contact_id,
  client.display_name as client_name,
  coalesce(pt.total_paid, 0) as paid_income,
  jobs.total_price - coalesce(pt.total_paid, 0) as outstanding_balance,
  coalesce(et.total_expenses, 0) as total_expenses,
  jobs.total_price - coalesce(et.total_expenses, 0) as net_income,
  case
    when coalesce(pt.total_paid, 0) <= 0 then 'unpaid'
    when coalesce(pt.total_paid, 0) < jobs.total_price then 'partially_paid'
    else 'paid'
  end as payment_status
from public.jobs
left join public.contacts client on client.id = jobs.client_contact_id
left join (select job_id, sum(amount) as total_paid from public.payments group by job_id) pt on pt.job_id = jobs.id
left join (select job_id, sum(amount) as total_expenses from public.expenses group by job_id) et on et.job_id = jobs.id;

-- ─── RLS ───
alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.jobs enable row level security;
alter table public.job_contacts enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.reminders enable row level security;
alter table public.reminder_deliveries enable row level security;

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
