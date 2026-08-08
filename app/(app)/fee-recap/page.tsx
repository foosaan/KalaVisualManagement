import {
  Wallet,
  Users2,
  TrendingUp,
  Search
} from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { getFeeRecapData } from "@/lib/queries/fee-recap";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const ROLE_STYLE: Record<string, { avatar: string }> = {
  fg_model: { avatar: "from-emerald-100 to-cyan-100 text-emerald-700" },
  crew: { avatar: "from-blue-100 to-indigo-100 text-blue-700" },
  editor: { avatar: "from-violet-100 to-purple-100 text-violet-700" },
  client: { avatar: "from-amber-100 to-orange-100 text-amber-700" },
  other: { avatar: "from-slate-100 to-gray-100 text-slate-600" }
};

type FeeRecapPageProps = {
  searchParams: Promise<{
    role?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function FeeRecapPage({ searchParams }: FeeRecapPageProps) {
  const { role = "all", from = "", to = "" } = await searchParams;
  const locale = await getLocale();
  const { rows, grandTotal } = await getFeeRecapData({ role, from, to });
  const maxFee = Math.max(...rows.map((r) => r.total_fee), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="gradient-icon gradient-icon-violet">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t("feeRecap.title", locale)}</h1>
          <p className="text-xs text-muted-foreground">{t("feeRecap.description", locale)}</p>
        </div>
      </div>

      {/* ── KPI Summary ── */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="glass-card glass-card-hover rounded-xl p-4 bg-gradient-to-br from-emerald-500/5 to-emerald-500/[0.02]">
          <div className="flex items-center gap-2 mb-2">
            <div className="gradient-icon gradient-icon-emerald !h-8 !w-8 !rounded-lg">
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{t("feeRecap.totalFeePaid", locale)}</p>
          </div>
          <p className="text-lg font-bold tabular-nums text-emerald-700">{formatCurrency(grandTotal)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{t("feeRecap.allContacts", locale)}</p>
        </div>

        <div className="glass-card glass-card-hover rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="gradient-icon gradient-icon-cyan !h-8 !w-8 !rounded-lg">
              <Users2 className="h-3.5 w-3.5" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{t("feeRecap.totalPeople", locale)}</p>
          </div>
          <p className="text-lg font-bold tabular-nums">{rows.length}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{t("feeRecap.uniqueContacts", locale)}</p>
        </div>

        <div className="glass-card glass-card-hover rounded-xl p-4 bg-gradient-to-br from-cyan-500/5 to-cyan-500/[0.02]">
          <div className="flex items-center gap-2 mb-2">
            <div className="gradient-icon gradient-icon-violet !h-8 !w-8 !rounded-lg">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{t("feeRecap.avgPerson", locale)}</p>
          </div>
          <p className="text-lg font-bold tabular-nums text-cyan-700">{formatCurrency(rows.length > 0 ? grandTotal / rows.length : 0)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{t("feeRecap.avgAll", locale)}</p>
        </div>
      </div>

      {/* ── Filter ── */}
      <div className="glass-card rounded-2xl p-4">
        <form className="grid gap-3 sm:grid-cols-[160px_1fr_1fr_auto]">
          <Select
            defaultValue={role}
            name="role"
            options={[
              { label: locale === "id" ? "Semua peran" : "All roles", value: "all" },
              { label: "FG / Model", value: "fg_model" },
              { label: "Crew", value: "crew" },
              { label: "Editor", value: "editor" },
              { label: locale === "id" ? "Klien" : "Client", value: "client" },
              { label: locale === "id" ? "Lainnya" : "Other", value: "other" }
            ]}
          />
          <Input defaultValue={from} name="from" placeholder={t("dateFilter.fromDate", locale)} type="date" />
          <Input defaultValue={to} name="to" placeholder={t("dateFilter.toDate", locale)} type="date" />
          <button className={buttonVariants({ variant: "outline", size: "default" })} type="submit">
            {t("jobs.filter", locale)}
          </button>
        </form>
      </div>

      {/* ── Person Cards ── */}
      {rows.length === 0 ? (
        <EmptyState
          title={t("feeRecap.noFeeData", locale)}
          description={t("feeRecap.assignFee", locale)}
        />
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => {
            const initials = row.display_name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const style = ROLE_STYLE[row.kind] || ROLE_STYLE.other;
            const barWidth = Math.max((row.total_fee / maxFee) * 100, 4);

            return (
              <div
                key={row.contact_id}
                className={cn(
                  "glass-card glass-card-hover rounded-xl px-4 py-3 animate-slide-up",
                  i < 8 ? `stagger-${i + 1}` : ""
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold",
                    style.avatar
                  )}>
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate">{row.display_name}</p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
                        {row.kind.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {row.total_jobs} pekerjaan
                      </span>
                    </div>
                    {/* Fee bar */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-border/50 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                        avg {formatCurrency(row.avg_fee)}
                      </span>
                    </div>
                  </div>

                  {/* Total fee */}
                  <p className="text-sm font-bold tabular-nums text-emerald-700 shrink-0">
                    {formatCurrency(row.total_fee)}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Grand total */}
          <div className="glass-card rounded-xl px-4 py-3 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{t("feeRecap.grandTotal", locale)}</p>
              <div className="text-right">
                <p className="text-base font-bold tabular-nums text-emerald-700">{formatCurrency(grandTotal)}</p>
                <p className="text-[10px] text-muted-foreground">{rows.reduce((sum, r) => sum + r.total_jobs, 0)} total pekerjaan</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
