import { createClient } from "@/lib/supabase/server";
import { assertNoError } from "@/lib/queries/helpers";

export async function getCalendarData(year: number, month: number) {
  const supabase = await createClient();

  // Fetch jobs for the entire month (with some padding for display)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0, 23, 59, 59);

  // Extend range to include jobs visible in the calendar grid edges
  const gridStart = new Date(firstDay);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay()); // start of week
  const gridEnd = new Date(lastDay);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay())); // end of week

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(
      `
        id,
        title,
        shoot_type,
        start_at,
        end_at,
        location,
        status,
        currency,
        total_price,
        client_contact_id,
        workflow_status,
        job_contacts (
          contact_id,
          contact:contacts!job_contacts_contact_id_fkey (
            id,
            display_name
          ),
          role,
          is_primary,
          confirmation_status,
          fee_status
        )
      `
    )
    .gte("start_at", gridStart.toISOString())
    .lte("start_at", gridEnd.toISOString())
    .order("start_at", { ascending: true });

  assertNoError(error, "Unable to load calendar jobs");

  // Also fetch financial data for payment status
  const { data: financials } = await supabase
    .from("job_financials")
    .select("job_id, payment_status, assignment_status")
    .gte("start_at", gridStart.toISOString())
    .lte("start_at", gridEnd.toISOString());

  const financialMap = new Map(
    (financials || []).map((f) => [f.job_id, f])
  );

  return {
    jobs: (jobs ?? []).map((job) => ({
      ...job,
      payment_status: financialMap.get(job.id)?.payment_status || null,
      assignment_status: financialMap.get(job.id)?.assignment_status || null
    })),
    year,
    month
  };
}
