import { z } from "zod";

export const contactSchema = z.object({
  kind: z.enum(["client", "fg_model", "crew", "editor", "vendor", "other"]),
  displayName: z.string().min(2, "Contact name is required."),
  organizationName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Enter a valid email address."
    }),
  instagramHandle: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

export type ContactValues = z.infer<typeof contactSchema>;
