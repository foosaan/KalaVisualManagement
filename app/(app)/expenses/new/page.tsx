import Link from "next/link";
import { ArrowLeft, Receipt } from "lucide-react";

import { ExpenseForm } from "@/components/expenses/expense-form";
import { EmptyState } from "@/components/ui/empty-state";
import { getExpenseFormData } from "@/lib/queries/expenses";

type NewExpensePageProps = {
  searchParams: Promise<{
    jobId?: string;
  }>;
};

export default async function NewExpensePage({ searchParams }: NewExpensePageProps) {
  const { jobId } = await searchParams;
  const { jobs, contacts } = await getExpenseFormData();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/expenses"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="gradient-icon gradient-icon-amber">
          <Receipt className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Catat Pengeluaran</h1>
          <p className="text-xs text-muted-foreground">Tambahkan biaya langsung agar gross dan net profit akurat.</p>
        </div>
      </div>
      {jobs.length === 0 ? (
        <EmptyState
          title="Buat pekerjaan terlebih dahulu"
          description="Pengeluaran perlu konteks pekerjaan agar profit bisa dihitung dengan benar."
          ctaHref="/jobs/new"
          ctaLabel="Buat Pekerjaan"
        />
      ) : (
        <ExpenseForm
          contacts={contacts}
          jobs={jobs}
          mode="create"
          initialValues={{ jobId: jobId || jobs[0]?.id }}
        />
      )}
    </div>
  );
}
