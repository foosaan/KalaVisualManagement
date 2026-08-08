import { z } from "zod";

const jobContactAssignmentSchema = z.object({
  contactId: z.string().uuid("Pick a valid contact."),
  role: z.enum(["client", "fg_model", "crew", "editor", "other"]),
  isPrimary: z.boolean(),
  sendReminder: z.boolean(),
  feeAmount: z.coerce.number().min(0, "Fee cannot be negative.").optional().nullable(),
  notes: z.string().optional().nullable(),
  confirmationStatus: z.enum(["pending", "accepted", "declined", "tentative"]),
  feeStatus: z.enum(["unpaid", "paid"])
});

export const jobSchema = z
  .object({
    title: z.string().min(2, "Job title is required."),
    shootType: z.enum([
      "portrait",
      "prewedding",
      "wedding",
      "graduation",
      "brand",
      "event",
      "family",
      "other"
    ]),
    startAt: z.string().min(1, "Start date and time is required."),
    endAt: z.string().min(1, "End date and time is required."),
    location: z.string().optional().nullable(),
    totalPrice: z.coerce.number().min(0, "Total price cannot be negative."),
    currency: z.string().min(3).max(3),
    status: z.enum(["draft", "confirmed", "completed", "delivered", "cancelled"]),
    notes: z.string().optional().nullable(),
    concept: z.string().optional().nullable(),
    contactAssignments: z.array(jobContactAssignmentSchema),
    workflowStatus: z.enum(["scheduled", "shot", "editing", "ready", "delivered"]),
    deliveryDeadline: z.string().optional().nullable(),
    actualDeliveryDate: z.string().optional().nullable()
  })
  .superRefine((value, ctx) => {
    const seen = new Set<string>();

    value.contactAssignments.forEach((assignment, index) => {
      const key = `${assignment.contactId}:${assignment.role}`;
      if (seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "This contact is already assigned with the same role.",
          path: ["contactAssignments", index, "contactId"]
        });
      }
      seen.add(key);
    });

    if (new Date(value.endAt).getTime() < new Date(value.startAt).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after the shoot start.",
        path: ["endAt"]
      });
    }
  });

export type JobValues = z.infer<typeof jobSchema>;
export type JobContactAssignmentValues = z.infer<typeof jobContactAssignmentSchema>;
