"use client";

import Link from "next/link";
import {
  CalendarClock,
  Sparkles,
  MessageSquare,
  Plus,
  Zap,
  TrendingUp,
  Receipt,
  CheckCircle2,
  Clock
} from "lucide-react";
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
    timeZone: "Asia/Jakarta",
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
  const displayName = name || "Studio Owner";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-6 sm:p-8 text-white shadow-2xl animate-fade-in border border-emerald-400/20">
      {/* Glow Orbs */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative z-10 space-y-4">
        {/* Date & Branding */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/10">
            <Clock className="h-3.5 w-3.5 text-emerald-200" /> {dateStr} (WIB)
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-200 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            🎓 Po.Graduation Intelligent Dashboard
          </span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {greeting}, {displayName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-xl">
            Semua alur operasional pemotretan, pelunasan DP, dan jadwal tim studio siap dikelola hari ini.
          </p>
        </div>

        {/* Quick Summary Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-md border border-white/10">
            <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
            <strong>{upcomingCount}</strong> Jadwal Minggu Ini
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-md border border-white/10">
            <span className="h-2 w-2 rounded-full bg-amber-300" />
            <strong>{unpaidCount}</strong> Piutang Menunggu Pelunasan
          </span>
        </div>

        {/* Quick Action Buttons on Hero */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/15">
          <Link
            href="/jobs/new"
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-white text-slate-900 px-3.5 py-2.5 text-xs font-bold shadow-md hover:bg-emerald-50 transition active:scale-95"
          >
            <Plus className="h-4 w-4 text-emerald-600" />
            + Buat Job Baru
          </Link>

          <Link
            href="/chat"
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-500/30 hover:bg-emerald-500/40 text-white px-3.5 py-2.5 text-xs font-bold border border-white/20 backdrop-blur-md transition active:scale-95"
          >
            <MessageSquare className="h-4 w-4 text-emerald-300" />
            KalaAI Chat
          </Link>

          <Link
            href="/jobs"
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white px-3.5 py-2.5 text-xs font-medium border border-white/10 backdrop-blur-md transition active:scale-95"
          >
            <CalendarClock className="h-4 w-4 text-cyan-300" />
            Daftar Pekerjaan
          </Link>

          <Link
            href="/expenses/new"
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white px-3.5 py-2.5 text-xs font-medium border border-white/10 backdrop-blur-md transition active:scale-95"
          >
            <Receipt className="h-4 w-4 text-amber-300" />
            + Catat Pengeluaran
          </Link>
        </div>
      </div>
    </div>
  );
}
