import Link from "next/link";
import {
  CircleDollarSign,
  Plus,
  Search,
  Wallet
} from "lucide-react";

import { deletePaymentAction } from "@/lib/actions/payments";
import { DeleteButton } from "@/components/ui/delete-button";
import { getPaymentsPageData } from "@/lib/queries/payments";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TYPE_STYLE: Record<string, { bg: string; text: string }> = {
  dp: { bg: "bg-amber-50", text: "text-amber-700" },
  partial: { bg: "bg-cyan-50", text: "text-cyan-700" },
  final: { bg: "bg-emerald-50", text: "text-emerald-700" }
};

type PaymentsPageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
};

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const { q = "", type = "all" } = await searchParams;
  const locale = await getLocale();
  const payments = await getPaymentsPageData();
  const search = q.trim().toLowerCase();
  const filteredPayments = payments.filter((payment) => {
    const matchesType = type === "all" || payment.payment_type === type;
    const haystack = [payment.jobs?.title, payment.notes].join(" ").toLowerCase();
    const matchesSearch = search.length === 0 || haystack.includes(search);
    return matchesType && matchesSearch;
  });

  const totalAmount = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="gradient-icon gradient-icon-emerald">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("payments.title", locale)}</h1>
            <p className="text-xs text-muted-foreground">{t("payments.description", locale)}</p>
          </div>
        </div>
        <Link href="/payments/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          {t("payments.addPayment", locale)}
        </Link>
      </div>

      {/* ── Filter ── */}
      <div className="glass-card rounded-2xl p-4">
        <form className="grid gap-3 sm:grid-cols-[1fr_160px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
            <Input defaultValue={q} name="q" placeholder={t("payments.searchPlaceholder", locale)} className="pl-9" />
          </div>
          <Select
            defaultValue={type}
            name="type"
            options={[
              { label: t("payments.allTypes", locale), value: "all" },
              { label: "DP", value: "dp" },
              { label: "Partial", value: "partial" },
              { label: "Final", value: "final" }
            ]}
          />
          <button className={buttonVariants({ variant: "outline", size: "default" })} type="submit">
            {t("jobs.filter", locale)}
          </button>
        </form>
      </div>

      {/* ── Summary ── */}
      {filteredPayments.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {filteredPayments.length} pembayaran
          </p>
          <p className="text-sm font-bold text-emerald-700 tabular-nums">
            Total: {formatCurrency(totalAmount, "IDR")}
          </p>
        </div>
      )}

      {/* ── Payment Cards ── */}
      {filteredPayments.length === 0 ? (
        <EmptyState
          title={payments.length === 0 ? t("payments.noPayments", locale) : t("payments.noPaymentsMatch", locale)}
          description={
            payments.length === 0
              ? t("payments.recordDp", locale)
              : t("payments.tryDifferent", locale)
          }
          ctaHref="/payments/new"
          ctaLabel={t("payments.addPayment", locale)}
        />
      ) : (
        <div className="space-y-2">
          {filteredPayments.map((payment, i) => {
            const typeStyle = TYPE_STYLE[payment.payment_type] || TYPE_STYLE.dp;
            return (
              <div
                key={payment.id}
                className={cn(
                  "group glass-card glass-card-hover rounded-xl px-4 py-3 animate-slide-up",
                  i < 8 ? `stagger-${i + 1}` : ""
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className="gradient-icon gradient-icon-emerald !h-9 !w-9 !rounded-lg shrink-0">
                    <CircleDollarSign className="h-4 w-4" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate">{payment.jobs?.title || "—"}</p>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", typeStyle.bg, typeStyle.text)}>
                        {payment.payment_type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(payment.payment_date)} • {payment.payment_method.replace("_", " ")}
                      {payment.notes ? ` • ${payment.notes}` : ""}
                    </p>
                  </div>

                  {/* Amount */}
                  <p className="text-sm font-bold tabular-nums text-emerald-700 shrink-0">
                    {formatCurrency(payment.amount, payment.jobs?.currency || "IDR")}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Link
                      className="rounded-lg p-1.5 text-muted-foreground/40 hover:bg-muted hover:text-foreground transition-colors"
                      href={`/payments/${payment.id}/edit`}
                      title={t("jobs.edit", locale)}
                    >
                      ✏️
                    </Link>
                    <DeleteButton action={deletePaymentAction.bind(null, payment.id, payment.job_id)} entityName={t("delete.payment", locale)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
