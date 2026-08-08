import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { AppSupabaseClient } from "@/lib/supabase/types";

export async function createClient(): Promise<AppSupabaseClient> {
  const cookieStore = await cookies();
  type SetCookie = {
    name: string;
    value: string;
    options: Parameters<typeof cookieStore.set>[2];
  };

  return createServerClient<Database, "public">(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: SetCookie[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot write cookies during render.
          }
        }
      }
    }
  ) as unknown as AppSupabaseClient;
}
