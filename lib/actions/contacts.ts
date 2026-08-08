"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { contactSchema, type ContactValues } from "@/lib/validation/contacts";
import {
  ActionResult,
  actionErrorResult,
  actionValidationError,
  cleanText
} from "@/lib/actions/shared";

export async function createContactAction(
  values: ContactValues
): Promise<ActionResult<{ id: string }>> {
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return actionValidationError(parsed.error);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contacts")
      .insert({
        kind: parsed.data.kind,
        display_name: parsed.data.displayName,
        organization_name: cleanText(parsed.data.organizationName),
        phone: cleanText(parsed.data.phone),
        email: cleanText(parsed.data.email),
        instagram_handle: cleanText(parsed.data.instagramHandle),
        notes: cleanText(parsed.data.notes)
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    revalidatePath("/contacts");
    revalidatePath("/jobs");
    revalidatePath("/expenses");
    revalidatePath("/reminders");

    return { success: true, data: { id: data.id } };
  } catch (error) {
    return actionErrorResult(error);
  }
}

export async function updateContactAction(
  contactId: string,
  values: ContactValues
): Promise<ActionResult<{ id: string }>> {
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return actionValidationError(parsed.error);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("contacts")
      .update({
        kind: parsed.data.kind,
        display_name: parsed.data.displayName,
        organization_name: cleanText(parsed.data.organizationName),
        phone: cleanText(parsed.data.phone),
        email: cleanText(parsed.data.email),
        instagram_handle: cleanText(parsed.data.instagramHandle),
        notes: cleanText(parsed.data.notes)
      })
      .eq("id", contactId);

    if (error) {
      throw error;
    }

    revalidatePath("/contacts");
    revalidatePath("/jobs");
    revalidatePath("/expenses");
    revalidatePath("/reminders");

    return { success: true, data: { id: contactId } };
  } catch (error) {
    return actionErrorResult(error);
  }
}

export async function deleteContactAction(contactId: string) {
  const supabase = await createClient();
  await supabase.from("contacts").delete().eq("id", contactId);

  revalidatePath("/contacts");
  revalidatePath("/jobs");
  revalidatePath("/expenses");
  revalidatePath("/reminders");
}

/**
 * Quick contact creation from job form — minimal fields.
 */
export async function quickCreateContactAction(
  displayName: string,
  phone: string,
  kind: "client" | "fg_model" | "crew" | "editor" | "vendor" | "other"
): Promise<ActionResult<{ id: string; display_name: string; kind: string; phone: string | null }>> {
  if (!displayName.trim()) {
    return { success: false, message: "Name is required." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contacts")
      .insert({
        kind,
        display_name: displayName.trim(),
        phone: phone.trim() || null
      })
      .select("id, display_name, kind, phone")
      .single();

    if (error) throw error;

    revalidatePath("/contacts");
    revalidatePath("/jobs");

    return { success: true, data };
  } catch (error) {
    return actionErrorResult(error);
  }
}
