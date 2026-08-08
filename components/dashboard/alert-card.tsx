import Link from "next/link";
import { AlertCircle, CalendarClock, Clock, Users2, Wallet } from "lucide-react";

import { type Locale, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDateTime } from "@/lib/utils";

// ── Types ──
type UnassignedJob = {
  job_id: string;
  title: string;
  start_at: string;
};

type UpcomingDeadline = {
  job_id: string;
  title: string;
  deadline_type: string;
  deadline: string;
};

type UnpaidFee = {
  job_id: string;
  title: string;
  total_crew_fees: number;
};

type PendingReminder = {
  id: string;
  message: string | null;
  reminder_type: string;
  recipient_name: string | null;
  scheduled_for: string;
  target_type: string | null;
  status: string;
  job: { id: string; title: string } | null;
};

// ── Config ──
type AlertVariant = "amber" | "red" | "violet" | "cyan";

const variantStyles: Record<AlertVariant, {
  bg: string;
  border: string;
  dotColor: string;
  iconBg: string;
  titleColor: string;
  hoverBg: string;
}> = {
  amber: {
    bg: "bg-amber-50/60",
    border: "border-amber-200/50",
    dotColor: "bg-amber-400",
    iconBg: "gradient-icon-amber",
    titleColor: "text-amber-700",
    hoverBg: "hover:bg-amber-50/90"
  },
  red: {
    bg: "bg-red-50/60",
    border: "border-red-200/50",
    dotColor: "bg-red-400",
    iconBg: "gradient-icon-red",
    titleColor: "text-red-700",
    hoverBg: "hover:bg-red-50/90"
  },
  violet: {
    bg: "bg-violet-50/60",
    border: "border-violet-200/50",
    dotColor: "bg-violet-400",
    iconBg: "gradient-icon-violet",
    titleColor: "text-violet-700",
    hoverBg: "hover:bg-violet-50/90"
  },
  cyan: {
    bg: "bg-cyan-50/60",
    border: "border-cyan-200/50",
    dotColor: "bg-cyan-400",
    iconBg: "gradient-icon-cyan",
    titleColor: "text-cyan-700",
    hoverBg: "hover:bg-cyan-50/90"
  }
};

// ── Main Component ──
type AlertSectionProps = {
  unassignedJobs: UnassignedJob[];
  upcomingDeadlines: UpcomingDeadline[];
  unpaidFees: UnpaidFee[];
  pendingReminders: PendingReminder[];
  locale: Locale;
};

export function AlertSection({
  unassignedJobs,
  upcomingDeadlines,
  unpaidFees,
  pendingReminders,
  locale
}: AlertSectionProps) {
  const alerts: React.ReactNode[] = [];

  // Unassigned Jobs
  if (unassignedJobs.length > 0) {
    alerts.push(
      <AlertCard
        key="unassigned"
        variant="amber"
        icon={Users2}
        title={locale === "id" ? "Job Belum Ditugaskan" : "Unassigned Jobs"}
        count={unassignedJobs.length}
        locale={locale}
      >
        {unassignedJobs.map((job) => (
          <Link
            key={job.job_id}
            href={`/jobs/${job.job_id}`}
            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-amber-100/60"
          >
            <p className="truncate text-sm font-medium">{job.title}</p>
            <p className="shrink-0 text-[11px] text-muted-foreground">{formatDateTime(job.start_at)}</p>
          </Link>
        ))}
      </AlertCard>
    );
  }

  // Upcoming Deadlines
  if (upcomingDeadlines.length > 0) {
    alerts.push(
      <AlertCard
        key="deadlines"
        variant="red"
        icon={Clock}
        title={locale === "id" ? "Deadline Terdekat" : "Upcoming Deadlines"}
        count={upcomingDeadlines.length}
        locale={locale}
      >
        {upcomingDeadlines.map((dl, i) => (
          <Link
            key={i}
            href={`/jobs/${dl.job_id}`}
            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-red-100/60"
          >
            <p className="truncate text-sm font-medium">{dl.title}</p>
            <span className="shrink-0 rounded-full bg-red-100 border border-red-200 px-2 py-0.5 text-[10px] font-medium text-red-700">
              {formatDateTime(dl.deadline)}
            </span>
          </Link>
        ))}
      </AlertCard>
    );
  }

  // Unpaid Crew Fees
  if (unpaidFees.length > 0) {
    alerts.push(
      <AlertCard
        key="fees"
        variant="violet"
        icon={Wallet}
        title={locale === "id" ? "Fee Crew/Freelance" : "Crew/Freelance Fees"}
        count={unpaidFees.length}
        locale={locale}
      >
        {unpaidFees.map((fee) => (
          <Link
            key={fee.job_id}
            href={`/jobs/${fee.job_id}`}
            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-violet-100/60"
          >
            <p className="truncate text-sm font-medium">{fee.title}</p>
            <p className="shrink-0 text-sm font-semibold tabular-nums text-violet-700">
              {formatCurrency(fee.total_crew_fees)}
            </p>
          </Link>
        ))}
      </AlertCard>
    );
  }

  // Pending Reminders
  if (pendingReminders.length > 0) {
    alerts.push(
      <AlertCard
        key="reminders"
        variant="cyan"
        icon={CalendarClock}
        title={t("dashboard.pendingReminders", locale)}
        count={pendingReminders.length}
        locale={locale}
      >
        {pendingReminders.map((reminder) => (
          <div
            key={reminder.id}
            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{reminder.job?.title}</p>
              <p className="text-[11px] text-muted-foreground">
                {reminder.recipient_name || reminder.target_type}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-cyan-100 border border-cyan-200 px-2 py-0.5 text-[10px] font-medium text-cyan-700">
              {reminder.reminder_type.replace("_", "-")}
            </span>
          </div>
        ))}
      </AlertCard>
    );
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-muted-foreground/60" />
        <h2 className="section-label">{t("dashboard.activeAlerts", locale)}</h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {alerts}
      </div>
    </div>
  );
}

// ── Alert Card ──
type AlertCardProps = {
  variant: AlertVariant;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count: number;
  locale: Locale;
  children: React.ReactNode;
};

function AlertCard({ variant, icon: Icon, title, count, children }: AlertCardProps) {
  const style = variantStyles[variant];

  return (
    <div className={cn(
      "rounded-2xl border p-5 animate-scale-in",
      style.bg,
      style.border
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("gradient-icon !w-10 !h-10 !rounded-xl", style.iconBg)}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className={cn("text-sm font-semibold", style.titleColor)}>{title}</h3>
          <p className="text-[11px] text-muted-foreground">{count} item</p>
        </div>
        <div className={cn("ml-auto h-2.5 w-2.5 rounded-full animate-glow-pulse", style.dotColor)} />
      </div>

      {/* Items */}
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );
}
