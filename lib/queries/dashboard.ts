import { addDays, format, subMonths } from "date-fns";
import { QueryData } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { assertNoError, isMissingSchemaError } from "@/lib/queries/helpers";

const EMPTY_DASHBOARD_SUMMARY = {
  totalGross: 0,
  totalNet: 0,
  unpaidCount: 0,
  pendingReminderCount: 0,
  upcomingCount: 0
};

export async function getDashboardData() {
  const supabase = await createClient();
  const now = new Date();
  const nextSevenDays = addDays(now, 7).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  const upcomingJobsQuery = supabase
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
        client_contact:contacts!jobs_client_contact_id_fkey (
          id,
          display_name,
          phone
        ),
        job_contacts (
          id,
          role,
          is_primary,
          send_reminder,
          contact:contacts!job_contacts_contact_id_fkey (
            id,
            display_name,
            phone,
            kind
          )
        )
      `
    )
    .gte("start_at", now.toISOString())
    .lte("start_at", nextSevenDays)
    .order("start_at", { ascending: true })
    .limit(6);

  const pendingRemindersQuery = supabase
    .from("reminders")
    .select(
      `
        id,
        message,
        reminder_type,
        recipient_name,
        scheduled_for,
        target_type,
        status,
        job:jobs (
          id,
          title
        )
      `
    )
    .eq("status", "pending")
    .order("scheduled_for", { ascending: true })
    .limit(8);

  const unpaidJobsQuery = supabase
    .from("job_financials")
    .select(
      `
        *
      `
    )
    .gt("outstanding_balance", 0)
    .order("start_at", { ascending: true })
    .limit(6);

  type UpcomingJobs = QueryData<typeof upcomingJobsQuery>;
  type PendingReminders = QueryData<typeof pendingRemindersQuery>;
  type UnpaidJobs = QueryData<typeof unpaidJobsQuery>;

  const [
    { data: upcomingJobs, error: upcomingJobsError },
    { data: financialRows, error: financialRowsError },
    { data: pendingReminders, error: pendingRemindersError },
    { data: unpaidJobs, error: unpaidJobsError }
  ] = await Promise.all([
    upcomingJobsQuery,
    supabase.from("job_financials").select("*"),
    pendingRemindersQuery,
    unpaidJobsQuery
  ]);

  const blockingChecks = [
    { label: "jobs", error: upcomingJobsError, message: "Unable to load upcoming jobs" },
    { label: "job_financials", error: financialRowsError, message: "Unable to load finance summary" },
    { label: "reminders", error: pendingRemindersError, message: "Unable to load reminders" }
  ].filter((check) => isMissingSchemaError(check.error));

  if (blockingChecks.length > 0) {
    return {
      setupRequired: true as const,
      firstErrorMessage: `${blockingChecks[0].message}: ${blockingChecks[0].error?.message}`,
      missingResources: [...new Set(blockingChecks.map((check) => check.label))],
      pendingReminders: [] as PendingReminders,
      summary: EMPTY_DASHBOARD_SUMMARY,
      unpaidJobs: [] as UnpaidJobs,
      upcomingJobs: [] as UpcomingJobs,
      monthlyTrend: [] as { month: string; gross: number; net: number }[],
      unassignedJobs: [] as { job_id: string; title: string; start_at: string }[],
      unpaidFees: [] as { job_id: string; title: string; total_crew_fees: number }[],
      upcomingDeadlines: [] as { job_id: string; title: string; deadline_type: string; deadline: string }[]
    };
  }

  assertNoError(upcomingJobsError, "Unable to load upcoming jobs");
  assertNoError(financialRowsError, "Unable to load finance summary");
  assertNoError(pendingRemindersError, "Unable to load reminders");
  assertNoError(unpaidJobsError, "Unable to load unpaid jobs");

  const monthRows = (financialRows ?? []).filter((row) => {
    if (!row.start_at) {
      return false;
    }

    return row.start_at >= monthStart && row.start_at < monthEnd;
  });

  const summary = monthRows.reduce(
    (acc, row) => {
      acc.totalGross += Number(row.gross_income ?? 0);
      acc.totalNet += Number(row.net_income ?? 0);
      return acc;
    },
    {
      totalGross: 0,
      totalNet: 0
    }
  );

  // Build monthly trend data for the last 6 months
  const monthlyTrend = buildMonthlyTrend(financialRows ?? [], now);

  // ── New KPIs ────────────────────────────────────────────────

  // Unassigned jobs (no photographer in upcoming jobs)
  const allFinancials = financialRows ?? [];
  const unassignedJobs = allFinancials
    .filter((row) => row.assignment_status === "unassigned" && row.status !== "cancelled" && row.status !== "delivered" && row.start_at && row.start_at >= now.toISOString())
    .slice(0, 6)
    .map((row) => ({ job_id: row.job_id!, title: row.title!, start_at: row.start_at! }));

  // Unpaid freelance fees
  const unpaidFeesRows = allFinancials
    .filter((row) => Number(row.total_crew_fees ?? 0) > 0 && row.status !== "cancelled")
    .slice(0, 6)
    .map((row) => ({ job_id: row.job_id!, title: row.title!, total_crew_fees: Number(row.total_crew_fees ?? 0) }));

  // Upcoming delivery deadlines within 3 days
  const threeDaysFromNow = addDays(now, 3).toISOString();
  const upcomingDeadlines: { job_id: string; title: string; deadline_type: string; deadline: string }[] = [];
  for (const row of allFinancials) {
    if (row.status === "cancelled" || row.status === "delivered") continue;
    if (row.delivery_deadline && row.delivery_deadline >= now.toISOString() && row.delivery_deadline <= threeDaysFromNow) {
      upcomingDeadlines.push({ job_id: row.job_id!, title: row.title!, deadline_type: "Delivery", deadline: row.delivery_deadline });
    }
  }

  return {
    setupRequired: false as const,
    upcomingJobs: (upcomingJobs ?? []) as UpcomingJobs,
    pendingReminders: (pendingReminders ?? []) as PendingReminders,
    unpaidJobs: (unpaidJobs ?? []) as UnpaidJobs,
    monthlyTrend,
    unassignedJobs,
    unpaidFees: unpaidFeesRows,
    upcomingDeadlines: upcomingDeadlines.slice(0, 6),
    summary: {
      upcomingCount: (upcomingJobs ?? []).length,
      unpaidCount: (unpaidJobs ?? []).length,
      pendingReminderCount: (pendingReminders ?? []).length,
      unassignedCount: unassignedJobs.length,
      deadlineCount: upcomingDeadlines.length,
      ...summary
    }
  };
}

function buildMonthlyTrend(
  rows: { start_at: string | null; gross_income: string | number | null; net_income: string | number | null }[],
  now: Date
) {
  const months: { month: string; start: string; end: string }[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = subMonths(now, i);
    const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString();
    months.push({
      month: format(date, "MMM yyyy"),
      start,
      end
    });
  }

  return months.map(({ month, start, end }) => {
    const monthRows = rows.filter((row) => {
      if (!row.start_at) return false;
      return row.start_at >= start && row.start_at < end;
    });

    return {
      month,
      gross: monthRows.reduce((sum, row) => sum + Number(row.gross_income ?? 0), 0),
      net: monthRows.reduce((sum, row) => sum + Number(row.net_income ?? 0), 0)
    };
  });
}
