"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { createPaymentAction, updatePaymentAction } from "@/lib/actions/payments";
import { PAYMENT_METHOD_OPTIONS, PAYMENT_TYPE_OPTIONS } from "@/lib/constants";
import { paymentSchema, type PaymentValues } from "@/lib/validation/payments";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type JobOption = {
  id: string;
  title: string;
  start_at: string;
  currency: string;
  status: string;
};

type PaymentFormProps = {
  mode: "create" | "edit";
  paymentId?: string;
  jobs: JobOption[];
  initialValues?: Partial<PaymentValues>;
};

export function PaymentForm({ mode, paymentId, jobs, initialValues }: PaymentFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      jobId: initialValues?.jobId ?? jobs[0]?.id ?? "",
      paymentType: initialValues?.paymentType ?? "dp",
      paymentMethod: initialValues?.paymentMethod ?? "bank_transfer",
      amount: initialValues?.amount ?? 0,
      paymentDate: initialValues?.paymentDate ?? new Date().toISOString().slice(0, 10),
      notes: initialValues?.notes ?? ""
    }
  });

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createPaymentAction(values)
          : await updatePaymentAction(paymentId!, values);

      if (!result.success) {
        setFormError(result.message || "Unable to save payment.");
        return;
      }

      router.push("/payments");
      router.refresh();
    });
  });

  return (
    <Card>
      <CardContent className="p-6">
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <FormField label="Job" htmlFor="jobId" error={form.formState.errors.jobId?.message}>
              <Select
                id="jobId"
                options={jobs.map((job) => ({
                  value: job.id,
                  label: job.title
                }))}
                {...form.register("jobId")}
              />
            </FormField>
            <FormField
              label="Payment type"
              htmlFor="paymentType"
              error={form.formState.errors.paymentType?.message}
            >
              <Select
                id="paymentType"
                options={PAYMENT_TYPE_OPTIONS.map((option) => ({ ...option }))}
                {...form.register("paymentType")}
              />
            </FormField>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <FormField label="Amount" htmlFor="amount" error={form.formState.errors.amount?.message}>
              <Input
                id="amount"
                min="0"
                step="1000"
                type="number"
                {...form.register("amount", { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              label="Method"
              htmlFor="paymentMethod"
              error={form.formState.errors.paymentMethod?.message}
            >
              <Select
                id="paymentMethod"
                options={PAYMENT_METHOD_OPTIONS.map((option) => ({ ...option }))}
                {...form.register("paymentMethod")}
              />
            </FormField>
            <FormField
              label="Payment date"
              htmlFor="paymentDate"
              error={form.formState.errors.paymentDate?.message}
            >
              <Input id="paymentDate" type="date" {...form.register("paymentDate")} />
            </FormField>
          </div>

          <FormField label="Notes" htmlFor="notes" error={form.formState.errors.notes?.message}>
            <Textarea id="notes" {...form.register("notes")} />
          </FormField>

          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

          <div className="flex flex-wrap gap-3">
            <Button disabled={pending} type="submit">
              {pending ? "Saving..." : mode === "create" ? "Create payment" : "Save payment"}
            </Button>
            <Button onClick={() => router.back()} type="button" variant="outline">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
