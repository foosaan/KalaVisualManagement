import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import { getSupabaseUrl } from "@/lib/supabase/env";
import type { AppSupabaseClient } from "@/lib/supabase/types";

export function createServiceClient(): AppSupabaseClient {
  const url = getSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY must be set for service tasks."
    );
  }

  return createClient<Database, "public">(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }) as AppSupabaseClient;
}
