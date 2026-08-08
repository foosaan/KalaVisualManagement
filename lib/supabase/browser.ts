"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { AppSupabaseClient } from "@/lib/supabase/types";

let browserClient: AppSupabaseClient | null = null;

export function createBrowserSupabaseClient(): AppSupabaseClient {
  if (!browserClient) {
    browserClient = createBrowserClient<Database, "public">(
      getSupabaseUrl(),
      getSupabasePublishableKey()
    ) as unknown as AppSupabaseClient;
  }

  return browserClient as AppSupabaseClient;
}
