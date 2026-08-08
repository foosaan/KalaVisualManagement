import { QueryData } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { assertNoError } from "@/lib/queries/helpers";
import { getJobOptions } from "@/lib/queries/reference";

export async function getPaymentsPageData() {
  const supabase = await createClient();
  const paymentsQuery = supabase
    .from("payments")
    .select(
      `
        *,
        jobs (
          id,
          title,
          currency,
          start_at
        )
      `
    )
    .order("payment_date", { ascending: false });

  type PaymentsQueryData = QueryData<typeof paymentsQuery>;

  const { data, error } = await paymentsQuery;

  assertNoError(error, "Unable to load payments");
  return (data ?? []) as PaymentsQueryData;
}

export async function getPaymentFormData(paymentId?: string) {
  const [jobs, payment] = await Promise.all([getJobOptions(), paymentId ? getPaymentById(paymentId) : null]);
  return { jobs, payment };
}

export async function getPaymentById(paymentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .single();

  assertNoError(error, "Unable to load payment");
  return data;
}
