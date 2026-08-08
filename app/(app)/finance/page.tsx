import Link from "next/link";
import {
  Banknote,
  CircleDollarSign,
  Download,
  Receipt,
  TrendingUp,
  AlertTriangle,
  Wallet
} from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { FinanceDateFilter } from "@/components/finance/date-filter";
import { getFinancePageData } from "@/lib/queries/finance";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CAT_EMOJI: Record<string, string> = {
  fg_fee: "📸",
  crew_fee: "👥",
  equipment_rental: "🎥",
  transport: "🚗",
  meal: "🍽️",
  editing: "✏️",
  studio_rent: "🏠",
  other: "📋"
};

type FinancePageProps = {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
};

export default async function FinancePage({ searchParams }: FinancePageProps) {
  const { from, to } = await searchParams;
  const locale = await getLocale();
  const { rows, totals, expenseBreakdown, unpaidJobs } = await getFinancePageData({ from, to });
  const maxExpense = Math.max(...expenseBreakdown.map((e) => e.total), 1);

  const exportParams = new URLSearchParams();
  if (from) exportParams.set("from", from);
  if (to) exportParams.set("to", to);
  const exportUrl = `/api/finance/export${exportParams.toString() ? `?${exportParams.toString()}` : ""}`;

  const payPercent = totals.gross > 0 ? Math.round((totals.paid / totals.gross) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="gradient-icon gradient-icon-emerald">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("finance.title", locale)}</h1>
            <p className="text-xs text-muted-foreground">{t("finance.description", locale)}</p>
          </div>
        </div>
        <Link
          className={buttonVariants({ variant: "outline", size: "sm" })}
          href={exportUrl}
          target="_blank"
        >
          <Download className="h-3.5 w-3.5 mr-1" />
          {t("finance.exportCsv", locale)}
        </Link>
      </div>

      {/* ── Date Filter ── */}
      <div className="glass-card rounded-2xl p-4">
        <FinanceDateFilter />
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {/* Gross */}
        <div className="glass-card glass-card-hover rounded-xl p-4 bg-gradient-to-br from-emerald-500/5 to-emerald-500/[0.02]">
          <div className="flex items-center gap-2 mb-2">
            <div className="gradient-icon gradient-icon-emerald !h-8 !w-8 !rounded-lg">
              <Banknote className="h-3.5 w-3.5" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{t("finance.grossIncome", locale)}</p>
          </div>
          <p className="text-lg font-bold tabular-nums text-emerald-700">{formatCurrency(totals.gross)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{t("finance.periodTotal", locale)}</p>
        </div>

        {/* Paid */}
        <div className="glass-card glass-card-hover rounded-xl p-4 bg-gradient-to-br from-cyan-500/5 to-cyan-500/[0.02]">
          <div className="flex items-center gap-2 mb-2">
            <div className="gradient-icon gradient-icon-cyan !h-8 !w-8 !rounded-lg">
              <CircleDollarSign className="h-3.5 w-3.5" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{t("finance.paidIncome", locale)}</p>
          </div>
          <p className="text-lg font-bold tabular-nums text-cyan-700">{formatCurrency(totals.paid)}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-border/50 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", payPercent >= 100 ? "bg-emerald-500" : payPercent >= 50 ? "bg-cyan-500" : "bg-amber-500")}
                style={{ width: `${Math.min(payPercent, 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">{payPercent}%</span>
          </div>
        </div>

        {/* Expenses */}
        <div className="glass-card glass-card-hover rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="gradient-icon gradient-icon-amber !h-8 !w-8 !rounded-lg">
              <Receipt className="h-3.5 w-3.5" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{t("finance.expenses", locale)}</p>
          </div>
          <p className="text-lg font-bold tabular-nums">{formatCurrency(totals.expenses)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{t("finance.totalCosts", locale)}</p>
        </div>

        {/* Net Profit */}
        <div className={cn("glass-card glass-card-hover rounded-xl p-4 bg-gradient-to-br", totals.net >= 0 ? "from-emerald-500/5 to-emerald-500/[0.02]" : "from-red-500/5 to-red-500/[0.02]")}>
          <div className="flex items-center gap-2 mb-2">
            <div className={cn("gradient-icon !h-8 !w-8 !rounded-lg", totals.net >= 0 ? "gradient-icon-emerald" : "gradient-icon-red")}>
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{t("finance.netProfit", locale)}</p>
          </div>
          <p className={cn("text-lg font-bold tabular-nums", totals.net >= 0 ? "text-emerald-700" : "text-red-600")}>{formatCurrency(totals.net)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{t("finance.grossMinusExp", locale)}</p>
        </div>

        {/* Outstanding */}
        <div className={cn("glass-card glass-card-hover rounded-xl p-4", totals.outstanding > 0 && "bg-gradient-to-br from-amber-500/5 to-amber-500/[0.02]")}>
          <div className="flex items-center gap-2 mb-2">
            <div className="gradient-icon gradient-icon-amber !h-8 !w-8 !rounded-lg">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{t("finance.outstanding", locale)}</p>
          </div>
          <p className={cn("text-lg font-bold tabular-nums", totals.outstanding > 0 ? "text-amber-600" : "text-emerald-700")}>{formatCurrency(totals.outstanding)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{t("finance.stillUnpaid", locale)}</p>
        </div>
      </div>

      {/* ── Two Column Layout ── */}
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Per-Job Table */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="gradient-icon gradient-icon-blue !h-8 !w-8 !rounded-lg">
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-sm font-semibold">{t("finance.perJobSummary", locale)}</h3>
          </div>

          {rows.length === 0 ? (
            <EmptyState
              title={t("finance.noFinancialData", locale)}
              description={t("finance.addJobsToPopulate", locale)}
            />
          ) : (
            <div className="space-y-2">
              {rows.map((row) => (
                <Link
                  key={row.job_id}
                  href={`/jobs/${row.job_id}`}
                  className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2.5 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{row.title}</p>
                    <p className="text-[11px] text-muted-foreground">{formatDateTime(row.start_at)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold tabular-nums text-emerald-700">
                      {formatCurrency(row.net_income ?? 0, row.currency ?? "IDR")}
                    </p>
                    {Number(row.outstanding_balance ?? 0) > 0 && (
                      <p className="text-[10px] text-amber-600 font-medium tabular-nums">
                        Sisa: {formatCurrency(row.outstanding_balance ?? 0, row.currency ?? "IDR")}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Unpaid + Breakdown */}
        <div className="space-y-4">
          {/* Unpaid Jobs */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="gradient-icon gradient-icon-amber !h-8 !w-8 !rounded-lg">
                <AlertTriangle className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-semibold">{t("finance.unpaidJobs", locale)}</h3>
            </div>

            {unpaidJobs.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">✅ {t("finance.allPaid", locale)}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {unpaidJobs.map((job) => (
                  <Link
                    key={job.job_id}
                    href={`/jobs/${job.job_id}`}
                    className="flex items-center justify-between gap-3 rounded-lg bg-amber-50/50 px-3 py-2.5 hover:bg-amber-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{job.title}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{job.client_name || "—"}</p>
                    </div>
                    <p className="shrink-0 text-sm font-bold tabular-nums text-amber-600">
                      {formatCurrency(job.outstanding_balance ?? 0, job.currency ?? "IDR")}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Expense Breakdown */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="gradient-icon gradient-icon-violet !h-8 !w-8 !rounded-lg">
                <Receipt className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-semibold">{t("finance.expenseBreakdown", locale)}</h3>
            </div>

            {expenseBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">{t("finance.noExpenses", locale)}</p>
            ) : (
              <div className="space-y-3">
                {expenseBreakdown.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium capitalize flex items-center gap-1.5">
                        <span>{CAT_EMOJI[item.category] || "📋"}</span>
                        {item.category.replace("_", " ")}
                      </span>
                      <span className="tabular-nums text-muted-foreground font-medium">{formatCurrency(item.total)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-700"
                        style={{ width: `${Math.max((item.total / maxExpense) * 100, 4)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
