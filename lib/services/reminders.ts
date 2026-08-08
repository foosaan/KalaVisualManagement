import { subHours } from "date-fns";

import { AUTO_REMINDER_RULES, REMINDER_RECIPIENT_LABELS } from "@/lib/constants";
import type { AppSupabaseClient } from "@/lib/supabase/types";
import { createServiceClient } from "@/lib/supabase/service";
import { formatDateTime } from "@/lib/utils";

type ReminderGatewayPayload = {
  reminderId: string;
  channel: "internal" | "whatsapp";
  phone: string;
  message: string;
};

type ReminderGatewayResult = {
  status: "sent" | "failed";
  providerMessageId?: string;
  errorMessage?: string;
};

type ReminderClient = AppSupabaseClient;

type ReminderDraft = {
  reminderType: "h_7" | "h_3" | "h_1" | "same_day";
  targetType: "self" | "client" | "fg_model" | "crew";
  targetContactId: string | null;
  recipientName: string;
  recipientPhone: string;
  scheduledFor: string;
  message: string;
};

type JobReminderContext = {
  job: {
    id: string;
    owner_id: string;
    title: string;
    shoot_type: string;
    start_at: string;
    location: string | null;
    status: "draft" | "confirmed" | "completed" | "delivered" | "cancelled";
  };
  profile: {
    full_name: string | null;
    business_name: string | null;
    phone: string | null;
  } | null;
  assignments: {
    id: string;
    role: "client" | "fg_model" | "crew" | "editor" | "other";
    send_reminder: boolean;
    contact: {
      id: string;
      display_name: string;
      phone: string | null;
    } | null;
  }[];
};

export interface ReminderGateway {
  send(payload: ReminderGatewayPayload): Promise<ReminderGatewayResult>;
}

class LoggingReminderGateway implements ReminderGateway {
  async send(payload: ReminderGatewayPayload): Promise<ReminderGatewayResult> {
    console.info("Mock reminder dispatch", payload);

    return {
      status: "sent",
      providerMessageId: `mock-${payload.reminderId}`
    };
  }
}

export function getReminderGateway(): ReminderGateway {
  return new LoggingReminderGateway();
}

export async function generateRemindersForJob(jobId: string, supabase?: ReminderClient) {
  return syncJobReminders(jobId, supabase);
}

export async function regeneratePendingRemindersForJob(jobId: string, supabase?: ReminderClient) {
  return syncJobReminders(jobId, supabase);
}

export async function cancelPendingRemindersForJob(jobId: string, supabase?: ReminderClient) {
  const client = supabase ?? createServiceClient();

  const { error } = await client
    .from("reminders")
    .update({
      status: "cancelled",
      last_error: null
    })
    .eq("job_id", jobId)
    .eq("status", "pending");

  if (error) {
    throw new Error(`Unable to cancel job reminders: ${error.message}`);
  }
}

export async function listDueReminders(limit = 20, supabase?: ReminderClient) {
  const client = supabase ?? createServiceClient();
  const now = new Date().toISOString();

  const { data, error } = await client
    .from("reminders")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_for", now)
    .order("scheduled_for", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to load due reminders: ${error.message}`);
  }

  return data ?? [];
}

export async function markReminderSent(
  reminderId: string,
  input: {
    providerMessageId?: string;
    targetPhone?: string | null;
  },
  supabase?: ReminderClient
) {
  const client = supabase ?? createServiceClient();

  const { data: reminder, error: reminderError } = await client
    .from("reminders")
    .select("id, owner_id, channel, message, scheduled_for")
    .eq("id", reminderId)
    .single();

  if (reminderError) {
    throw new Error(`Unable to load reminder before marking sent: ${reminderError.message}`);
  }

  const { error: deliveryError } = await client.from("reminder_deliveries").insert({
    owner_id: reminder.owner_id,
    reminder_id: reminder.id,
    channel: reminder.channel,
    target_phone: input.targetPhone ?? null,
    payload: {
      message: reminder.message,
      scheduled_for: reminder.scheduled_for
    },
    provider_message_id: input.providerMessageId ?? null,
    status: "sent",
    sent_at: new Date().toISOString()
  });

  if (deliveryError) {
    throw new Error(`Unable to save reminder delivery: ${deliveryError.message}`);
  }

  const { error } = await client
    .from("reminders")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      last_error: null
    })
    .eq("id", reminderId);

  if (error) {
    throw new Error(`Unable to mark reminder sent: ${error.message}`);
  }
}

export async function markReminderFailed(
  reminderId: string,
  errorMessage: string,
  input?: {
    targetPhone?: string | null;
  },
  supabase?: ReminderClient
) {
  const client = supabase ?? createServiceClient();

  const { data: reminder, error: reminderError } = await client
    .from("reminders")
    .select("id, owner_id, channel, message, scheduled_for")
    .eq("id", reminderId)
    .single();

  if (reminderError) {
    throw new Error(`Unable to load reminder before marking failed: ${reminderError.message}`);
  }

  const { error: deliveryError } = await client.from("reminder_deliveries").insert({
    owner_id: reminder.owner_id,
    reminder_id: reminder.id,
    channel: reminder.channel,
    target_phone: input?.targetPhone ?? null,
    payload: {
      message: reminder.message,
      scheduled_for: reminder.scheduled_for
    },
    error_message: errorMessage,
    status: "failed"
  });

  if (deliveryError) {
    throw new Error(`Unable to save failed reminder delivery: ${deliveryError.message}`);
  }

  const { error } = await client
    .from("reminders")
    .update({
      status: "failed",
      last_error: errorMessage
    })
    .eq("id", reminderId);

  if (error) {
    throw new Error(`Unable to mark reminder failed: ${error.message}`);
  }
}

export async function sendDueReminders(limit = 20) {
  const client = createServiceClient();
  const gateway = getReminderGateway();
  const reminders = await listDueReminders(limit, client);

  let sent = 0;
  let failed = 0;

  for (const reminder of reminders) {
    const phone = reminder.recipient_phone?.trim();

    if (!phone) {
      await markReminderFailed(
        reminder.id,
        "Recipient phone is missing. Regenerate reminders after updating the contact phone number.",
        { targetPhone: null },
        client
      );
      failed += 1;
      continue;
    }

    const result = await gateway.send({
      reminderId: reminder.id,
      channel: reminder.channel,
      phone,
      message: reminder.message
    });

    if (result.status === "sent") {
      await markReminderSent(
        reminder.id,
        {
          providerMessageId: result.providerMessageId,
          targetPhone: phone
        },
        client
      );
      sent += 1;
      continue;
    }

    await markReminderFailed(
      reminder.id,
      result.errorMessage || "Mock sender failed to deliver reminder.",
      { targetPhone: phone },
      client
    );
    failed += 1;
  }

  return {
    processed: reminders.length,
    sent,
    failed
  };
}

async function syncJobReminders(jobId: string, supabase?: ReminderClient) {
  const client = supabase ?? createServiceClient();
  const context = await loadJobReminderContext(jobId, client);

  if (!context) {
    return;
  }

  if (context.job.status === "cancelled") {
    await cancelPendingRemindersForJob(jobId, client);
    return;
  }

  const desired = buildReminderDrafts(context);
  const { data: existing, error } = await client
    .from("reminders")
    .select("*")
    .eq("job_id", jobId);

  if (error) {
    throw new Error(`Unable to load existing reminders: ${error.message}`);
  }

  const sentKeys = new Set(
    (existing ?? [])
      .filter((reminder) => reminder.status === "sent")
      .map((reminder) => getReminderIdentity(reminder))
  );

  const mutableByKey = new Map(
    (existing ?? [])
      .filter((reminder) => reminder.status !== "sent")
      .map((reminder) => [getReminderIdentity(reminder), reminder] as const)
  );

  const touchedKeys = new Set<string>();

  for (const draft of desired) {
    const key = getReminderIdentity(draft);

    if (sentKeys.has(key)) {
      continue;
    }

    touchedKeys.add(key);
    const existingReminder = mutableByKey.get(key);

    if (existingReminder) {
      const { error: updateError } = await client
        .from("reminders")
        .update({
          reminder_type: draft.reminderType,
          target_type: draft.targetType,
          target_contact_id: draft.targetContactId,
          recipient_name: draft.recipientName,
          recipient_phone: draft.recipientPhone,
          channel: "whatsapp",
          scheduled_for: draft.scheduledFor,
          message: draft.message,
          status: "pending",
          last_error: null,
          sent_at: null
        })
        .eq("id", existingReminder.id);

      if (updateError) {
        throw new Error(`Unable to update reminder: ${updateError.message}`);
      }

      continue;
    }

    const { error: insertError } = await client.from("reminders").insert({
      job_id: context.job.id,
      reminder_type: draft.reminderType,
      target_type: draft.targetType,
      target_contact_id: draft.targetContactId,
      recipient_name: draft.recipientName,
      recipient_phone: draft.recipientPhone,
      channel: "whatsapp",
      scheduled_for: draft.scheduledFor,
      message: draft.message,
      status: "pending"
    });

    if (insertError) {
      throw new Error(`Unable to create reminder: ${insertError.message}`);
    }
  }

  const staleReminderIds =
    (existing ?? [])
      .filter((reminder) => reminder.status === "pending")
      .filter((reminder) => !touchedKeys.has(getReminderIdentity(reminder)))
      .map((reminder) => reminder.id) ?? [];

  if (staleReminderIds.length > 0) {
    const { error: staleError } = await client
      .from("reminders")
      .update({
        status: "cancelled",
        last_error: null
      })
      .in("id", staleReminderIds);

    if (staleError) {
      throw new Error(`Unable to cancel stale reminders: ${staleError.message}`);
    }
  }
}

async function loadJobReminderContext(jobId: string, client: ReminderClient): Promise<JobReminderContext | null> {
  const { data: job, error: jobError } = await client
    .from("jobs")
    .select(
      `
        id,
        owner_id,
        title,
        shoot_type,
        start_at,
        location,
        status,
        job_contacts (
          id,
          role,
          send_reminder,
          contact:contacts!job_contacts_contact_id_fkey (
            id,
            display_name,
            phone
          )
        )
      `
    )
    .eq("id", jobId)
    .single();

  if (jobError) {
    throw new Error(`Unable to load job reminder context: ${jobError.message}`);
  }

  if (!job) {
    return null;
  }

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("full_name, business_name, phone")
    .eq("id", job.owner_id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Unable to load owner profile for reminders: ${profileError.message}`);
  }

  return {
    job,
    profile,
    assignments: job.job_contacts ?? []
  };
}

function buildReminderDrafts(context: JobReminderContext) {
  const recipients = buildReminderRecipients(context);
  const drafts: ReminderDraft[] = [];

  for (const recipient of recipients) {
    for (const rule of AUTO_REMINDER_RULES) {
      const scheduledFor = subHours(new Date(context.job.start_at), rule.hoursBefore).toISOString();

      drafts.push({
        reminderType: rule.reminderType,
        targetType: recipient.targetType,
        targetContactId: recipient.targetContactId,
        recipientName: recipient.recipientName,
        recipientPhone: recipient.recipientPhone,
        scheduledFor,
        message: buildReminderMessage({
          ...recipient,
          job: context.job,
          reminderType: rule.reminderType
        })
      });
    }
  }

  return drafts;
}

function buildReminderRecipients(context: JobReminderContext) {
  const recipients: Array<{
    targetType: "self" | "client" | "fg_model" | "crew";
    targetContactId: string | null;
    recipientName: string;
    recipientPhone: string;
  }> = [];
  const seen = new Set<string>();

  if (context.profile?.phone?.trim()) {
    const name =
      context.profile.full_name?.trim() ||
      context.profile.business_name?.trim() ||
      REMINDER_RECIPIENT_LABELS.self;

    recipients.push({
      targetType: "self",
      targetContactId: null,
      recipientName: name,
      recipientPhone: context.profile.phone.trim()
    });
    seen.add(`self:${context.profile.phone.trim()}`);
  }

  for (const assignment of context.assignments) {
    if (!assignment.send_reminder) {
      continue;
    }

    const phone = assignment.contact?.phone?.trim();
    const name = assignment.contact?.display_name?.trim();

    if (!phone || !name || !assignment.contact?.id) {
      continue;
    }

    if (
      assignment.role !== "client" &&
      assignment.role !== "fg_model" &&
      assignment.role !== "crew"
    ) {
      continue;
    }

    const targetType = assignment.role;
    const key = `${targetType}:${assignment.contact.id}`;

    if (seen.has(key)) {
      continue;
    }

    recipients.push({
      targetType,
      targetContactId: assignment.contact.id,
      recipientName: name,
      recipientPhone: phone
    });
    seen.add(key);
  }

  return recipients;
}

function buildReminderMessage(input: {
  targetType: "self" | "client" | "fg_model" | "crew";
  recipientName: string;
  reminderType: "h_7" | "h_3" | "h_1" | "same_day";
  job: JobReminderContext["job"];
}) {
  const prefix =
    input.targetType === "self"
      ? "Reminder untuk kamu"
      : `Halo ${input.recipientName}, ini pengingat untuk photo shoot`;

  return `${prefix}: ${input.job.title} (${input.job.shoot_type.replace("_", " ")}) pada ${formatDateTime(
    input.job.start_at
  )}${input.job.location ? ` di ${input.job.location}` : ""}. Jadwal ini adalah reminder ${input.reminderType.replace(
    "_",
    " "
  )}.`;
}

function getReminderIdentity(input: {
  reminder_type?: string;
  reminderType?: string;
  target_type?: string;
  targetType?: string;
  target_contact_id?: string | null;
  targetContactId?: string | null;
  recipient_phone?: string | null;
  recipientPhone?: string | null;
}) {
  return [
    input.reminder_type ?? input.reminderType ?? "",
    input.target_type ?? input.targetType ?? "",
    input.target_contact_id ?? input.targetContactId ?? "",
    input.recipient_phone ?? input.recipientPhone ?? ""
  ].join(":");
}
