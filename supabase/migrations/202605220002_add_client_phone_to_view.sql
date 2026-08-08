-- Add client_phone to job_financials view
-- Run this in Supabase SQL Editor

drop view if exists public.job_financials;

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
  client.phone as client_phone,
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
