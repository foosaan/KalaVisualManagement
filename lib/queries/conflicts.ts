import { createClient } from "@/lib/supabase/server";

const BUFFER_MINUTES = 60;

export type ConflictType = "conflict" | "parallel" | "warning_unassigned" | "warning_tight_schedule";

export type ConflictResult = {
  type: ConflictType;
  jobA: { id: string; title: string; start_at: string; end_at: string; location: string | null };
  jobB: { id: string; title: string; start_at: string; end_at: string; location: string | null };
  photographer?: { id: string; name: string };
  message_en: string;
  message_id: string;
};

export type AssignmentStatusType =
  | "unassigned"
  | "assigned"
  | "waiting_confirmation"
  | "confirmed"
  | "need_replacement"
  | "conflict";

/**
 * Detect scheduling conflicts for a given job's time range.
 * Checks all overlapping/adjacent jobs and their photographer assignments.
 */
export async function detectConflicts(
  jobId: string | null,
  startAt: string,
  endAt: string,
  photographerIds: string[] = []
): Promise<ConflictResult[]> {
  const supabase = await createClient();
  const results: ConflictResult[] = [];

  const startDate = new Date(startAt);
  const endDate = new Date(endAt);

  // Extend range by buffer to catch tight-schedule warnings
  const bufferedStart = new Date(startDate.getTime() - BUFFER_MINUTES * 60 * 1000);
  const bufferedEnd = new Date(endDate.getTime() + BUFFER_MINUTES * 60 * 1000);

  // Get all jobs that overlap or are within buffer of this time range
  let query = supabase
    .from("jobs")
    .select(`
      id, title, start_at, end_at, location, status,
      job_contacts (
        contact_id,
        role,
        contact:contacts!job_contacts_contact_id_fkey ( id, display_name )
      )
    `)
    .lte("start_at", bufferedEnd.toISOString())
    .gte("end_at", bufferedStart.toISOString())
    .neq("status", "cancelled");

  if (jobId) {
    query = query.neq("id", jobId);
  }

  const { data: overlappingJobs } = await query;
  if (!overlappingJobs || overlappingJobs.length === 0) return results;

  for (const otherJob of overlappingJobs) {
    const otherStart = new Date(otherJob.start_at);
    const otherEnd = new Date(otherJob.end_at);

    const jobA = {
      id: jobId || "new",
      title: "(Current Job)",
      start_at: startAt,
      end_at: endAt,
      location: null as string | null
    };
    const jobB = {
      id: otherJob.id,
      title: otherJob.title,
      start_at: otherJob.start_at,
      end_at: otherJob.end_at,
      location: otherJob.location
    };

    // Check time overlap (not just buffer proximity)
    const hasTimeOverlap = startDate < otherEnd && endDate > otherStart;

    if (hasTimeOverlap) {
      // Get photographers from the other job
      const otherPhotographers = (otherJob.job_contacts || [])
        .filter((jc) => jc.role === "fg_model" || jc.role === "crew")
        .map((jc) => ({
          id: jc.contact_id,
          name: (jc.contact as { id: string; display_name: string } | null)?.display_name || "Unknown"
        }));

      // Case 1: Either job has no photographer assigned
      if (photographerIds.length === 0 || otherPhotographers.length === 0) {
        results.push({
          type: "warning_unassigned",
          jobA,
          jobB,
          message_en: `${otherJob.title} overlaps but photographer assignment is incomplete`,
          message_id: `${otherJob.title} bentrok waktu, tapi penugasan fotografer belum lengkap`
        });
        continue;
      }

      // Case 2 & 3: Check photographer overlap
      const sharedPhotographers = otherPhotographers.filter((p) => photographerIds.includes(p.id));

      if (sharedPhotographers.length > 0) {
        // CONFLICT — Same photographer on overlapping jobs
        for (const photographer of sharedPhotographers) {
          results.push({
            type: "conflict",
            jobA,
            jobB,
            photographer,
            message_en: `CONFLICT: ${photographer.name} is assigned to both "${otherJob.title}" at the same time`,
            message_id: `BENTROK: ${photographer.name} ditugaskan di "${otherJob.title}" pada waktu yang sama`
          });
        }
      } else {
        // PARALLEL — Different photographers, same time = OK
        results.push({
          type: "parallel",
          jobA,
          jobB,
          message_en: `Parallel Job — "${otherJob.title}" runs at the same time with different photographer`,
          message_id: `Parallel Job — "${otherJob.title}" berjalan bersamaan dengan fotografer berbeda`
        });
      }
    } else {
      // Jobs don't overlap but are within buffer window
      const gapMs = Math.max(otherStart.getTime() - endDate.getTime(), startDate.getTime() - otherEnd.getTime());
      const gapMinutes = Math.round(gapMs / 60000);

      if (gapMinutes < BUFFER_MINUTES && gapMinutes >= 0) {
        results.push({
          type: "warning_tight_schedule",
          jobA,
          jobB,
          message_en: `Only ${gapMinutes} min gap before "${otherJob.title}" — check travel time and location`,
          message_id: `Hanya ${gapMinutes} menit jeda sebelum "${otherJob.title}" — cek jarak lokasi dan waktu perjalanan`
        });
      }
    }
  }

  return results;
}

/**
 * Compute assignment status for a single job based on its contacts.
 */
export function computeAssignmentStatus(
  jobContacts: Array<{
    role: string;
    confirmation_status?: string;
  }>,
  conflicts: ConflictResult[] = []
): AssignmentStatusType {
  const photographers = jobContacts.filter((jc) => jc.role === "fg_model" || jc.role === "crew");

  if (photographers.length === 0) return "unassigned";

  // Check conflicts
  if (conflicts.some((c) => c.type === "conflict")) return "conflict";

  // Check for declines
  if (photographers.some((p) => p.confirmation_status === "declined")) return "need_replacement";

  // Check if all accepted
  if (photographers.every((p) => p.confirmation_status === "accepted")) return "confirmed";

  // Check if any still pending
  if (photographers.some((p) => p.confirmation_status === "pending" || p.confirmation_status === "tentative")) {
    return "waiting_confirmation";
  }

  return "assigned";
}

/**
 * Check availability of a specific contact for a given time range.
 * Returns existing jobs that overlap.
 */
export async function checkContactAvailability(
  contactId: string,
  startAt: string,
  endAt: string,
  excludeJobId?: string
) {
  const supabase = await createClient();

  // Find jobs where this contact is assigned as photographer/crew
  const query = supabase
    .from("job_contacts")
    .select(`
      job_id,
      role,
      confirmation_status,
      jobs!job_contacts_job_id_fkey (
        id, title, start_at, end_at, location, status
      )
    `)
    .eq("contact_id", contactId)
    .in("role", ["fg_model", "crew"]);

  const { data: assignments } = await query;
  if (!assignments) return { available: true, existingJobs: [], status: "available" as const };

  const overlapping = assignments.filter((a) => {
    const job = a.jobs as unknown as { id: string; start_at: string; end_at: string; status: string } | null;
    if (!job || job.status === "cancelled") return false;
    if (excludeJobId && job.id === excludeJobId) return false;

    const jobStart = new Date(job.start_at);
    const jobEnd = new Date(job.end_at);
    const rangeStart = new Date(startAt);
    const rangeEnd = new Date(endAt);

    return rangeStart < jobEnd && rangeEnd > jobStart;
  });

  const existingJobs = overlapping.map((a) => {
    const job = a.jobs as unknown as { id: string; title: string; start_at: string; end_at: string; location: string | null };
    return {
      id: job.id,
      title: job.title,
      start_at: job.start_at,
      end_at: job.end_at,
      location: job.location,
      confirmation_status: a.confirmation_status
    };
  });

  return {
    available: existingJobs.length === 0,
    existingJobs,
    status: existingJobs.length > 0 ? ("booked" as const) : ("available" as const)
  };
}
