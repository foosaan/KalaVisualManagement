import { createClient } from "@/lib/supabase/server";
import { assertNoError } from "@/lib/queries/helpers";

export async function getContactsPageData() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("display_name");

  assertNoError(error, "Unable to load contacts");
  return data ?? [];
}

export async function getContactById(contactId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", contactId)
    .single();

  assertNoError(error, "Unable to load contact");
  return data;
}

/**
 * Get all jobs a contact has been assigned to.
 */
export async function getContactJobHistory(contactId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_contacts")
    .select(`
      role,
      is_primary,
      fee_amount,
      confirmation_status,
      fee_status,
      jobs!job_contacts_job_id_fkey (
        id, title, shoot_type, start_at, end_at, location, status,
        total_price, currency, workflow_status
      )
    `)
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false });

  assertNoError(error, "Unable to load contact history");
  return data ?? [];
}
