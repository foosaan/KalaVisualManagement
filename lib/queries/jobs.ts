import { QueryData } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { assertNoError } from "@/lib/queries/helpers";
import { getContactOptions } from "@/lib/queries/reference";

export async function getJobsPageData() {
  const supabase = await createClient();

  const jobsQuery = supabase.from("job_financials").select("*").order("start_at", { ascending: true });

  type JobsQueryData = QueryData<typeof jobsQuery>;

  const { data, error } = await jobsQuery;

  assertNoError(error, "Unable to load jobs");
  return (data ?? []) as JobsQueryData;
}

export async function getJobFormData(jobId?: string) {
  const [contacts, job] = await Promise.all([getContactOptions(), jobId ? getJobById(jobId) : null]);
  return { contacts, job };
}

export async function getJobById(jobId: string) {
  const supabase = await createClient();

  const jobQuery = supabase
    .from("jobs")
    .select(
      `
        *,
        job_contacts (
          id,
          contact_id,
          role,
          is_primary,
          send_reminder,
          fee_amount,
          notes,
          confirmation_status,
          fee_status,
          contact:contacts!job_contacts_contact_id_fkey (
            id,
            display_name,
            kind,
            phone,
            email,
            organization_name
          )
        ),
        payments (
          *
        ),
        expenses (
          *,
          vendor_contact:contacts!expenses_vendor_contact_id_fkey (
            id,
            display_name,
            kind
          )
        ),
        reminders (
          *,
          target_contact:contacts!reminders_target_contact_id_fkey (
            id,
            display_name,
            kind,
            phone
          )
        )
      `
    )
    .eq("id", jobId)
    .single();

  type JobQueryData = QueryData<typeof jobQuery>;

  const [{ data: job, error: jobError }, { data: financial, error: financialError }] =
    await Promise.all([
      jobQuery,
      supabase.from("job_financials").select("*").eq("job_id", jobId).maybeSingle()
    ]);

  assertNoError(jobError, "Unable to load job");
  assertNoError(financialError, "Unable to load job financials");

  return {
    job: job as JobQueryData,
    financial
  };
}
