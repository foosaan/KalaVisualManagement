"use client";

import Link from "next/link";
import { MessageCircle, CheckCircle2, AlertCircle } from "lucide-react";

import { type Locale, t } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type UnpaidJob = {
  job_id: string | null;
  title: string | null;
  client_name: string | null;
  client_phone?: string | null;
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
  if (percent >= 75) return "bg-emerald-500";
  if (percent >= 50) return "bg-cyan-500";
  if (percent >= 25) return "bg-amber-500";
  return "bg-rose-500";
}

export function UnpaidProgressCard({ jobs, locale }: UnpaidProgressCardProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-500/30 bg-emerald-500/10 px-6 py-12 text-center space-y-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
          <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
        </div>
        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
          {t("dashboard.allPaid", locale)}
        </p>
        <p className="text-xs text-muted-foreground">Semua tagihan dan pelunasan job telah lunas 100%.</p>
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
        const clientName = job.client_name || t("dashboard.noClient", locale);

        const waText = `Halo Kak ${clientName} 🎓✨

Mengingatkan untuk rincian pelunasan photoshoot bersama *Po.Graduation*:
📌 *Job:* ${job.title || "Graduation Photoshoot"}
💳 *Total Paket:* ${formatCurrency(total)}
✅ *DP Diterima:* ${formatCurrency(paid)}
⚠️ *Sisa Pelunasan:* *${formatCurrency(outstanding)}*

Pelunasan dapat ditransfer melalui:
🏦 *BRI: 6927 0100 3058 501*
a/n *Fauzan Alfikri*

Jika sudah melakukan transfer, mohon kirimkan bukti pembayarannya ya Kak. Terima kasih banyak! 🙏✨
_Po.Graduation Photography_`;

        const waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`;

        return (
          <div
            key={job.job_id || i}
            className="group glass-card rounded-2xl p-4 shadow-sm border border-border/80 hover:border-amber-500/40 transition-all space-y-3 animate-slide-up"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/jobs/${job.job_id || ""}`}
                  className="truncate text-sm font-bold text-foreground group-hover:text-amber-600 transition-colors block"
                >
                  {job.title}
                </Link>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  👤 {clientName}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-bold tabular-nums text-amber-700 dark:text-amber-400">
                  {formatCurrency(outstanding, job.currency || "IDR")}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  DP Masuk: {formatCurrency(paid, job.currency || "IDR")}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                <span>Status Pembayaran</span>
                <span>{percent}% Terbayar</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", getProgressColor(percent))}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/20 px-3 py-1.5 text-xs font-semibold transition"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Tagih Pelunasan WA
              </a>

              <Link
                href={`/jobs/${job.job_id || ""}`}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Lihat Detail →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
