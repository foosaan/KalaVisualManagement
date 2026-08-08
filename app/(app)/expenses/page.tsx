import Link from "next/link";
import {
  Plus,
  Receipt,
  Search
} from "lucide-react";

import { deleteExpenseAction } from "@/lib/actions/expenses";
import { DeleteButton } from "@/components/ui/delete-button";
import { getExpensesPageData } from "@/lib/queries/expenses";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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

type ExpensesPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
};

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const { q = "", category = "all" } = await searchParams;
  const locale = await getLocale();
  const expenses = await getExpensesPageData();
  const search = q.trim().toLowerCase();
  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory = category === "all" || expense.category === category;
    const haystack = [expense.jobs?.title, expense.description, expense.vendor_contact?.display_name].join(" ").toLowerCase();
    const matchesSearch = search.length === 0 || haystack.includes(search);
    return matchesCategory && matchesSearch;
  });

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="gradient-icon gradient-icon-amber">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("expenses.title", locale)}</h1>
            <p className="text-xs text-muted-foreground">{t("expenses.description", locale)}</p>
          </div>
        </div>
        <Link href="/expenses/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          {t("expenses.addExpense", locale)}
        </Link>
      </div>

      {/* ── Filter ── */}
      <div className="glass-card rounded-2xl p-4">
        <form className="grid gap-3 sm:grid-cols-[1fr_160px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
            <Input defaultValue={q} name="q" placeholder={t("expenses.searchPlaceholder", locale)} className="pl-9" />
          </div>
          <Select
            defaultValue={category}
            name="category"
            options={[
              { label: t("expenses.allCategories", locale), value: "all" },
              { label: "📸 FG Fee", value: "fg_fee" },
              { label: "👥 Crew Fee", value: "crew_fee" },
              { label: "🎥 Equipment", value: "equipment_rental" },
              { label: "🚗 Transport", value: "transport" },
              { label: "🍽️ Meal", value: "meal" },
              { label: "✏️ Editing", value: "editing" },
              { label: "🏠 Studio Rent", value: "studio_rent" },
              { label: "📋 Other", value: "other" }
            ]}
          />
          <button className={buttonVariants({ variant: "outline", size: "default" })} type="submit">
            {t("jobs.filter", locale)}
          </button>
        </form>
      </div>

      {/* ── Summary ── */}
      {filteredExpenses.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {filteredExpenses.length} pengeluaran
          </p>
          <p className="text-sm font-bold text-amber-700 tabular-nums">
            Total: {formatCurrency(totalAmount, "IDR")}
          </p>
        </div>
      )}

      {/* ── Expense Cards ── */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          title={expenses.length === 0 ? t("expenses.noExpenses", locale) : t("expenses.noExpensesMatch", locale)}
          description={
            expenses.length === 0
              ? t("expenses.recordCosts", locale)
              : t("expenses.tryDifferent", locale)
          }
          ctaHref="/expenses/new"
          ctaLabel={t("expenses.addExpense", locale)}
        />
      ) : (
        <div className="space-y-2">
          {filteredExpenses.map((expense, i) => (
            <div
              key={expense.id}
              className={cn(
                "group glass-card glass-card-hover rounded-xl px-4 py-3 animate-slide-up",
                i < 8 ? `stagger-${i + 1}` : ""
              )}
            >
              <div className="flex items-center gap-3">
                {/* Emoji icon */}
                <span className="text-xl shrink-0">
                  {CAT_EMOJI[expense.category] || "📋"}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold truncate">{expense.jobs?.title || "—"}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
                      {expense.category.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(expense.expense_date)}
                    {expense.vendor_contact?.display_name ? ` • ${expense.vendor_contact.display_name}` : ""}
                    {expense.description ? ` • ${expense.description}` : ""}
                  </p>
                </div>

                {/* Amount */}
                <p className="text-sm font-bold tabular-nums text-amber-700 shrink-0">
                  {formatCurrency(expense.amount, expense.jobs?.currency || "IDR")}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Link
                    className="rounded-lg p-1.5 text-muted-foreground/40 hover:bg-muted hover:text-foreground transition-colors"
                    href={`/expenses/${expense.id}/edit`}
                    title={t("jobs.edit", locale)}
                  >
                    ✏️
                  </Link>
                  <DeleteButton action={deleteExpenseAction.bind(null, expense.id, expense.job_id)} entityName={t("delete.expense", locale)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
