"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { createExpenseAction, updateExpenseAction } from "@/lib/actions/expenses";
import { EXPENSE_CATEGORY_OPTIONS } from "@/lib/constants";
import { expenseSchema, type ExpenseValues } from "@/lib/validation/expenses";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { ExpenseOcrModal } from "@/components/expenses/expense-ocr-modal";
import type { ParsedReceiptData } from "@/lib/actions/ai-expense-ocr";
import { Sparkles, Camera } from "lucide-react";

type JobOption = {
  id: string;
  title: string;
  start_at: string;
  currency: string;
  status: string;
};

type ContactOption = {
  id: string;
  display_name: string;
  kind: string;
  phone: string | null;
};

type ExpenseFormProps = {
  mode: "create" | "edit";
  expenseId?: string;
  jobs: JobOption[];
  contacts: ContactOption[];
  initialValues?: Partial<ExpenseValues>;
};

export function ExpenseForm({
  mode,
  expenseId,
  jobs,
  contacts,
  initialValues
}: ExpenseFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [showOcrModal, setShowOcrModal] = useState(false);

  const form = useForm<ExpenseValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      jobId: initialValues?.jobId ?? jobs[0]?.id ?? "",
      vendorContactId: initialValues?.vendorContactId ?? "",
      category: initialValues?.category ?? "fg_fee",
      description: initialValues?.description ?? "",
      amount: initialValues?.amount ?? 0,
      expenseDate: initialValues?.expenseDate ?? new Date().toISOString().slice(0, 10),
      notes: initialValues?.notes ?? ""
    }
  });

  const handleApplyOcrData = (data: ParsedReceiptData) => {
    form.setValue("amount", data.amount, { shouldDirty: true, shouldValidate: true });
    form.setValue("category", data.category, { shouldDirty: true, shouldValidate: true });
    form.setValue("description", data.description, { shouldDirty: true, shouldValidate: true });
    form.setValue("expenseDate", data.expenseDate, { shouldDirty: true, shouldValidate: true });
    if (data.suggestedJobId) {
      form.setValue("jobId", data.suggestedJobId, { shouldDirty: true, shouldValidate: true });
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createExpenseAction(values)
          : await updateExpenseAction(expenseId!, values);

      if (!result.success) {
        setFormError(result.message || "Unable to save expense.");
        return;
      }

      router.push("/expenses");
      router.refresh();
    });
  });

  return (
    <>
      <ExpenseOcrModal
        isOpen={showOcrModal}
        onClose={() => setShowOcrModal(false)}
        onApply={handleApplyOcrData}
      />

      <div className="space-y-4">
        {/* Quick OCR Banner */}
        {mode === "create" && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent p-4 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  Scan Nota / Struk Pengeluaran
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                    AI Vision OCR
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Foto struk makan, bensin, atau nota sewa studio/lensa untuk mengisi nominal & kategori secara otomatis.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setShowOcrModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm shrink-0 flex items-center gap-1.5 w-full sm:w-auto"
            >
              <Sparkles className="h-4 w-4" />
              Scan Nota Sekarang
            </Button>
          </div>
        )}

        <Card>
          <CardContent className="p-6">
            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField label="Job" htmlFor="jobId" error={form.formState.errors.jobId?.message}>
                  <Select
                    id="jobId"
                    options={jobs.map((job) => ({ value: job.id, label: job.title }))}
                    {...form.register("jobId")}
                  />
                </FormField>
                <FormField
                  label="Kategori Pengeluaran"
                  htmlFor="category"
                  error={form.formState.errors.category?.message}
                >
                  <Select
                    id="category"
                    options={EXPENSE_CATEGORY_OPTIONS.map((option) => ({ ...option }))}
                    {...form.register("category")}
                  />
                </FormField>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <FormField
                  label="Deskripsi"
                  htmlFor="description"
                  error={form.formState.errors.description?.message}
                  className="md:col-span-3"
                >
                  <Input
                    id="description"
                    placeholder="Contoh: Makan siang nasi padang kru 3 orang"
                    {...form.register("description")}
                  />
                </FormField>
                <FormField label="Nominal (Rp)" htmlFor="amount" error={form.formState.errors.amount?.message}>
                  <Input
                    id="amount"
                    min="0"
                    step="1000"
                    type="number"
                    {...form.register("amount", { valueAsNumber: true })}
                  />
                </FormField>
                <FormField
                  label="Tanggal Pengeluaran"
                  htmlFor="expenseDate"
                  error={form.formState.errors.expenseDate?.message}
                >
                  <Input id="expenseDate" type="date" {...form.register("expenseDate")} />
                </FormField>
                <FormField
                  label="Vendor / Kontak"
                  htmlFor="vendorContactId"
                  error={form.formState.errors.vendorContactId?.message as string | undefined}
                >
                  <Select
                    id="vendorContactId"
                    options={contacts.map((contact) => ({
                      value: contact.id,
                      label: `${contact.display_name} • ${contact.kind}`
                    }))}
                    placeholder="Opsional"
                    {...form.register("vendorContactId")}
                  />
                </FormField>
              </div>

              <FormField label="Catatan Tambahan" htmlFor="notes" error={form.formState.errors.notes?.message}>
                <Textarea id="notes" placeholder="Catatan pengeluaran..." {...form.register("notes")} />
              </FormField>

              {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

              <div className="flex flex-wrap gap-3">
                <Button disabled={pending} type="submit">
                  {pending ? "Menyimpan..." : mode === "create" ? "Simpan Pengeluaran" : "Simpan Perubahan"}
                </Button>
                <Button onClick={() => router.back()} type="button" variant="outline">
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
