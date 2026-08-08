import { createClient } from "@/lib/supabase/server";
import { assertNoError } from "@/lib/queries/helpers";

type FinanceFilters = {
  from?: string;
  to?: string;
};

export async function getFinancePageData(filters: FinanceFilters = {}) {
  const supabase = await createClient();
  const now = new Date();

  // Default to current month if no filters provided
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  const fromDate = filters.from
    ? new Date(filters.from).toISOString()
    : defaultFrom;
  const toDate = filters.to
    ? new Date(new Date(filters.to).getTime() + 86400000).toISOString() // +1 day to include end date
    : defaultTo;

  const isAllTime = !filters.from && !filters.to && filters.from === "" && filters.to === "";

  const [{ data: financialRows, error: financialError }, { data: expenseRows, error: expenseError }] =
    await Promise.all([
      supabase.from("job_financials").select("*").order("start_at", { ascending: false }),
      supabase.from("expenses").select("category, amount, expense_date")
    ]);

  assertNoError(financialError, "Unable to load finance rows");
  assertNoError(expenseError, "Unable to load expense breakdown");

  // Filter rows by date range (unless "all time" — no from/to params at all)
  const filteredRows = (financialRows ?? []).filter((row) => {
    if (!row.start_at) return false;
    if (isAllTime) return true;
    return row.start_at >= fromDate && row.start_at < toDate;
  });

  const filteredExpenses = (expenseRows ?? []).filter((row) => {
    if (isAllTime) return true;
    if (!row.expense_date) return false;
    const expDate = new Date(row.expense_date).toISOString();
    return expDate >= fromDate && expDate < toDate;
  });

  const expenseBreakdown = filteredExpenses.reduce<Record<string, number>>((acc, row) => {
    acc[row.category] = (acc[row.category] ?? 0) + Number(row.amount);
    return acc;
  }, {});

  const totals = filteredRows.reduce(
    (acc, row) => {
      acc.gross += Number(row.gross_income ?? 0);
      acc.paid += Number(row.paid_income ?? 0);
      acc.expenses += Number(row.total_expenses ?? 0);
      acc.net += Number(row.net_income ?? 0);
      acc.outstanding += Number(row.outstanding_balance ?? 0);
      return acc;
    },
    { gross: 0, paid: 0, expenses: 0, net: 0, outstanding: 0 }
  );

  const unpaidJobs = (financialRows ?? []).filter(
    (row) => Number(row.outstanding_balance ?? 0) > 0
  );

  return {
    rows: filteredRows,
    totals,
    unpaidJobs,
    expenseBreakdown: Object.entries(expenseBreakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([category, total]) => ({ category, total }))
  };
}
