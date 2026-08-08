-- ============================================================
-- KalaVisual Management — Assignment & Workflow Enhancement
-- SAFE RERUN: Drops old enums/columns first, then recreates
-- ============================================================

-- 0. Cleanup: Drop old view, columns, and enums from previous partial run
-- ============================================================

drop view if exists public.job_financials;

-- Drop columns that reference old enums (if they exist)
alter table public.job_contacts drop column if exists confirmation_status;
alter table public.job_contacts drop column if exists fee_status;
alter table public.job_contacts drop column if exists fee_paid_amount;

alter table public.jobs drop column if exists workflow_status;
alter table public.jobs drop column if exists preview_deadline;
alter table public.jobs drop column if exists editing_deadline;
alter table public.jobs drop column if exists delivery_deadline;
alter table public.jobs drop column if exists actual_delivery_date;

-- Drop old enums + any functions that depend on them (CASCADE)
drop type if exists public.confirmation_status cascade;
drop type if exists public.fee_payment_status cascade;
drop type if exists public.workflow_status cascade;

-- 1. Create simplified enums
-- ============================================================
 
create type public.confirmation_status as enum (
  'pending',
  'accepted', 
  'declined',
  'tentative'
);

create type public.fee_payment_status as enum (
  'unpaid',
  'paid'
);

create type public.workflow_status as enum (
  'scheduled',
  'shot',
  'editing',
  'ready',
  'delivered'
);

-- 2. ALTER job_contacts — add confirmation & fee tracking
-- ============================================================

alter table public.job_contacts
  add column confirmation_status public.confirmation_status not null default 'accepted',
  add column fee_status public.fee_payment_status not null default 'unpaid';

-- 3. ALTER jobs — add workflow status & delivery deadline
-- ============================================================

alter table public.jobs
  add column workflow_status public.workflow_status not null default 'scheduled',
  add column delivery_deadline timestamptz,
  add column actual_delivery_date timestamptz;

-- 4. Update save_job_with_contacts function
-- ============================================================

create or replace function public.save_job_with_contacts(
  p_job_id uuid default null,
  p_title text default '',
  p_shoot_type public.shoot_type default 'other',
  p_client_contact_id uuid default null,
  p_start_at timestamptz default now(),
  p_end_at timestamptz default now(),
  p_location text default null,
  p_total_price numeric default 0,
  p_currency text default 'IDR',
  p_status public.job_status default 'draft',
  p_notes text default null,
  p_concept text default null,
  p_workflow_status public.workflow_status default 'scheduled',
  p_delivery_deadline timestamptz default null,
  p_actual_delivery_date timestamptz default null,
  p_contacts jsonb default '[]'
)
returns uuid
language plpgsql security definer as
$$
declare
  v_owner_id uuid := auth.uid();
  v_job_id uuid;
begin
  if v_owner_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_job_id is null then
    insert into public.jobs (
      owner_id,
      title,
      shoot_type,
      client_contact_id,
      start_at,
      end_at,
      location,
      total_price,
      currency,
      status,
      notes,
      concept,
      workflow_status,
      delivery_deadline,
      actual_delivery_date
    ) values (
      v_owner_id,
      p_title,
      p_shoot_type,
      p_client_contact_id,
      p_start_at,
      p_end_at,
      p_location,
      p_total_price,
      p_currency,
      p_status,
      p_notes,
      p_concept,
      p_workflow_status,
      p_delivery_deadline,
      p_actual_delivery_date
    )
    returning id into v_job_id;
  else
    v_job_id := p_job_id;

    update public.jobs set
      title = p_title,
      shoot_type = p_shoot_type,
      client_contact_id = p_client_contact_id,
      start_at = p_start_at,
      end_at = p_end_at,
      location = p_location,
      total_price = p_total_price,
      currency = p_currency,
      status = p_status,
      notes = p_notes,
      concept = p_concept,
      workflow_status = p_workflow_status,
      delivery_deadline = p_delivery_deadline,
      actual_delivery_date = p_actual_delivery_date,
      updated_at = now()
    where id = v_job_id and owner_id = v_owner_id
    returning id into v_job_id;

    if v_job_id is null then
      raise exception 'Job not found';
    end if;

    delete from public.job_contacts
    where job_id = v_job_id and owner_id = v_owner_id;
  end if;

  insert into public.job_contacts (
    owner_id,
    job_id,
    contact_id,
    role,
    is_primary,
    send_reminder,
    fee_amount,
    notes,
    confirmation_status,
    fee_status
  )
  select
    v_owner_id,
    v_job_id,
    (item ->> 'contact_id')::uuid,
    coalesce((item ->> 'role')::public.job_contact_role, 'crew'),
    coalesce((item ->> 'is_primary')::boolean, false),
    coalesce((item ->> 'send_reminder')::boolean, true),
    nullif(item ->> 'fee_amount', '')::numeric,
    nullif(item ->> 'notes', ''),
    coalesce((item ->> 'confirmation_status')::public.confirmation_status, 'accepted'),
    coalesce((item ->> 'fee_status')::public.fee_payment_status, 'unpaid')
  from jsonb_array_elements(coalesce(p_contacts, '[]'::jsonb)) as item
  where item ? 'contact_id';

  return v_job_id;
end;
$$;

-- 5. Recreate job_financials view
-- ============================================================

create view public.job_financials
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
  jobs.workflow_status,
  jobs.delivery_deadline,
  jobs.actual_delivery_date,
  jobs.total_price as gross_income,
  jobs.client_contact_id,
  client.display_name as client_name,
  coalesce(payment_totals.total_paid, 0) as paid_income,
  jobs.total_price - coalesce(payment_totals.total_paid, 0) as outstanding_balance,
  coalesce(expense_totals.total_expenses, 0) as total_expenses,
  coalesce(fee_totals.total_fees, 0) as total_crew_fees,
  jobs.total_price - coalesce(expense_totals.total_expenses, 0) - coalesce(fee_totals.total_fees, 0) as net_income,
  case
    when coalesce(payment_totals.total_paid, 0) <= 0 then 'unpaid'
    when coalesce(payment_totals.total_paid, 0) < jobs.total_price then 'partially_paid'
    else 'paid'
  end as payment_status,
  coalesce(assignment_counts.total_photographers, 0) as total_photographers,
  coalesce(assignment_counts.confirmed_photographers, 0) as confirmed_photographers,
  case
    when coalesce(assignment_counts.total_photographers, 0) = 0 then 'unassigned'
    when coalesce(assignment_counts.declined_count, 0) > 0 then 'need_replacement'
    when coalesce(assignment_counts.confirmed_photographers, 0) = coalesce(assignment_counts.total_photographers, 0) then 'confirmed'
    else 'waiting_confirmation'
  end as assignment_status
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
) as expense_totals on expense_totals.job_id = jobs.id
left join (
  select job_id, sum(coalesce(fee_amount, 0)) as total_fees
  from public.job_contacts
  where role in ('fg_model', 'crew', 'editor') and fee_amount is not null
  group by job_id
) as fee_totals on fee_totals.job_id = jobs.id
left join (
  select
    job_id,
    count(*) filter (where role in ('fg_model', 'crew')) as total_photographers,
    count(*) filter (where role in ('fg_model', 'crew') and confirmation_status = 'accepted') as confirmed_photographers,
    count(*) filter (where role in ('fg_model', 'crew') and confirmation_status = 'declined') as declined_count
  from public.job_contacts
  group by job_id
) as assignment_counts on assignment_counts.job_id = jobs.id;

-- 6. Indexes
-- ============================================================

create index if not exists jobs_workflow_status_idx on public.jobs(owner_id, workflow_status);
create index if not exists jobs_delivery_deadline_idx on public.jobs(owner_id, delivery_deadline) where delivery_deadline is not null;
create index if not exists job_contacts_confirmation_idx on public.job_contacts(job_id, confirmation_status);
