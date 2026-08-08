"use client";

import Link from "next/link";

import { type Locale, t } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type UnpaidJob = {
  job_id: string | null;
  title: string | null;
  client_name: string | null;
  payment_status: string | null;
  outstanding_balance: string | number | null;
  gross_income: string | number | null;
  paid_income: string | number | null;
  currency: string | null;
};

type UnpaidProgressCardProps = {
  jobs: UnpaidJob[];
  locale: Locale;
};

function getProgressColor(percent: number): string {
  if (percent >= 75) return "bg-emerald-400";
  if (percent >= 50) return "bg-cyan-400";
  if (percent >= 25) return "bg-amber-400";
  return "bg-red-400";
}

function getProgressTrackColor(percent: number): string {
  if (percent >= 75) return "bg-emerald-100";
  if (percent >= 50) return "bg-cyan-100";
  if (percent >= 25) return "bg-amber-100";
  return "bg-red-100";
}

export function UnpaidProgressCard({ jobs, locale }: UnpaidProgressCardProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 px-6 py-8 text-center">
        <div>
          <p className="text-2xl">🎉</p>
          <p className="mt-2 text-sm font-semibold text-emerald-700">
            {t("dashboard.allPaid", locale)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job, i) => {
        const total = Number(job.gross_income ?? 0);
        const paid = Number(job.paid_income ?? 0);
        const outstanding = Number(job.outstanding_balance ?? 0);
        const percent = total > 0 ? Math.round((paid / total) * 100) : 0;

        return (
          <Link
            key={job.job_id || i}
            href={`/jobs/${job.job_id || ''}`}
            className={`group block glass-card glass-card-hover rounded-xl p-4 animate-slide-up stagger-${i + 1}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold group-hover:text-amber-600 transition-colors">
                  {job.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {job.client_name || t("dashboard.noClient", locale)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold tabular-nums text-amber-600">
                  {formatCurrency(outstanding, job.currency || "IDR")}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {t("dashboard.paidOf", locale)} {formatCurrency(total, job.currency || "IDR")}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 flex items-center gap-2.5">
              <div className={cn("h-2 flex-1 overflow-hidden rounded-full", getProgressTrackColor(percent))}>
                <div
                  className={cn("h-full rounded-full transition-all duration-700", getProgressColor(percent))}
                  style={{ width: `${percent}%`, ["--progress" as string]: `${percent}%` }}
                />
              </div>
              <span className="text-[11px] font-bold tabular-nums text-muted-foreground">
                {percent}%
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
