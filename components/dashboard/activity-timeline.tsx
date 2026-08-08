import Link from "next/link";
import { CalendarClock } from "lucide-react";

import { JobStatusBadge } from "@/components/jobs/job-status-badge";
import { type Locale, t } from "@/lib/i18n";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type Job = {
  id: string;
  title: string;
  shoot_type: string | null;
  start_at: string | null;
  end_at: string | null;
  location: string | null;
  status: string;
  currency: string | null;
  total_price: string | number | null;
  client_contact: { id: string; display_name: string | null; phone: string | null }[] | null;
  job_contacts: {
    id: string;
    role: string | null;
    is_primary: boolean | null;
    send_reminder: boolean | null;
    contact: { id: string; display_name: string | null; phone: string | null; kind: string | null } | null;
  }[] | null;
};

type ActivityTimelineProps = {
  jobs: Job[];
  locale: Locale;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getClientName(job: Job, locale: Locale): string {
  const fromDirect = job.client_contact?.[0]?.display_name;
  if (fromDirect) return fromDirect;

  const fromContacts = job.job_contacts
    ?.map((a) => a.contact?.display_name)
    .filter(Boolean)
    .join(", ");
  if (fromContacts) return fromContacts;

  return t("dashboard.noClient", locale);
}

// Group jobs by relative date
function groupByDate(jobs: Job[], locale: Locale): { label: string; jobs: Job[] }[] {
  const groups = new Map<string, Job[]>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  for (const job of jobs) {
    if (!job.start_at) continue;
    const jobDate = new Date(job.start_at);
    jobDate.setHours(0, 0, 0, 0);

    let label: string;
    if (jobDate.getTime() === today.getTime()) {
      label = locale === "id" ? "Hari Ini" : "Today";
    } else if (jobDate.getTime() === tomorrow.getTime()) {
      label = locale === "id" ? "Besok" : "Tomorrow";
    } else {
      label = jobDate.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
        weekday: "short",
        day: "numeric",
        month: "short"
      });
    }

    const existing = groups.get(label);
    if (existing) {
      existing.push(job);
    } else {
      groups.set(label, [job]);
    }
  }

  return Array.from(groups.entries()).map(([label, jobs]) => ({ label, jobs }));
}

export function ActivityTimeline({ jobs, locale }: ActivityTimelineProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <CalendarClock className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold">{t("dashboard.noUpcoming", locale)}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t("dashboard.createJobToSee", locale)}</p>
      </div>
    );
  }

  const groups = groupByDate(jobs, locale);

  return (
    <div className="space-y-5">
      {groups.map((group, gi) => (
        <div key={group.label}>
          {/* Date header */}
          <div className="mb-2.5 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
              {group.label}
            </span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          {/* Jobs */}
          <div className="relative space-y-2.5 pl-6">
            {/* Timeline line */}
            <div className="absolute left-[9px] top-3 bottom-3 w-px bg-gradient-to-b from-emerald-300 via-emerald-200 to-transparent" />

            {group.jobs.map((job, ji) => {
              const clientName = getClientName(job, locale);
              const initials = getInitials(clientName);

              return (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className={`group relative block glass-card glass-card-hover rounded-xl p-4 animate-slide-up stagger-${gi + ji + 1}`}
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-6 top-5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white bg-emerald-400 shadow-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>

                  <div className="flex items-start gap-3.5">
                    {/* Client avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-cyan-100 text-xs font-bold text-emerald-700">
                      {initials}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-sm font-semibold group-hover:text-emerald-600 transition-colors">
                          {job.title}
                        </h4>
                        <JobStatusBadge status={job.status as any} />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDateTime(job.start_at)} • {job.location || t("misc.tbd", locale)}
                      </p>
                      <p className="text-xs text-muted-foreground/70">{clientName}</p>
                    </div>

                    {/* Price */}
                    <p className="shrink-0 text-sm font-bold tabular-nums text-foreground/80">
                      {formatCurrency(job.total_price ?? 0, job.currency ?? undefined)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
