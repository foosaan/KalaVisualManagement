import { cookies } from "next/headers";
import { type Locale, DEFAULT_LOCALE } from "@/lib/i18n";

export const LOCALE_COOKIE = "kv_locale";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  if (value === "en" || value === "id") return value;
  return DEFAULT_LOCALE;
}
