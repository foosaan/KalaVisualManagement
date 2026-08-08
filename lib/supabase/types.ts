import { createClient as createBaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

export type AppSupabaseClient = ReturnType<typeof createBaseClient<Database, "public">>;
