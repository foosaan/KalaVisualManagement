import { cn } from "@/lib/utils";
import type { AssignmentStatusType } from "@/lib/queries/conflicts";

const ASSIGNMENT_STYLES: Record<AssignmentStatusType, { bg: string; text: string; border: string; icon: string }> = {
  unassigned: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    icon: "○"
  },
  assigned: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: "→"
  },
  waiting_confirmation: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: "◔"
  },
  confirmed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: "✓"
  },
  need_replacement: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: "↻"
  },
  conflict: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: "✕"
  }
};

const ASSIGNMENT_LABELS: Record<AssignmentStatusType, { id: string; en: string }> = {
  unassigned: { id: "Belum Ditugaskan", en: "Unassigned" },
  assigned: { id: "Ditugaskan", en: "Assigned" },
  waiting_confirmation: { id: "Menunggu Konfirmasi", en: "Waiting Confirmation" },
  confirmed: { id: "Dikonfirmasi", en: "Confirmed" },
  need_replacement: { id: "Perlu Pengganti", en: "Need Replacement" },
  conflict: { id: "Bentrok", en: "Conflict" }
};

type AssignmentStatusBadgeProps = {
  status: AssignmentStatusType;
  locale?: "id" | "en";
  className?: string;
  size?: "sm" | "md";
};

export function AssignmentStatusBadge({ status, locale = "id", className, size = "sm" }: AssignmentStatusBadgeProps) {
  const style = ASSIGNMENT_STYLES[status];
  const label = ASSIGNMENT_LABELS[status][locale];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        style.bg,
        style.text,
        style.border,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        className
      )}
    >
      <span className="text-[9px]">{style.icon}</span>
      {label}
    </span>
  );
}

// ── Confirmation status badge (per-person) ────────────────────

type ConfirmationStatus = "pending" | "accepted" | "declined" | "tentative";

const CONFIRMATION_STYLES: Record<ConfirmationStatus, { bg: string; text: string; border: string }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  accepted: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  declined: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  tentative: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" }
};

const CONFIRMATION_LABELS: Record<ConfirmationStatus, { id: string; en: string }> = {
  pending: { id: "Menunggu", en: "Pending" },
  accepted: { id: "Diterima", en: "Accepted" },
  declined: { id: "Ditolak", en: "Declined" },
  tentative: { id: "Tentatif", en: "Tentative" }
};

type ConfirmationBadgeProps = {
  status: ConfirmationStatus;
  locale?: "id" | "en";
  className?: string;
};

export function ConfirmationBadge({ status, locale = "id", className }: ConfirmationBadgeProps) {
  const style = CONFIRMATION_STYLES[status];
  const label = CONFIRMATION_LABELS[status][locale];

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", style.bg, style.text, style.border, className)}>
      {label}
    </span>
  );
}

// ── Fee status badge (simplified: unpaid / paid) ──────────────

type FeePaymentStatus = "unpaid" | "paid";

const FEE_STYLES: Record<FeePaymentStatus, { bg: string; text: string; border: string }> = {
  unpaid: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  paid: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" }
};

const FEE_LABELS: Record<FeePaymentStatus, { id: string; en: string }> = {
  unpaid: { id: "Belum Dibayar", en: "Unpaid" },
  paid: { id: "Lunas", en: "Paid" }
};

type FeeStatusBadgeProps = {
  status: FeePaymentStatus;
  locale?: "id" | "en";
  className?: string;
};

export function FeeStatusBadge({ status, locale = "id", className }: FeeStatusBadgeProps) {
  const style = FEE_STYLES[status];
  const label = FEE_LABELS[status][locale];

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", style.bg, style.text, style.border, className)}>
      {label}
    </span>
  );
}

// ── Workflow status badge (5 steps) ───────────────────────────

type WorkflowStatusType = "scheduled" | "shot" | "editing" | "ready" | "delivered";

const WORKFLOW_LABELS: Record<WorkflowStatusType, { id: string; en: string }> = {
  scheduled: { id: "Dijadwalkan", en: "Scheduled" },
  shot: { id: "Selesai Foto", en: "Shot" },
  editing: { id: "Editing", en: "Editing" },
  ready: { id: "Siap Kirim", en: "Ready" },
  delivered: { id: "Terkirim", en: "Delivered" }
};

const WORKFLOW_STEPS: WorkflowStatusType[] = ["scheduled", "shot", "editing", "ready", "delivered"];

type WorkflowStatusBadgeProps = {
  status: WorkflowStatusType;
  locale?: "id" | "en";
  className?: string;
};

export function WorkflowStatusBadge({ status, locale = "id", className }: WorkflowStatusBadgeProps) {
  const stepIndex = WORKFLOW_STEPS.indexOf(status);
  const isLate = stepIndex >= 3;
  const isMid = stepIndex >= 1 && stepIndex < 3;

  const bg = isLate ? "bg-emerald-50" : isMid ? "bg-cyan-50" : "bg-slate-50";
  const text = isLate ? "text-emerald-700" : isMid ? "text-cyan-700" : "text-slate-600";
  const border = isLate ? "border-emerald-200" : isMid ? "border-cyan-200" : "border-slate-200";
  const label = WORKFLOW_LABELS[status][locale];

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", bg, text, border, className)}>
      {label}
    </span>
  );
}

/**
 * Workflow progress bar — 5-step visual indicator
 */
type WorkflowProgressProps = {
  current: WorkflowStatusType;
  locale?: "id" | "en";
};

export function WorkflowProgress({ current, locale = "id" }: WorkflowProgressProps) {
  const currentIndex = WORKFLOW_STEPS.indexOf(current);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {WORKFLOW_STEPS.map((step, index) => (
          <div key={step} className="flex items-center gap-1.5">
            <div
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-colors",
                index <= currentIndex ? "bg-primary" : "bg-muted"
              )}
              title={WORKFLOW_LABELS[step][locale]}
            />
            {index < WORKFLOW_STEPS.length - 1 && (
              <div className={cn("h-0.5 w-5 rounded-full", index < currentIndex ? "bg-primary" : "bg-muted")} />
            )}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground">
        {currentIndex + 1}/{WORKFLOW_STEPS.length} — {WORKFLOW_LABELS[current][locale]}
      </p>
    </div>
  );
}
