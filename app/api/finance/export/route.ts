import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const { data: rows, error } = await supabase
    .from("job_financials")
    .select("*")
    .order("start_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let filtered = rows ?? [];

  if (from) {
    const fromDate = new Date(from).toISOString();
    filtered = filtered.filter((row) => row.start_at && row.start_at >= fromDate);
  }

  if (to) {
    const toDate = new Date(new Date(to).getTime() + 86400000).toISOString();
    filtered = filtered.filter((row) => row.start_at && row.start_at < toDate);
  }

  // Build CSV
  const headers = [
    "Job Title",
    "Client",
    "Shoot Type",
    "Date",
    "Location",
    "Status",
    "Gross Income",
    "Expenses",
    "Net Income",
    "Paid",
    "Outstanding",
    "Payment Status"
  ];

  const csvRows = filtered.map((row) => [
    escapeCsv(row.title ?? ""),
    escapeCsv(row.client_name ?? ""),
    escapeCsv(row.shoot_type ?? ""),
    row.start_at ? new Date(row.start_at).toLocaleDateString("id-ID") : "",
    escapeCsv(row.location ?? ""),
    row.status ?? "",
    Number(row.gross_income ?? 0).toString(),
    Number(row.total_expenses ?? 0).toString(),
    Number(row.net_income ?? 0).toString(),
    Number(row.paid_income ?? 0).toString(),
    Number(row.outstanding_balance ?? 0).toString(),
    row.payment_status ?? ""
  ]);

  const csv = [
    headers.join(","),
    ...csvRows.map((row) => row.join(","))
  ].join("\n");

  const dateLabel = from && to ? `_${from}_to_${to}` : from ? `_from_${from}` : to ? `_to_${to}` : "";
  const filename = `kalavisual_finance${dateLabel}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
