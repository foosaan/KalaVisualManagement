"use client";

import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

type Payment = {
  id: string;
  payment_type: string;
  payment_method: string;
  amount: string | number;
  payment_date: string;
  notes: string | null;
};

type JobContact = {
  id: string;
  role: string;
  is_primary: boolean;
  contact: {
    display_name: string;
    phone: string | null;
    email: string | null;
    organization_name: string | null;
  } | null;
};

type InvoiceDocumentProps = {
  job: {
    id: string;
    title: string;
    shoot_type: string;
    start_at: string;
    end_at: string;
    location: string | null;
    status: string;
    currency: string;
    total_price: string | number;
    concept: string | null;
    notes: string | null;
    created_at: string;
    job_contacts?: JobContact[];
    payments?: Payment[];
  };
  profile: {
    fullName: string | null;
    businessName: string | null;
    phone: string | null;
  };
  financial: {
    paid: number;
    outstanding: number;
  };
};

function generateInvoiceNumber(jobId: string, createdAt: string) {
  const date = new Date(createdAt);
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const shortId = jobId.slice(0, 6).toUpperCase();
  return `INV-${dateStr}-${shortId}`;
}

export function InvoiceDocument({ job, profile, financial }: InvoiceDocumentProps) {
  const clientContact = job.job_contacts?.find(
    (jc) => jc.role === "client" && jc.is_primary
  ) || job.job_contacts?.find((jc) => jc.role === "client");

  const invoiceNumber = generateInvoiceNumber(job.id, job.created_at);
  const invoiceDate = formatDate(new Date().toISOString());
  const totalPrice = Number(job.total_price);
  const payments = job.payments ?? [];

  return (
    <div className="invoice-document mx-auto max-w-[800px] bg-white text-gray-900">
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-gray-900 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {profile.businessName || profile.fullName || "KalaVisual"}
          </h1>
          {profile.businessName && profile.fullName && (
            <p className="mt-1 text-sm text-gray-600">{profile.fullName}</p>
          )}
          {profile.phone && (
            <p className="text-sm text-gray-600">{profile.phone}</p>
          )}
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-emerald-600">
            Invoice
          </h2>
          <p className="mt-1 text-sm text-gray-600">{invoiceNumber}</p>
        </div>
      </div>

      {/* Invoice meta + Client info */}
      <div className="mt-6 grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Bill To
          </h3>
          <div className="mt-2">
            <p className="text-base font-semibold">
              {clientContact?.contact?.display_name || "Client Name"}
            </p>
            {clientContact?.contact?.organization_name && (
              <p className="text-sm text-gray-600">
                {clientContact.contact.organization_name}
              </p>
            )}
            {clientContact?.contact?.phone && (
              <p className="text-sm text-gray-600">
                {clientContact.contact.phone}
              </p>
            )}
            {clientContact?.contact?.email && (
              <p className="text-sm text-gray-600">
                {clientContact.contact.email}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="space-y-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Invoice Date
              </p>
              <p className="text-sm">{invoiceDate}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Shoot Date
              </p>
              <p className="text-sm">{formatDateTime(job.start_at)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </p>
              <p className="text-sm font-medium capitalize">
                <span
                  className={
                    financial.outstanding <= 0
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }
                >
                  {financial.outstanding <= 0 ? "Paid" : "Outstanding"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items table */}
      <div className="mt-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Description
              </th>
              <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-4">
                <p className="font-semibold">{job.title}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {job.shoot_type.replace("_", " ")} photography
                  {job.location ? ` • ${job.location}` : ""}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDateTime(job.start_at)} – {formatDateTime(job.end_at)}
                </p>
                {job.concept && (
                  <p className="mt-1 text-sm text-gray-500">
                    Concept: {job.concept}
                  </p>
                )}
              </td>
              <td className="py-4 text-right">
                <p className="font-semibold tabular-nums">
                  {formatCurrency(totalPrice, job.currency)}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-4 flex justify-end">
        <div className="w-72 space-y-2">
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="text-sm font-medium tabular-nums">
              {formatCurrency(totalPrice, job.currency)}
            </span>
          </div>

          {/* Payment history */}
          {payments.length > 0 && (
            <>
              {payments.map((payment) => (
                <div
                  className="flex justify-between text-sm"
                  key={payment.id}
                >
                  <span className="text-gray-600">
                    {payment.payment_type.toUpperCase()} ({formatDate(payment.payment_date)})
                  </span>
                  <span className="tabular-nums text-emerald-600">
                    -{formatCurrency(payment.amount, job.currency)}
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2" />
            </>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Paid</span>
            <span className="font-medium tabular-nums text-emerald-600">
              {formatCurrency(financial.paid, job.currency)}
            </span>
          </div>

          <div className="flex justify-between rounded-lg bg-gray-50 px-3 py-3">
            <span className="font-semibold">Amount Due</span>
            <span className="text-lg font-bold tabular-nums">
              {formatCurrency(
                financial.outstanding > 0 ? financial.outstanding : 0,
                job.currency
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 border-t border-gray-200 pt-6">
        <p className="text-center text-sm text-gray-500">
          Thank you for choosing{" "}
          <strong>{profile.businessName || profile.fullName || "KalaVisual"}</strong>
          {" "}for your photography needs.
        </p>
        {profile.phone && (
          <p className="mt-1 text-center text-xs text-gray-400">
            Contact: {profile.phone}
          </p>
        )}
      </div>

      {/* Print button (hidden when printing) */}
      <div className="mt-8 flex justify-center gap-3 print:hidden">
        <button
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          onClick={() => window.print()}
          type="button"
        >
          🖨️ Print / Save as PDF
        </button>
        <button
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          onClick={() => window.history.back()}
          type="button"
        >
          ← Back to Job
        </button>
      </div>
    </div>
  );
}
