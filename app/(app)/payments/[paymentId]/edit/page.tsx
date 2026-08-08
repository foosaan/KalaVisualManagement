import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Wallet } from "lucide-react";

import { PaymentForm } from "@/components/payments/payment-form";
import { getPaymentFormData } from "@/lib/queries/payments";

type EditPaymentPageProps = {
  params: Promise<{
    paymentId: string;
  }>;
};

export default async function EditPaymentPage({ params }: EditPaymentPageProps) {
  const { paymentId } = await params;
  const { jobs, payment } = await getPaymentFormData(paymentId);

  if (!payment) {
    notFound();
  }

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
          <h1 className="text-xl font-bold tracking-tight">Edit Pembayaran</h1>
          <p className="text-xs text-muted-foreground">Koreksi tipe, metode, atau jumlah pembayaran.</p>
        </div>
      </div>
      <PaymentForm
        initialValues={{
          jobId: payment.job_id,
          paymentType: payment.payment_type,
          paymentMethod: payment.payment_method,
          amount: Number(payment.amount),
          paymentDate: payment.payment_date,
          notes: payment.notes ?? ""
        }}
        jobs={jobs}
        mode="edit"
        paymentId={paymentId}
      />
    </div>
  );
}
