import { z } from "zod";

export const settingsSchema = z.object({
  fullName: z.string().min(2, "Enter your name."),
  businessName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  timezone: z.string().min(2, "Timezone is required.")
});

export type SettingsValues = z.infer<typeof settingsSchema>;
