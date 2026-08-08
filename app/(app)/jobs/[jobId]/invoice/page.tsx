import { notFound } from "next/navigation";

import { InvoiceDocument } from "@/components/invoice/invoice-document";
import { requireUser } from "@/lib/auth";
import { getJobById } from "@/lib/queries/jobs";

type InvoicePageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { jobId } = await params;
  const { supabase, user } = await requireUser();

  const [data, { data: profile }] = await Promise.all([
    getJobById(jobId),
    supabase
      .from("profiles")
      .select("full_name, business_name, phone")
      .eq("id", user.id)
      .maybeSingle()
  ]);

  if (!data.job) {
    notFound();
  }

  const { job, financial } = data;
  const paid = Number(financial?.paid_income ?? 0);
  const gross = Number(financial?.gross_income ?? job.total_price);
  const outstanding = gross - paid;

  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @media print {
          /* Hide everything except the invoice */
          .app-sidebar,
          .app-layout > div:first-child,
          .sticky,
          nav,
          header {
            display: none !important;
          }
          .app-main {
            margin-left: 0 !important;
            padding: 0 !important;
          }
          .app-layout {
            min-height: auto;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .invoice-document {
            max-width: 100% !important;
            padding: 2rem;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            margin: 1.5cm;
            size: A4;
          }
        }
      `}</style>
      <div className="animate-fade-in py-4 lg:py-8">
        <InvoiceDocument
          job={job}
          profile={{
            fullName: profile?.full_name ?? user.user_metadata.full_name ?? null,
            businessName: profile?.business_name ?? user.user_metadata.business_name ?? null,
            phone: profile?.phone ?? null
          }}
          financial={{
            paid,
            outstanding
          }}
        />
      </div>
    </>
  );
}
