"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type CalendarContact = {
  contact_id: string;
  contact: { id: string; display_name: string } | null;
  role: string;
  is_primary: boolean;
  confirmation_status: string;
  fee_status: string;
};

type CalendarJob = {
  id: string;
  title: string;
  shoot_type: string;
  start_at: string;
  end_at: string;
  location: string | null;
  status: string;
  workflow_status?: string | null;
  payment_status?: string | null;
  assignment_status?: string | null;
  job_contacts?: CalendarContact[];
};

type CalendarGridProps = {
  jobs: CalendarJob[];
  year: number;
  month: number;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SHOOT_COLORS: Record<string, string> = {
  portrait: "bg-violet-500",
  prewedding: "bg-pink-500",
  wedding: "bg-rose-500",
  graduation: "bg-amber-500",
  brand: "bg-blue-500",
  event: "bg-emerald-500",
  family: "bg-teal-500",
  other: "bg-slate-500"
};

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days: { date: Date; inMonth: boolean }[] = [];

  // Previous month padding
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, inMonth: false });
  }

  // Current month
  for (let i = 1; i <= totalDays; i++) {
    days.push({ date: new Date(year, month, i), inMonth: true });
  }

  // Next month padding
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), inMonth: false });
    }
  }

  return days;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

type ConflictInfo = {
  type: "safe" | "parallel" | "conflict" | "warning";
  label: string;
};

function analyzeJobConflicts(dayJobs: CalendarJob[]): ConflictInfo {
  if (dayJobs.length <= 1) return { type: "safe", label: "" };

  // Check for time overlaps and photographer conflicts
  let hasConflict = false;
  let hasParallel = false;
  let hasWarning = false;

  for (let i = 0; i < dayJobs.length; i++) {
    for (let j = i + 1; j < dayJobs.length; j++) {
      const a = dayJobs[i];
      const b = dayJobs[j];

      const aStart = new Date(a.start_at);
      const aEnd = new Date(a.end_at);
      const bStart = new Date(b.start_at);
      const bEnd = new Date(b.end_at);

      // Check time overlap
      if (aStart < bEnd && aEnd > bStart) {
        const aPhotographers = (a.job_contacts || [])
          .filter((jc) => jc.role === "fg_model" || jc.role === "crew")
          .map((jc) => jc.contact_id);
        const bPhotographers = (b.job_contacts || [])
          .filter((jc) => jc.role === "fg_model" || jc.role === "crew")
          .map((jc) => jc.contact_id);

        if (aPhotographers.length === 0 || bPhotographers.length === 0) {
          hasWarning = true;
        } else {
          const shared = aPhotographers.filter((id) => bPhotographers.includes(id));
          if (shared.length > 0) {
            hasConflict = true;
          } else {
            hasParallel = true;
          }
        }
      }
    }
  }

  if (hasConflict) return { type: "conflict", label: "Conflict" };
  if (hasWarning) return { type: "warning", label: "Unassigned" };
  if (hasParallel) return { type: "parallel", label: "Parallel" };
  return { type: "safe", label: "" };
}

const CONFLICT_RING: Record<string, string> = {
  safe: "",
  parallel: "ring-1 ring-inset ring-violet-400/40 bg-violet-50/5",
  conflict: "ring-2 ring-inset ring-red-400/50 bg-red-50/10",
  warning: "ring-1 ring-inset ring-amber-400/40 bg-amber-50/5"
};

const CONFLICT_BADGE_STYLES: Record<string, string> = {
  parallel: "bg-violet-100 text-violet-700 border-violet-200",
  conflict: "bg-red-100 text-red-700 border-red-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200"
};

const PAYMENT_DOT: Record<string, string> = {
  paid: "bg-emerald-400",
  partially_paid: "bg-amber-400",
  unpaid: "bg-red-400"
};

export function CalendarGrid({ jobs, year, month }: CalendarGridProps) {
  const router = useRouter();
  const today = new Date();
  const days = getMonthDays(year, month);

  const prevMonth = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
  const nextMonth = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 };

  const goToMonth = (y: number, m: number) => {
    router.push(`/calendar?year=${y}&month=${m}`);
  };

  // Group jobs by date
  const jobsByDate = new Map<string, CalendarJob[]>();
  for (const job of jobs) {
    const dateKey = new Date(job.start_at).toDateString();
    if (!jobsByDate.has(dateKey)) {
      jobsByDate.set(dateKey, []);
    }
    jobsByDate.get(dateKey)!.push(job);
  }

  return (
    <div>
      {/* Month navigation */}
      <div className="mb-5 flex items-center justify-between">
        <button
          className="rounded-full border border-border/60 bg-white px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground hover:shadow-sm"
          onClick={() => goToMonth(prevMonth.y, prevMonth.m)}
          type="button"
        >
          ← {MONTH_NAMES[prevMonth.m].slice(0, 3)}
        </button>
        <h2 className="text-lg font-bold tracking-tight">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          className="rounded-full border border-border/60 bg-white px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground hover:shadow-sm"
          onClick={() => goToMonth(nextMonth.y, nextMonth.m)}
          type="button"
        >
          {MONTH_NAMES[nextMonth.m].slice(0, 3)} →
        </button>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-3">
        {Object.entries(SHOOT_COLORS).map(([type, color]) => (
          <div className="flex items-center gap-1.5" key={type}>
            <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
            <span className="text-[11px] text-muted-foreground capitalize">{type}</span>
          </div>
        ))}
        <div className="mx-2 h-4 w-px bg-border" />
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
          <span className="text-[11px] text-muted-foreground">Parallel</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="text-[11px] text-muted-foreground">Conflict</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="text-[11px] text-muted-foreground">Warning</span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-2xl border border-border/40">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border/40 bg-muted/30">
          {DAYS.map((day) => (
            <div
              className={cn(
                "px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                (day === "Sun" || day === "Sat") && "text-muted-foreground/60"
              )}
              key={day}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dateKey = day.date.toDateString();
            const dayJobs = jobsByDate.get(dateKey) || [];
            const isToday = isSameDay(day.date, today);
            const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
            const dateStr = day.date.toISOString().slice(0, 10);
            const conflictInfo = analyzeJobConflicts(dayJobs);

            return (
              <div
                className={cn(
                  "group relative min-h-[110px] border-b border-r border-border/30 p-1.5 transition-colors hover:bg-muted/20",
                  !day.inMonth && "bg-muted/10",
                  isWeekend && day.inMonth && "bg-muted/5",
                  CONFLICT_RING[conflictInfo.type]
                )}
                key={index}
              >
                {/* Date number + conflict badge */}
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                      isToday && "bg-primary text-primary-foreground font-bold",
                      !isToday && day.inMonth && "text-foreground",
                      !day.inMonth && "text-muted-foreground/40"
                    )}
                  >
                    {day.date.getDate()}
                  </span>
                  {conflictInfo.type !== "safe" && (
                    <span className={cn("rounded-full border px-1.5 py-0.5 text-[8px] font-bold", CONFLICT_BADGE_STYLES[conflictInfo.type])}>
                      {conflictInfo.type === "conflict" ? "✕" : conflictInfo.type === "parallel" ? "⇄" : "⚠"} {conflictInfo.label}
                    </span>
                  )}
                </div>

                {/* Jobs */}
                <div className="space-y-0.5">
                  {dayJobs.slice(0, 3).map((job) => {
                    const clientName = job.job_contacts?.find(
                      (jc) => jc.role === "client" && jc.is_primary
                    )?.contact?.display_name || job.job_contacts?.find(
                      (jc) => jc.role === "client"
                    )?.contact?.display_name;

                    const photographer = job.job_contacts?.find(
                      (jc) => jc.role === "fg_model" || jc.role === "crew"
                    )?.contact?.display_name;

                    const paymentDot = PAYMENT_DOT[job.payment_status || "unpaid"] || "";

                    return (
                      <Link
                        className={cn(
                          "block rounded-md px-1.5 py-1 text-[10px] font-medium text-white truncate transition-opacity hover:opacity-80",
                          SHOOT_COLORS[job.shoot_type] || SHOOT_COLORS.other
                        )}
                        href={`/jobs/${job.id}`}
                        key={job.id}
                        title={[
                          job.title,
                          `${formatTime(job.start_at)}-${formatTime(job.end_at)}`,
                          clientName ? `Client: ${clientName}` : null,
                          photographer ? `📸 ${photographer}` : "⚠ No photographer",
                          job.assignment_status ? `Assignment: ${job.assignment_status}` : null,
                          job.payment_status ? `Payment: ${job.payment_status}` : null,
                          job.location || null
                        ].filter(Boolean).join(" • ")}
                      >
                        <span className="flex items-center gap-1">
                          <span className="opacity-70">{formatTime(job.start_at)}</span>
                          {paymentDot && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", paymentDot)} />}
                        </span>
                        <span className="block truncate">{job.title}</span>
                        {photographer && (
                          <span className="block truncate opacity-70">📸 {photographer}</span>
                        )}
                      </Link>
                    );
                  })}
                  {dayJobs.length > 3 && (
                    <p className="text-[9px] font-medium text-muted-foreground px-1">
                      +{dayJobs.length - 3} more
                    </p>
                  )}
                </div>

                {/* Quick-create on hover (only for in-month empty cells) */}
                {day.inMonth && dayJobs.length === 0 && (
                  <Link
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    href={`/jobs/new?date=${dateStr}`}
                  >
                    <span className="rounded-full bg-primary/10 p-1.5 text-primary">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
