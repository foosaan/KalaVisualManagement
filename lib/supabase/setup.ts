import type { PostgrestError } from "@supabase/supabase-js";

import { isMissingSchemaError } from "@/lib/queries/helpers";
import type { AppSupabaseClient } from "@/lib/supabase/types";

type ReadinessCheck = {
  label: string;
  error: PostgrestError | null;
};

export async function getDatabaseSetupState(supabase: AppSupabaseClient) {
  const [{ error: profilesError }, { error: jobsError }, { error: financialsError }] =
    await Promise.all([
      supabase.from("profiles").select("id", { head: true, count: "exact" }).limit(1),
      supabase.from("jobs").select("id", { head: true, count: "exact" }).limit(1),
      supabase.from("job_financials").select("job_id", { head: true, count: "exact" }).limit(1)
    ]);

  const checks: ReadinessCheck[] = [
    { label: "profiles", error: profilesError },
    { label: "jobs", error: jobsError },
    { label: "job_financials", error: financialsError }
  ];

  const blockingChecks = checks.filter((check) => isMissingSchemaError(check.error));

  return {
    ready: blockingChecks.length === 0,
    blockingChecks,
    firstErrorMessage: blockingChecks[0]?.error?.message ?? null
  };
}
