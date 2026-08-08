"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { cleanText, ActionResult, actionErrorResult, actionValidationError } from "@/lib/actions/shared";
import { settingsSchema, type SettingsValues } from "@/lib/validation/settings";

export async function updateSettingsAction(
  values: SettingsValues
): Promise<ActionResult<{ updated: true }>> {
  const parsed = settingsSchema.safeParse(values);
  if (!parsed.success) {
    return actionValidationError(parsed.error);
  }

  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("You must be signed in.");
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: parsed.data.fullName,
      business_name: cleanText(parsed.data.businessName),
      phone: cleanText(parsed.data.phone),
      timezone: parsed.data.timezone
    });

    if (error) {
      throw error;
    }

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true, data: { updated: true } };
  } catch (error) {
    return actionErrorResult(error);
  }
}
