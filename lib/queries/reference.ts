import { createClient } from "@/lib/supabase/server";
import { assertNoError } from "@/lib/queries/helpers";

export async function getContactOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("id, display_name, kind, phone")
    .order("display_name");

  assertNoError(error, "Unable to load contacts");
  return data ?? [];
}

export async function getJobOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, start_at, currency, status")
    .order("start_at", { ascending: true });

  assertNoError(error, "Unable to load jobs");
  return data ?? [];
}
