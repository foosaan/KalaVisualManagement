"use server";

import { createClient } from "@/lib/supabase/server";
import { expenseSchema, type ExpenseValues } from "@/lib/validation/expenses";
import {
  ActionResult,
  actionErrorResult,
  actionValidationError,
  cleanText,
  revalidateJobSurfaces
} from "@/lib/actions/shared";

export async function createExpenseAction(
  values: ExpenseValues
): Promise<ActionResult<{ id: string }>> {
  const parsed = expenseSchema.safeParse(values);
  if (!parsed.success) {
    return actionValidationError(parsed.error);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        job_id: parsed.data.jobId,
        vendor_contact_id: cleanText(parsed.data.vendorContactId) || null,
        category: parsed.data.category,
        description: parsed.data.description,
        amount: parsed.data.amount,
        expense_date: parsed.data.expenseDate,
        notes: cleanText(parsed.data.notes)
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    revalidateJobSurfaces(parsed.data.jobId);
    return { success: true, data: { id: data.id } };
  } catch (error) {
    return actionErrorResult(error);
  }
}

export async function updateExpenseAction(
  expenseId: string,
  values: ExpenseValues
): Promise<ActionResult<{ id: string }>> {
  const parsed = expenseSchema.safeParse(values);
  if (!parsed.success) {
    return actionValidationError(parsed.error);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("expenses")
      .update({
        job_id: parsed.data.jobId,
        vendor_contact_id: cleanText(parsed.data.vendorContactId) || null,
        category: parsed.data.category,
        description: parsed.data.description,
        amount: parsed.data.amount,
        expense_date: parsed.data.expenseDate,
        notes: cleanText(parsed.data.notes)
      })
      .eq("id", expenseId);

    if (error) {
      throw error;
    }

    revalidateJobSurfaces(parsed.data.jobId);
    return { success: true, data: { id: expenseId } };
  } catch (error) {
    return actionErrorResult(error);
  }
}

export async function deleteExpenseAction(expenseId: string, jobId: string) {
  const supabase = await createClient();
  await supabase.from("expenses").delete().eq("id", expenseId);
  revalidateJobSurfaces(jobId);
}
