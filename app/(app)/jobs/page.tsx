import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  MapPin,
  Plus,
  Search,
  Sparkles
} from "lucide-react";

import { deleteJobAction } from "@/lib/actions/jobs";
import { getJobsPageData } from "@/lib/queries/jobs";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { DeleteButton } from "@/components/ui/delete-button";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { JobStatusBadge } from "@/components/jobs/job-status-badge";
import { PaymentStatusBadge } from "@/components/jobs/payment-status-badge";
import { InlineWorkflowSelector } from "@/components/jobs/inline-workflow-selector";
import { DuplicateJobButton } from "@/components/jobs/duplicate-job-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getClientReminderTemplate, buildWhatsAppUrl } from "@/lib/whatsapp-templates";

// Shoot type emoji mapping
const SHOOT_EMOJI: Record<string, string> = {
  portrait: "📷",
  prewedding: "💍",
  wedding: "👰",
  graduation: "🎓",
  brand: "📦",
  event: "🎤",
  family: "👨‍👩‍👧‍👦",
  other: "✨"
};

type JobsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    workflow?: string;
  }>;
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const { q = "", status = "all", workflow = "all" } = await searchParams;
  const locale = await getLocale();
  const jobs = await getJobsPageData();
  const search = q.trim().toLowerCase();
  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = status === "all" || job.status === status;
    const matchesWorkflow = workflow === "all" || job.workflow_status === workflow;
    const haystack = [job.title, job.client_name, job.location].join(" ").toLowerCase();
    const matchesSearch = search.length === 0 || haystack.includes(search);
    return matchesStatus && matchesWorkflow && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="gradient-icon gradient-icon-emerald">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("jobs.title", locale)}</h1>
            <p className="text-xs text-muted-foreground">{t("jobs.description", locale)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/jobs/new"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            )}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
            Quick Import WA
          </Link>
          <Link href="/jobs/new" className={buttonVariants({ size: "sm" })}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t("jobs.createJob", locale)}
          </Link>
        </div>
      </div>

      {/* ── Search / Filter ── */}
      <div className="glass-card rounded-2xl p-4">
        <form className="grid gap-3 sm:grid-cols-[1fr_140px_140px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
            <Input
              defaultValue={q}
              name="q"
              placeholder={t("jobs.searchPlaceholder", locale)}
              className="pl-9"
            />
          </div>
          <Select
            defaultValue={status}
            name="status"
            options={[
              { label: t("jobs.allStatuses", locale), value: "all" },
              { label: t("jobStatus.draft", locale), value: "draft" },
              { label: t("jobStatus.confirmed", locale), value: "confirmed" },
              { label: t("jobStatus.completed", locale), value: "completed" },
              { label: t("jobStatus.delivered", locale), value: "delivered" },
              { label: t("jobStatus.cancelled", locale), value: "cancelled" }
            ]}
          />
          <Select
            defaultValue={workflow}
            name="workflow"
            options={[
              { label: "All Workflow", value: "all" },
              { label: "📅 Scheduled", value: "scheduled" },
              { label: "📸 Shot", value: "shot" },
              { label: "✏️ Editing", value: "editing" },
              { label: "📦 Ready", value: "ready" },
              { label: "✅ Delivered", value: "delivered" }
            ]}
          />
          <button className={buttonVariants({ variant: "outline", size: "default" })} type="submit">
            {t("jobs.filter", locale)}
          </button>
        </form>
      </div>

      {/* ── Results Count ── */}
      {jobs.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {filteredJobs.length} dari {jobs.length} pekerjaan
        </p>
      )}

      {/* ── Job Cards ── */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          title={jobs.length === 0 ? t("jobs.noJobsYet", locale) : t("jobs.noJobsMatch", locale)}
          description={
            jobs.length === 0
              ? t("jobs.createFirstDesc", locale)
              : t("jobs.tryDifferent", locale)
          }
          ctaHref="/jobs/new"
          ctaLabel={jobs.length === 0 ? t("jobs.createFirstJob", locale) : t("jobs.createJob", locale)}
        />
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job, i) => (
            <div
              key={job.job_id}
              className={cn(
                "group glass-card glass-card-hover rounded-xl overflow-hidden animate-slide-up",
                i < 8 ? `stagger-${i + 1}` : ""
              )}
            >
              <div className="flex items-stretch">
                {/* Left accent bar */}
                <div className={cn(
                  "w-1 shrink-0",
                  job.status === "confirmed" ? "bg-emerald-500" :
                  job.status === "completed" ? "bg-cyan-500" :
                  job.status === "delivered" ? "bg-blue-500" :
                  job.status === "cancelled" ? "bg-red-400" :
                  "bg-amber-400"
                )} />

                {/* Content */}
                <div className="flex-1 px-4 py-3">
                  <div className="flex items-start gap-3">
                    {/* Shoot type emoji */}
                    <span className="text-xl mt-0.5 shrink-0">
                      {SHOOT_EMOJI[job.shoot_type || ""] || "📷"}
                    </span>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/jobs/${job.job_id}`}
                          className="text-sm font-semibold hover:text-primary transition-colors truncate"
                        >
                          {job.title}
                        </Link>
                        <JobStatusBadge status={job.status!} />
                        <PaymentStatusBadge status={job.payment_status} />
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="h-3 w-3" />
                          {formatDateTime(job.start_at)}
                        </span>
                        {job.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                        )}
                        {job.client_name && (
                          <span>👤 {job.client_name}</span>
                        )}
                      </div>

                      {/* Mobile: Workflow + Price */}
                      <div className="mt-2 flex items-center justify-between gap-2 sm:hidden">
                        <InlineWorkflowSelector
                          jobId={job.job_id!}
                          current={job.workflow_status || "scheduled"}
                        />
                        <p className="text-sm font-bold tabular-nums text-emerald-700">
                          {formatCurrency(job.gross_income ?? 0, job.currency || "IDR")}
                        </p>
                      </div>
                    </div>

                    {/* Desktop right side */}
                    <div className="hidden sm:flex items-center gap-4 shrink-0">
                      <InlineWorkflowSelector
                        jobId={job.job_id!}
                        current={job.workflow_status || "scheduled"}
                      />
                      <p className="text-sm font-bold tabular-nums text-emerald-700 w-28 text-right">
                        {formatCurrency(job.gross_income ?? 0, job.currency || "IDR")}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {job.client_phone && (
                          <a
                            className="rounded-lg p-1.5 text-muted-foreground/40 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                            href={buildWhatsAppUrl(
                              job.client_phone,
                              getClientReminderTemplate(
                                { title: job.title || "", startAt: job.start_at || "", endAt: job.end_at || "", location: job.location },
                                { name: job.client_name || "", phone: job.client_phone }
                              )
                            )}
                            rel="noopener noreferrer"
                            target="_blank"
                            title="WhatsApp"
                          >
                            💬
                          </a>
                        )}
                        <Link
                          className="rounded-lg p-1.5 text-muted-foreground/40 hover:bg-muted hover:text-foreground transition-colors"
                          href={`/jobs/${job.job_id}`}
                          title={t("jobs.view", locale)}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                          className="rounded-lg p-1.5 text-muted-foreground/40 hover:bg-muted hover:text-foreground transition-colors"
                          href={`/jobs/${job.job_id}/edit`}
                          title={t("jobs.edit", locale)}
                        >
                          ✏️
                        </Link>
                        <DuplicateJobButton jobId={job.job_id!} label="" size="sm" variant="ghost" />
                        <DeleteButton action={deleteJobAction.bind(null, job.job_id!)} entityName={t("delete.job", locale)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
