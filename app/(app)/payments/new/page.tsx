import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";

import { PaymentForm } from "@/components/payments/payment-form";
import { EmptyState } from "@/components/ui/empty-state";
import { getPaymentFormData } from "@/lib/queries/payments";

type NewPaymentPageProps = {
  searchParams: Promise<{
    jobId?: string;
  }>;
};

export default async function NewPaymentPage({ searchParams }: NewPaymentPageProps) {
  const { jobId } = await searchParams;
  const { jobs } = await getPaymentFormData();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/payments"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="gradient-icon gradient-icon-emerald">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Catat Pembayaran</h1>
          <p className="text-xs text-muted-foreground">Tambahkan DP atau pelunasan untuk pekerjaan klien.</p>
        </div>
      </div>
      {jobs.length === 0 ? (
        <EmptyState
          title="Buat pekerjaan terlebih dahulu"
          description="Pembayaran harus terkait dengan pekerjaan agar saldo dan laporan keuangan akurat."
          ctaHref="/jobs/new"
          ctaLabel="Buat Pekerjaan"
        />
      ) : (
        <PaymentForm jobs={jobs} mode="create" initialValues={{ jobId: jobId || jobs[0]?.id }} />
      )}
    </div>
  );
}
