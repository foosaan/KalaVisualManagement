"use server";

import { createClient } from "@/lib/supabase/server";
import { paymentSchema, type PaymentValues } from "@/lib/validation/payments";
import {
  ActionResult,
  actionErrorResult,
  actionValidationError,
  cleanText,
  revalidateJobSurfaces
} from "@/lib/actions/shared";

export async function createPaymentAction(
  values: PaymentValues
): Promise<ActionResult<{ id: string }>> {
  const parsed = paymentSchema.safeParse(values);
  if (!parsed.success) {
    return actionValidationError(parsed.error);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("payments")
      .insert({
        job_id: parsed.data.jobId,
        payment_type: parsed.data.paymentType,
        payment_method: parsed.data.paymentMethod,
        amount: parsed.data.amount,
        payment_date: parsed.data.paymentDate,
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

export async function updatePaymentAction(
  paymentId: string,
  values: PaymentValues
): Promise<ActionResult<{ id: string }>> {
  const parsed = paymentSchema.safeParse(values);
  if (!parsed.success) {
    return actionValidationError(parsed.error);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("payments")
      .update({
        job_id: parsed.data.jobId,
        payment_type: parsed.data.paymentType,
        payment_method: parsed.data.paymentMethod,
        amount: parsed.data.amount,
        payment_date: parsed.data.paymentDate,
        notes: cleanText(parsed.data.notes)
      })
      .eq("id", paymentId);

    if (error) {
      throw error;
    }

    revalidateJobSurfaces(parsed.data.jobId);
    return { success: true, data: { id: paymentId } };
  } catch (error) {
    return actionErrorResult(error);
  }
}

export async function deletePaymentAction(paymentId: string, jobId: string) {
  const supabase = await createClient();
  await supabase.from("payments").delete().eq("id", paymentId);
  revalidateJobSurfaces(jobId);
}
