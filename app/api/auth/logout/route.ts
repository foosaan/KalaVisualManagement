import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  const cookieStore = await cookies();
  type SetCookie = {
    name: string;
    value: string;
    options: Parameters<typeof response.cookies.set>[2];
  };

  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: SetCookie[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  await supabase.auth.signOut();

  return response;
}
