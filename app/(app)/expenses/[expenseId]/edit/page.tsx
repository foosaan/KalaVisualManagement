import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Receipt } from "lucide-react";

import { ExpenseForm } from "@/components/expenses/expense-form";
import { getExpenseFormData } from "@/lib/queries/expenses";

type EditExpensePageProps = {
  params: Promise<{
    expenseId: string;
  }>;
};

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const { expenseId } = await params;
  const { jobs, contacts, expense } = await getExpenseFormData(expenseId);

  if (!expense) {
    notFound();
  }

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
          <h1 className="text-xl font-bold tracking-tight">Edit Pengeluaran</h1>
          <p className="text-xs text-muted-foreground">Koreksi kategori, vendor, atau jumlah biaya.</p>
        </div>
      </div>
      <ExpenseForm
        contacts={contacts}
        expenseId={expenseId}
        initialValues={{
          jobId: expense.job_id,
          vendorContactId: expense.vendor_contact_id ?? "",
          category: expense.category,
          description: expense.description,
          amount: Number(expense.amount),
          expenseDate: expense.expense_date,
          notes: expense.notes ?? ""
        }}
        jobs={jobs}
        mode="edit"
      />
    </div>
  );
}
