import { cn } from "@/lib/utils";
import type { ConflictType } from "@/lib/queries/conflicts";

const CONFLICT_STYLES: Record<ConflictType | "safe", { bg: string; text: string; border: string; icon: string }> = {
  safe: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: "✓"
  },
  parallel: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    icon: "⇄"
  },
  warning_unassigned: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: "⚠"
  },
  warning_tight_schedule: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: "⏱"
  },
  conflict: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: "✕"
  }
};

const CONFLICT_LABELS: Record<ConflictType | "safe", { id: string; en: string }> = {
  safe: { id: "Aman", en: "Safe" },
  parallel: { id: "Parallel Job", en: "Parallel Job" },
  warning_unassigned: { id: "Belum Ada Fotografer", en: "No Photographer" },
  warning_tight_schedule: { id: "Jadwal Mepet", en: "Tight Schedule" },
  conflict: { id: "Bentrok!", en: "Conflict!" }
};

type ConflictBadgeProps = {
  type: ConflictType | "safe";
  locale?: "id" | "en";
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md";
};

export function ConflictBadge({ type, locale = "id", className, showIcon = true, size = "sm" }: ConflictBadgeProps) {
  const style = CONFLICT_STYLES[type];
  const label = CONFLICT_LABELS[type][locale];

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
      {showIcon && <span className="text-[9px]">{style.icon}</span>}
      {label}
    </span>
  );
}

type ConflictBannerProps = {
  type: ConflictType;
  message: string;
  locale?: "id" | "en";
  className?: string;
};

export function ConflictBanner({ type, message, locale = "id", className }: ConflictBannerProps) {
  const style = CONFLICT_STYLES[type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4",
        style.bg,
        style.border,
        className
      )}
    >
      <span className="mt-0.5 text-lg">{style.icon}</span>
      <div className="min-w-0">
        <p className={cn("text-sm font-semibold", style.text)}>
          {CONFLICT_LABELS[type][locale]}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
