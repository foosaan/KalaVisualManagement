import { z } from "zod";

export const expenseSchema = z.object({
  jobId: z.string().uuid("Select a job."),
  vendorContactId: z.string().uuid().optional().nullable().or(z.literal("")),
  category: z.enum([
    "fg_fee",
    "crew_fee",
    "equipment_rental",
    "transport",
    "meal",
    "editing",
    "studio_rent",
    "other"
  ]),
  description: z.string().min(2, "Add a short description so this cost stays readable."),
  amount: z.coerce.number().positive("Expense amount must be greater than zero."),
  expenseDate: z.string().min(1, "Expense date is required."),
  notes: z.string().optional().nullable()
});

export type ExpenseValues = z.infer<typeof expenseSchema>;
