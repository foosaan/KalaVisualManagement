import { createClient } from "@/lib/supabase/server";
import { assertNoError } from "@/lib/queries/helpers";

type FeeRecapFilters = {
  role?: string;
  from?: string;
  to?: string;
};

export type FeeRecapRow = {
  contact_id: string;
  display_name: string;
  kind: string;
  total_jobs: number;
  total_fee: number;
  avg_fee: number;
};

export async function getFeeRecapData(filters: FeeRecapFilters = {}) {
  const supabase = await createClient();

  const query = supabase
    .from("job_contacts")
    .select(
      `
        contact_id,
        fee_amount,
        role,
        job:jobs!job_contacts_job_id_fkey (
          id,
          start_at,
          status
        ),
        contact:contacts!job_contacts_contact_id_fkey (
          id,
          display_name,
          kind
        )
      `
    )
    .not("fee_amount", "is", null)
    .gt("fee_amount", 0);

  const { data, error } = await query;
  assertNoError(error, "Unable to load fee recap data");

  const rows = data ?? [];

  // Apply filters
  let filtered = rows;

  if (filters.role && filters.role !== "all") {
    filtered = filtered.filter((row) => row.role === filters.role);
  }

  if (filters.from) {
    const fromDate = new Date(filters.from).toISOString();
    filtered = filtered.filter((row) => {
      const job = row.job as { start_at: string } | null;
      return job && job.start_at >= fromDate;
    });
  }

  if (filters.to) {
    const toDate = new Date(new Date(filters.to).getTime() + 86400000).toISOString();
    filtered = filtered.filter((row) => {
      const job = row.job as { start_at: string } | null;
      return job && job.start_at < toDate;
    });
  }

  // Aggregate by contact
  const contactMap = new Map<string, FeeRecapRow>();

  for (const row of filtered) {
    const contact = row.contact as { id: string; display_name: string; kind: string } | null;
    if (!contact) continue;

    const existing = contactMap.get(contact.id);
    const feeAmount = Number(row.fee_amount ?? 0);

    if (existing) {
      existing.total_jobs += 1;
      existing.total_fee += feeAmount;
      existing.avg_fee = existing.total_fee / existing.total_jobs;
    } else {
      contactMap.set(contact.id, {
        contact_id: contact.id,
        display_name: contact.display_name,
        kind: contact.kind,
        total_jobs: 1,
        total_fee: feeAmount,
        avg_fee: feeAmount
      });
    }
  }

  // Sort by total fee descending
  const result = Array.from(contactMap.values()).sort((a, b) => b.total_fee - a.total_fee);

  const grandTotal = result.reduce((sum, row) => sum + row.total_fee, 0);

  return {
    rows: result,
    grandTotal
  };
}
