"use client";

import { type Locale, t } from "@/lib/i18n";

type GreetingHeroProps = {
  name: string | null;
  locale: Locale;
  upcomingCount: number;
  unpaidCount: number;
};

function getGreetingKey(hour: number): "dashboard.greeting.morning" | "dashboard.greeting.afternoon" | "dashboard.greeting.evening" | "dashboard.greeting.night" {
  if (hour >= 5 && hour < 11) return "dashboard.greeting.morning";
  if (hour >= 11 && hour < 15) return "dashboard.greeting.afternoon";
  if (hour >= 15 && hour < 18) return "dashboard.greeting.evening";
  return "dashboard.greeting.night";
}

function getFormattedDate(locale: Locale): string {
  const now = new Date();
  return now.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export function GreetingHero({ name, locale, upcomingCount, unpaidCount }: GreetingHeroProps) {
  const hour = new Date().getHours();
  const greetingKey = getGreetingKey(hour);
  const greeting = t(greetingKey, locale);
  const dateStr = getFormattedDate(locale);
  const displayName = name || "Photographer";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-cyan-500 px-6 py-7 sm:px-8 sm:py-8 animate-gradient">
      {/* Background decorations */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute right-12 bottom-4 h-20 w-20 rounded-full bg-cyan-300/10 blur-xl animate-float" />

      <div className="relative z-10">
        <p className="text-sm font-medium text-white/70">{dateStr}</p>
        <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
          {greeting}, {displayName}! 👋
        </h1>

        {/* Quick summary chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {upcomingCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-glow-pulse" />
              {upcomingCount} {t("dashboard.shootsThisWeek", locale)}
            </span>
          )}
          {unpaidCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-glow-pulse" />
              {unpaidCount} {t("dashboard.outstandingInvoices", locale)}
            </span>
          )}
          {upcomingCount === 0 && unpaidCount === 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
              {locale === "id" ? "Semua berjalan lancar!" : "All clear!"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
