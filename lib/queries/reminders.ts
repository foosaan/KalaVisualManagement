import { QueryData } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { assertNoError } from "@/lib/queries/helpers";

export async function getRemindersPageData() {
  const supabase = await createClient();
  const remindersQuery = supabase
    .from("reminders")
    .select(
      `
        *,
        jobs (
          id,
          title,
          currency,
          start_at
        ),
        target_contact:contacts!reminders_target_contact_id_fkey (
          id,
          display_name,
          kind,
          phone
        )
      `
    )
    .order("scheduled_for", { ascending: true });

  type RemindersQueryData = QueryData<typeof remindersQuery>;

  const { data, error } = await remindersQuery;

  assertNoError(error, "Unable to load reminders");
  return (data ?? []) as RemindersQueryData;
}
