import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const origin = requestUrl.origin;
  const cookieStore = await cookies();
  const response = NextResponse.redirect(new URL(next, origin));
  type SetCookie = {
    name: string;
    value: string;
    options: Parameters<typeof response.cookies.set>[2];
  };

  if (!code) {
    return NextResponse.redirect(new URL("/login", origin));
  }

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

  await supabase.auth.exchangeCodeForSession(code);

  return response;
}
