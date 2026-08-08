"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidateJobSurfaces } from "@/lib/actions/shared";

export async function cancelReminderAction(reminderId: string, jobId: string) {
  const supabase = await createClient();
  await supabase
    .from("reminders")
    .update({
      status: "cancelled",
      last_error: null
    })
    .eq("id", reminderId)
    .eq("status", "pending");

  revalidateJobSurfaces(jobId);
}
