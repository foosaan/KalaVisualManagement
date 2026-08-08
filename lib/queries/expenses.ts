import { QueryData } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { assertNoError } from "@/lib/queries/helpers";
import { getContactOptions, getJobOptions } from "@/lib/queries/reference";

export async function getExpensesPageData() {
  const supabase = await createClient();
  const expensesQuery = supabase
    .from("expenses")
    .select(
      `
        *,
        jobs (
          id,
          title,
          currency
        ),
        vendor_contact:contacts!expenses_vendor_contact_id_fkey (
          id,
          display_name,
          kind
        )
      `
    )
    .order("expense_date", { ascending: false });

  type ExpensesQueryData = QueryData<typeof expensesQuery>;

  const { data, error } = await expensesQuery;

  assertNoError(error, "Unable to load expenses");
  return (data ?? []) as ExpensesQueryData;
}

export async function getExpenseFormData(expenseId?: string) {
  const [jobs, contacts, expense] = await Promise.all([
    getJobOptions(),
    getContactOptions(),
    expenseId ? getExpenseById(expenseId) : null
  ]);

  return { jobs, contacts, expense };
}

export async function getExpenseById(expenseId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", expenseId)
    .single();

  assertNoError(error, "Unable to load expense");
  return data;
}
