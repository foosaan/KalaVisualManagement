import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Bell,
  BellOff,
  CalendarClock,
  Check,
  CircleDollarSign,
  Clock,
  Copy,
  CreditCard,
  FileText,
  MapPin,
  MessageCircle,
  Pencil,
  Receipt,
  TrendingUp,
  Users2,
  Wallet,
  Sparkles
} from "lucide-react";

import { cancelReminderAction } from "@/lib/actions/reminders";
import { JobStatusBadge } from "@/components/jobs/job-status-badge";
import { PaymentStatusBadge } from "@/components/jobs/payment-status-badge";
import { AssignmentStatusBadge, ConfirmationBadge, FeeStatusBadge, WorkflowStatusBadge } from "@/components/jobs/assignment-status-badge";
import { ConflictBanner } from "@/components/jobs/conflict-badges";
import { InlineWorkflowSelector } from "@/components/jobs/inline-workflow-selector";
import { DuplicateJobButton } from "@/components/jobs/duplicate-job-button";
import { WhatsAppButtons } from "@/components/jobs/whatsapp-buttons";
import { AiJobTools } from "@/components/jobs/ai-job-tools";
import { JobDriveManager } from "@/components/jobs/job-drive-manager";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { getJobById } from "@/lib/queries/jobs";
import { detectConflicts, computeAssignmentStatus } from "@/lib/queries/conflicts";
import { getLocale } from "@/lib/locale";
import { getPhotographerJobTemplate, getClientReminderTemplate, getPaymentReminderTemplate, buildWhatsAppUrl } from "@/lib/whatsapp-templates";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

type JobDetailPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

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

// Workflow steps for visual progress
const WORKFLOW_STEPS = [
  { value: "scheduled", label: "Scheduled", emoji: "📅" },
  { value: "shot", label: "Shot", emoji: "📸" },
  { value: "editing", label: "Editing", emoji: "✏️" },
  { value: "ready", label: "Ready", emoji: "📦" },
  { value: "delivered", label: "Delivered", emoji: "✅" }
];

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { jobId } = await params;
  const [data, locale] = await Promise.all([getJobById(jobId), getLocale()]);

  if (!data.job) {
    notFound();
  }

  const { job, financial } = data;
  const gross = Number(financial?.gross_income ?? job.total_price);
  const paid = Number(financial?.paid_income ?? 0);
  const expenses = Number(financial?.total_expenses ?? 0);
  const crewFees = Number(financial?.total_crew_fees ?? 0);
  const net = Number(financial?.net_income ?? gross - expenses - crewFees);
  const outstanding = Number(financial?.outstanding_balance ?? gross - paid);
  const payPercent = gross > 0 ? Math.round((paid / gross) * 100) : 0;

  // Conflict detection
  const photographerIds = (job.job_contacts || [])
    .filter((jc) => jc.role === "fg_model" || jc.role === "crew")
    .map((jc) => jc.contact_id);

  const conflicts = await detectConflicts(job.id, job.start_at, job.end_at, photographerIds);

  const assignmentStatus = computeAssignmentStatus(
    (job.job_contacts || []).map((jc) => ({
      role: jc.role,
      confirmation_status: jc.confirmation_status
    })),
    conflicts
  );

  const jobData = {
    title: job.title,
    startAt: job.start_at,
    endAt: job.end_at,
    location: job.location,
    totalPrice: Number(job.total_price),
    currency: job.currency
  };

  const currentWorkflowIdx = WORKFLOW_STEPS.findIndex((s) => s.value === (job.workflow_status || "scheduled"));

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════
          HERO HEADER
         ═══════════════════════════════════════ */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-6 text-white animate-slide-up">
        {/* Top bar: Back + Actions */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <Link
            href="/jobs"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <AiJobTools
              job={{
                id: job.id,
                title: job.title,
                shootType: job.shoot_type,
                clientName: financial?.client_name || job.job_contacts?.find((jc) => jc.role === "client")?.contact?.display_name,
                location: job.location,
                concept: job.concept
              }}
            />
            <Link
              href={`/portal/${job.id}`}
              target="_blank"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/30 border border-emerald-500/30"
            >
              <Sparkles className="h-3 w-3" />
              Portal Klien & Pilih Foto
            </Link>
            <Link
              href={`/jobs/${job.id}/edit`}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/20 hover:text-white"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Link>
            <Link
              href={`/jobs/${job.id}/invoice`}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/20 hover:text-white"
            >
              <FileText className="h-3 w-3" />
              Invoice
            </Link>
            <DuplicateJobButton jobId={job.id} />
          </div>
        </div>

        {/* Title + shoot type */}
        <div className="flex items-start gap-3">
          <span className="text-3xl">{SHOOT_EMOJI[job.shoot_type] || "📷"}</span>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold tracking-tight truncate">{job.title}</h1>
            <p className="mt-1 text-sm text-white/50 capitalize">
              {job.shoot_type.replace("_", " ")}
            </p>
          </div>
        </div>

        {/* Meta chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
            <CalendarClock className="h-3 w-3" />
            {formatDateTime(job.start_at)}
          </span>
          {job.location && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
              <MapPin className="h-3 w-3" />
              {job.location}
            </span>
          )}
        </div>

        {/* Status badges */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <JobStatusBadge status={job.status} />
          <PaymentStatusBadge status={financial?.payment_status} />
          <AssignmentStatusBadge status={assignmentStatus} locale={locale} size="md" />
          <WorkflowStatusBadge status={job.workflow_status || "scheduled"} locale={locale} />
        </div>

        {/* Quick action links */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/payments/new?jobId=${job.id}`}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 transition hover:bg-white/10 hover:text-white/90"
          >
            <CreditCard className="h-3 w-3" />
            + Payment
          </Link>
          <Link
            href={`/expenses/new?jobId=${job.id}`}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 transition hover:bg-white/10 hover:text-white/90"
          >
            <Receipt className="h-3 w-3" />
            + Expense
          </Link>
        </div>
      </div>

      {/* Client Quick Contact Bar */}
      {(() => {
        const clientAssignment = (job.job_contacts || []).find((jc) => jc.role === "client");
        const clientContact = clientAssignment?.contact;
        if (!clientContact) return null;

        const fgAssignment = (job.job_contacts || []).find((jc) => jc.role === "fg_model" || jc.role === "crew");
        const senderName = fgAssignment?.contact?.display_name;

        const waMessage = getClientReminderTemplate(jobData, {
          name: clientContact.display_name,
          phone: clientContact.phone
        }, senderName);

        return (
          <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap animate-slide-up stagger-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-cyan-100 text-xs font-bold text-emerald-700">
              {(clientContact.display_name || "?").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{clientContact.display_name}</p>
              <p className="text-xs text-muted-foreground">{clientContact.phone || "No phone"}</p>
            </div>
            {clientContact.phone && (
              <a
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                href={buildWhatsAppUrl(clientContact.phone, waMessage)}
                rel="noopener noreferrer"
                target="_blank"
              >
                <MessageCircle className="h-3 w-3" />
                WhatsApp
              </a>
            )}
          </div>
        );
      })()}

      {/* Conflict Alerts */}
      {conflicts.length > 0 && (
        <div className="space-y-2 animate-scale-in">
          {conflicts.map((conflict, i) => (
            <ConflictBanner
              key={i}
              type={conflict.type}
              locale={locale}
              message={locale === "id" ? conflict.message_id : conflict.message_en}
            />
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════
          GOOGLE DRIVE & DELIVERY MANAGER
         ═══════════════════════════════════════ */}
      <JobDriveManager
        jobId={job.id}
        initialDriveUrl={(() => {
          const match = (job.notes || "").match(/https:\/\/drive\.google\.com[^\s\n\r]+/i);
          return match ? match[0] : "";
        })()}
        clientName={financial?.client_name || job.job_contacts?.find((jc) => jc.role === "client")?.contact?.display_name}
        clientPhone={job.job_contacts?.find((jc) => jc.role === "client")?.contact?.phone}
      />

      {/* ═══════════════════════════════════════
          WORKFLOW STEPPER
         ═══════════════════════════════════════ */}
      <div className="glass-card rounded-2xl p-5 animate-slide-up stagger-2">
        <p className="section-label mb-3">Workflow Progress</p>
        <InlineWorkflowSelector jobId={job.id} current={job.workflow_status || "scheduled"} variant="steps" />
      </div>

      {/* ═══════════════════════════════════════
          FINANCIAL KPIs
         ═══════════════════════════════════════ */}
      <div className="animate-slide-up stagger-3">
        <p className="section-label mb-3">💰 Keuangan</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {/* Gross */}
          <div className="glass-card glass-card-hover rounded-xl p-4 bg-gradient-to-br from-emerald-500/5 to-emerald-500/[0.02]">
            <div className="flex items-center gap-2 mb-2">
              <div className="gradient-icon gradient-icon-emerald !h-8 !w-8 !rounded-lg">
                <Banknote className="h-3.5 w-3.5" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Gross</p>
            </div>
            <p className="text-lg font-bold tabular-nums text-emerald-700">{formatCurrency(gross, job.currency)}</p>
          </div>

          {/* Paid */}
          <div className="glass-card glass-card-hover rounded-xl p-4 bg-gradient-to-br from-cyan-500/5 to-cyan-500/[0.02]">
            <div className="flex items-center gap-2 mb-2">
              <div className="gradient-icon gradient-icon-cyan !h-8 !w-8 !rounded-lg">
                <CircleDollarSign className="h-3.5 w-3.5" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Terbayar</p>
            </div>
            <p className="text-lg font-bold tabular-nums text-cyan-700">{formatCurrency(paid, job.currency)}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-border/50 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", payPercent >= 100 ? "bg-emerald-500" : payPercent >= 50 ? "bg-cyan-500" : "bg-amber-500")}
                  style={{ width: `${Math.min(payPercent, 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">{payPercent}%</span>
            </div>
          </div>

          {/* Expenses */}
          <div className="glass-card glass-card-hover rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="gradient-icon gradient-icon-amber !h-8 !w-8 !rounded-lg">
                <Receipt className="h-3.5 w-3.5" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Expenses</p>
            </div>
            <p className="text-lg font-bold tabular-nums">{formatCurrency(expenses, job.currency)}</p>
          </div>

          {/* Crew Fees */}
          <div className="glass-card glass-card-hover rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="gradient-icon gradient-icon-violet !h-8 !w-8 !rounded-lg">
                <Users2 className="h-3.5 w-3.5" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Crew Fees</p>
            </div>
            <p className="text-lg font-bold tabular-nums">{formatCurrency(crewFees, job.currency)}</p>
          </div>

          {/* Net Profit */}
          <div className={cn(
            "glass-card glass-card-hover rounded-xl p-4 bg-gradient-to-br",
            net >= 0 ? "from-emerald-500/5 to-emerald-500/[0.02]" : "from-red-500/5 to-red-500/[0.02]"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("gradient-icon !h-8 !w-8 !rounded-lg", net >= 0 ? "gradient-icon-emerald" : "gradient-icon-red")}>
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Net Profit</p>
            </div>
            <p className={cn("text-lg font-bold tabular-nums", net >= 0 ? "text-emerald-700" : "text-red-600")}>
              {formatCurrency(net, job.currency)}
            </p>
            {outstanding > 0 && (
              <p className="text-[10px] text-amber-600 mt-1">
                Sisa: {formatCurrency(outstanding, job.currency)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          JOB INFO + DELIVERY (2 columns)
         ═══════════════════════════════════════ */}
      <div className="grid gap-4 xl:grid-cols-2 animate-slide-up stagger-4">
        {/* Job Info */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="gradient-icon gradient-icon-blue !h-8 !w-8 !rounded-lg">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Info Pekerjaan</h3>
              <p className="text-xs text-muted-foreground">Detail dan rencana pemotretan</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Jenis Foto</p>
              <p className="mt-1 text-sm font-medium capitalize">{SHOOT_EMOJI[job.shoot_type]} {job.shoot_type.replace("_", " ")}</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Jadwal</p>
              <p className="mt-1 text-sm font-medium">{formatDateTime(job.start_at)}</p>
              {job.end_at && <p className="text-xs text-muted-foreground">s/d {formatDateTime(job.end_at)}</p>}
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Lokasi</p>
              <p className="mt-1 text-sm font-medium">{job.location || "Belum ditentukan"}</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Harga Klien</p>
              <p className="mt-1 text-sm font-medium">{formatCurrency(job.total_price, job.currency)}</p>
            </div>
          </div>

          {(job.concept || job.notes) && (
            <div className="mt-3 space-y-3">
              {job.concept && (
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Konsep</p>
                  <p className="mt-1 text-sm leading-relaxed">{job.concept}</p>
                </div>
              )}
              {job.notes && (
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Catatan</p>
                  <p className="mt-1 text-sm leading-relaxed">{job.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delivery Tracking */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="gradient-icon gradient-icon-cyan !h-8 !w-8 !rounded-lg">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Workflow & Pengiriman</h3>
              <p className="text-xs text-muted-foreground">Tracking progress produksi</p>
            </div>
          </div>

          {/* Visual workflow steps */}
          <div className="flex items-center gap-0 mb-5">
            {WORKFLOW_STEPS.map((step, i) => {
              const isActive = i === currentWorkflowIdx;
              const isCompleted = i < currentWorkflowIdx;
              return (
                <div key={step.value} className="flex items-center flex-1 last:flex-initial">
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn(
                      "workflow-step-dot",
                      isActive && "[data-active=true]",
                    )}
                      data-active={isActive ? "true" : "false"}
                      data-completed={isCompleted ? "true" : "false"}
                      data-inactive={!isActive && !isCompleted ? "true" : "false"}
                    >
                      {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.emoji}
                    </div>
                    <span className={cn(
                      "text-[9px] font-medium whitespace-nowrap",
                      isActive ? "text-primary" : "text-muted-foreground/50"
                    )}>
                      {step.label}
                    </span>
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className={cn(
                      "workflow-step-line mt-[-14px]",
                      i < currentWorkflowIdx ? "bg-primary/30" : "bg-border"
                    )} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Deadline Pengiriman</p>
              <p className="mt-1 text-sm font-medium">{job.delivery_deadline ? formatDateTime(job.delivery_deadline) : "—"}</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Tanggal Pengiriman</p>
              <p className="mt-1 text-sm font-medium">{job.actual_delivery_date ? formatDateTime(job.actual_delivery_date) : "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          TEAM ASSIGNMENTS
         ═══════════════════════════════════════ */}
      <div className="animate-slide-up stagger-5">
        <div className="flex items-center justify-between mb-3">
          <p className="section-label">👥 Tim & Assignment</p>
          <Link
            href={`/jobs/${job.id}/edit`}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Edit Assignment →
          </Link>
        </div>

        {job.job_contacts?.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {job.job_contacts.map((assignment) => {
              const isPhotographer = assignment.role === "fg_model" || assignment.role === "crew";
              const isClient = assignment.role === "client";
              const initials = (assignment.contact?.display_name || "?")
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              // Build WA template
              let waMessage = "";
              const fgContact = (job.job_contacts || []).find((jc) => jc.role === "fg_model" || jc.role === "crew");
              const fgName = fgContact?.contact?.display_name;

              if (isPhotographer && assignment.contact) {
                waMessage = getPhotographerJobTemplate(jobData, {
                  name: assignment.contact.display_name,
                  phone: assignment.contact.phone,
                  fee: assignment.fee_amount ? Number(assignment.fee_amount) : null
                });
              } else if (isClient && assignment.contact) {
                if (outstanding > 0) {
                  waMessage = getPaymentReminderTemplate(jobData, {
                    name: assignment.contact.display_name
                  }, { outstandingBalance: outstanding, currency: job.currency });
                } else {
                  waMessage = getClientReminderTemplate(jobData, {
                    name: assignment.contact.display_name,
                    phone: assignment.contact.phone
                  }, fgName);
                }
              }

              return (
                <div key={assignment.id} className="glass-card glass-card-hover rounded-xl overflow-hidden">
                  {/* Card Header */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      isClient
                        ? "bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700"
                        : isPhotographer
                        ? "bg-gradient-to-br from-emerald-100 to-cyan-100 text-emerald-700"
                        : "bg-gradient-to-br from-violet-100 to-blue-100 text-violet-700"
                    )}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{assignment.contact?.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {assignment.contact?.phone || "No phone"}
                        {assignment.fee_amount ? ` • Fee: ${formatCurrency(assignment.fee_amount, job.currency)}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="px-4 pb-3 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
                      {assignment.role.replace("_", " ")}
                    </span>
                    {assignment.is_primary && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Primary</span>
                    )}
                    {isPhotographer && (
                      <>
                        <ConfirmationBadge status={assignment.confirmation_status || "pending"} locale={locale} />
                        {assignment.fee_amount && (
                          <FeeStatusBadge status={assignment.fee_status || "unpaid"} locale={locale} />
                        )}
                      </>
                    )}
                    {assignment.send_reminder && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                        🔔 Reminder
                      </span>
                    )}
                  </div>

                  {/* Notes */}
                  {assignment.notes && (
                    <div className="px-4 pb-3">
                      <p className="text-xs text-muted-foreground italic">&quot;{assignment.notes}&quot;</p>
                    </div>
                  )}

                  {/* WhatsApp */}
                  {waMessage && (
                    <div className="px-4 pb-3 pt-1 border-t border-border/30">
                      <WhatsAppButtons
                        phone={assignment.contact?.phone || null}
                        message={waMessage}
                        locale={locale}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="Belum ada yang ditugaskan" description="Edit pekerjaan untuk menambahkan tim." ctaHref={`/jobs/${job.id}/edit`} ctaLabel="Edit job" />
        )}
      </div>

      {/* ═══════════════════════════════════════
          PAYMENTS + EXPENSES (2 columns)
         ═══════════════════════════════════════ */}
      <div className="grid gap-4 xl:grid-cols-2 animate-slide-up stagger-6">
        {/* Payments */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="gradient-icon gradient-icon-emerald !h-8 !w-8 !rounded-lg">
                <Wallet className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Pembayaran</h3>
                <p className="text-xs text-muted-foreground">DP dan pelunasan</p>
              </div>
            </div>
            <Link
              href={`/payments/new?jobId=${job.id}`}
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              + Tambah
            </Link>
          </div>

          {job.payments?.length ? (
            <div className="space-y-2">
              {job.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{payment.payment_type.toUpperCase()}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDate(payment.payment_date)} • {payment.payment_method.replace("_", " ")}
                    </p>
                  </div>
                  <p className="text-sm font-bold tabular-nums text-emerald-700 shrink-0">
                    {formatCurrency(payment.amount, job.currency)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 rounded-xl border border-dashed border-border">
              <p className="text-xs text-muted-foreground">Belum ada pembayaran</p>
              <Link
                href={`/payments/new?jobId=${job.id}`}
                className="mt-2 inline-block text-xs font-medium text-primary"
              >
                + Catat pembayaran pertama
              </Link>
            </div>
          )}
        </div>

        {/* Expenses */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="gradient-icon gradient-icon-amber !h-8 !w-8 !rounded-lg">
                <Receipt className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Pengeluaran</h3>
                <p className="text-xs text-muted-foreground">Biaya yang mempengaruhi net profit</p>
              </div>
            </div>
            <Link
              href={`/expenses/new?jobId=${job.id}`}
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              + Tambah
            </Link>
          </div>

          {job.expenses?.length ? (
            <div className="space-y-2">
              {job.expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium capitalize">{expense.category.replace("_", " ")}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDate(expense.expense_date)}
                      {expense.vendor_contact?.display_name ? ` • ${expense.vendor_contact.display_name}` : ""}
                    </p>
                  </div>
                  <p className="text-sm font-bold tabular-nums text-amber-700 shrink-0">
                    {formatCurrency(expense.amount, job.currency)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 rounded-xl border border-dashed border-border">
              <p className="text-xs text-muted-foreground">Belum ada pengeluaran</p>
              <Link
                href={`/expenses/new?jobId=${job.id}`}
                className="mt-2 inline-block text-xs font-medium text-primary"
              >
                + Catat pengeluaran pertama
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          REMINDERS
         ═══════════════════════════════════════ */}
      <div className="animate-slide-up stagger-7">
        <p className="section-label mb-3">🔔 Pengingat</p>

        {job.reminders?.length ? (
          <div className="glass-card rounded-2xl p-5 space-y-2">
            {job.reminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{formatDateTime(reminder.scheduled_for)}</p>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      reminder.status === "pending" ? "bg-amber-50 text-amber-700" :
                      reminder.status === "sent" ? "bg-emerald-50 text-emerald-700" :
                      reminder.status === "failed" ? "bg-red-50 text-red-700" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {reminder.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {(reminder.recipient_name || reminder.target_type).replace("_", " ")} • {reminder.channel}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{reminder.message}</p>
                </div>
                {reminder.status === "pending" && (
                  <form action={cancelReminderAction.bind(null, reminder.id, job.id)}>
                    <button className={buttonVariants({ variant: "ghost", size: "sm" })} type="submit">
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-5">
            <div className="text-center py-4">
              <BellOff className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Pengingat akan otomatis dibuat setelah jadwal dan kontak disimpan.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
