import { z } from "zod";

export const paymentSchema = z.object({
  jobId: z.string().uuid("Select a job."),
  paymentType: z.enum(["dp", "partial", "final"]),
  paymentMethod: z.enum(["cash", "bank_transfer", "ewallet", "credit_card", "other"]),
  amount: z.coerce.number().positive("Payment amount must be greater than zero."),
  paymentDate: z.string().min(1, "Payment date is required."),
  notes: z.string().optional().nullable()
});

export type PaymentValues = z.infer<typeof paymentSchema>;
