"use server";

import { createClient } from "@/lib/supabase/server";
import {
  cancelPendingRemindersForJob,
  regeneratePendingRemindersForJob
} from "@/lib/services/reminders";
import { jobSchema, type JobValues } from "@/lib/validation/jobs";
import {
  ActionResult,
  actionErrorResult,
  actionValidationError,
  cleanText,
  revalidateJobSurfaces
} from "@/lib/actions/shared";

export async function createJobAction(values: JobValues): Promise<ActionResult<{ id: string }>> {
  return saveJobAction(null, values);
}

export async function updateJobAction(
  jobId: string,
  values: JobValues
): Promise<ActionResult<{ id: string }>> {
  return saveJobAction(jobId, values);
}

export async function updateJobDriveUrlAction(
  jobId: string,
  driveUrl: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient();
    const { data: job } = await supabase.from("jobs").select("notes, title").eq("id", jobId).single();

    const currentNotes = job?.notes || "";
    const cleanUrl = driveUrl.trim();
    let updatedNotes = currentNotes;
    if (updatedNotes.includes("https://drive.google.com")) {
      updatedNotes = updatedNotes.replace(/https:\/\/drive\.google\.com[^\s\n\r]+/g, cleanUrl);
    } else {
      updatedNotes = `Link Google Drive: ${cleanUrl}\n\n${updatedNotes}`.trim();
    }

    const { error } = await supabase
      .from("jobs")
      .update({
        notes: updatedNotes,
        workflow_status: "ready"
      })
      .eq("id", jobId);

    if (error) throw error;

    revalidateJobSurfaces(jobId);
    return { success: true, data: { success: true } };
  } catch (err: any) {
    return actionErrorResult(err?.message || "Gagal menyimpan link Google Drive.");
  }
}

async function saveJobAction(
  jobId: string | null,
  values: JobValues
): Promise<ActionResult<{ id: string }>> {
  const parsed = jobSchema.safeParse(values);
  if (!parsed.success) {
    return actionValidationError(parsed.error);
  }

  try {
    const supabase = await createClient();
    const clientAssignment = parsed.data.contactAssignments.find(
      (assignment) => assignment.role === "client" && assignment.isPrimary
    ) ?? parsed.data.contactAssignments.find((assignment) => assignment.role === "client");

    const { data, error } = await supabase.rpc("save_job_with_contacts", {
      p_job_id: jobId,
      p_title: parsed.data.title,
      p_shoot_type: parsed.data.shootType,
      p_client_contact_id: clientAssignment?.contactId ?? null,
      p_start_at: parsed.data.startAt,
      p_end_at: parsed.data.endAt,
      p_location: cleanText(parsed.data.location),
      p_total_price: parsed.data.totalPrice,
      p_currency: parsed.data.currency,
      p_status: parsed.data.status,
      p_notes: cleanText(parsed.data.notes),
      p_concept: cleanText(parsed.data.concept),
      p_workflow_status: parsed.data.workflowStatus,
      p_delivery_deadline: parsed.data.deliveryDeadline || null,
      p_actual_delivery_date: parsed.data.actualDeliveryDate || null,
      p_contacts: parsed.data.contactAssignments.map((assignment) => ({
        contact_id: assignment.contactId,
        role: assignment.role,
        is_primary: assignment.isPrimary,
        send_reminder: assignment.sendReminder,
        fee_amount: assignment.feeAmount ?? null,
        notes: cleanText(assignment.notes),
        confirmation_status: assignment.confirmationStatus ?? "accepted",
        fee_status: assignment.feeStatus ?? "unpaid"
      }))
    });

    if (error) {
      throw error;
    }

    if (parsed.data.status === "cancelled") {
      await cancelPendingRemindersForJob(data, supabase);
    } else {
      await regeneratePendingRemindersForJob(data, supabase);
    }

    revalidateJobSurfaces(data);
    return { success: true, data: { id: data } };
  } catch (error) {
    return actionErrorResult(error);
  }
}

export async function deleteJobAction(jobId: string) {
  const supabase = await createClient();
  await supabase.from("jobs").delete().eq("id", jobId);
  revalidateJobSurfaces(jobId);
}

/**
 * Quick inline workflow status update — no form needed.
 */
export async function updateWorkflowStatusAction(
  jobId: string,
  workflowStatus: "scheduled" | "shot" | "editing" | "ready" | "delivered"
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("jobs")
      .update({ workflow_status: workflowStatus, updated_at: new Date().toISOString() })
      .eq("id", jobId);

    if (error) throw error;

    revalidateJobSurfaces(jobId);
    return { success: true, data: { id: jobId } };
  } catch (error) {
    return actionErrorResult(error);
  }
}

/**
 * Duplicate a job — copies all fields except dates, resets status to draft.
 */
export async function duplicateJobAction(jobId: string): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient();

    // Get the original job
    const { data: original, error: fetchError } = await supabase
      .from("jobs")
      .select(`
        *,
        job_contacts (
          contact_id, role, is_primary, send_reminder, fee_amount, notes,
          confirmation_status, fee_status
        )
      `)
      .eq("id", jobId)
      .single();

    if (fetchError || !original) throw fetchError ?? new Error("Job not found");

    // Create new job via RPC with "[COPY]" prefix and reset dates
    const { data: newJobId, error: createError } = await supabase.rpc("save_job_with_contacts", {
      p_job_id: null,
      p_title: `[COPY] ${original.title}`,
      p_shoot_type: original.shoot_type,
      p_client_contact_id: original.client_contact_id,
      p_start_at: original.start_at,
      p_end_at: original.end_at,
      p_location: original.location,
      p_total_price: Number(original.total_price),
      p_currency: original.currency,
      p_status: "draft" as const,
      p_notes: original.notes,
      p_concept: original.concept,
      p_workflow_status: "scheduled" as const,
      p_delivery_deadline: null,
      p_actual_delivery_date: null,
      p_contacts: original.job_contacts?.map((jc) => ({
        contact_id: jc.contact_id,
        role: jc.role,
        is_primary: jc.is_primary,
        send_reminder: jc.send_reminder,
        fee_amount: jc.fee_amount,
        notes: jc.notes,
        confirmation_status: jc.confirmation_status ?? "accepted",
        fee_status: "unpaid"
      })) ?? []
    });

    if (createError) throw createError;

    revalidateJobSurfaces(newJobId);
    return { success: true, data: { id: newJobId } };
  } catch (error) {
    return actionErrorResult(error);
  }
}
