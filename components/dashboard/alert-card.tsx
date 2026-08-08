import Link from "next/link";
import { AlertCircle, CalendarClock, Clock, Users2, Wallet, ArrowRight } from "lucide-react";

import { type Locale, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDateTime } from "@/lib/utils";

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
    bg: "bg-amber-500/5",
    border: "border-amber-500/20",
    dotColor: "bg-amber-400",
    iconBg: "gradient-icon-amber",
    titleColor: "text-amber-700 dark:text-amber-400",
    hoverBg: "hover:bg-amber-500/10"
  },
  red: {
    bg: "bg-rose-500/5",
    border: "border-rose-500/20",
    dotColor: "bg-rose-400",
    iconBg: "gradient-icon-red",
    titleColor: "text-rose-700 dark:text-rose-400",
    hoverBg: "hover:bg-rose-500/10"
  },
  violet: {
    bg: "bg-violet-500/5",
    border: "border-violet-500/20",
    dotColor: "bg-violet-400",
    iconBg: "gradient-icon-violet",
    titleColor: "text-violet-700 dark:text-violet-400",
    hoverBg: "hover:bg-violet-500/10"
  },
  cyan: {
    bg: "bg-cyan-500/5",
    border: "border-cyan-500/20",
    dotColor: "bg-cyan-400",
    iconBg: "gradient-icon-cyan",
    titleColor: "text-cyan-700 dark:text-cyan-400",
    hoverBg: "hover:bg-cyan-500/10"
  }
};

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
        title={locale === "id" ? "Job Belum Ada Fotografer" : "Unassigned Jobs"}
        count={unassignedJobs.length}
        locale={locale}
      >
        {unassignedJobs.map((job) => (
          <Link
            key={job.job_id}
            href={`/jobs/${job.job_id}`}
            className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-amber-500/10 text-xs"
          >
            <p className="truncate font-semibold text-foreground">{job.title}</p>
            <p className="shrink-0 text-muted-foreground">{formatDateTime(job.start_at)}</p>
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
        title={locale === "id" ? "Deadline Edit Terdekat" : "Upcoming Deadlines"}
        count={upcomingDeadlines.length}
        locale={locale}
      >
        {upcomingDeadlines.map((dl, i) => (
          <Link
            key={i}
            href={`/jobs/${dl.job_id}`}
            className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-rose-500/10 text-xs"
          >
            <p className="truncate font-semibold text-foreground">{dl.title}</p>
            <span className="shrink-0 rounded-full bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-400">
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
        title={locale === "id" ? "Fee Kru & Freelance" : "Crew/Freelance Fees"}
        count={unpaidFees.length}
        locale={locale}
      >
        {unpaidFees.map((fee) => (
          <Link
            key={fee.job_id}
            href={`/jobs/${fee.job_id}`}
            className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-violet-500/10 text-xs"
          >
            <p className="truncate font-semibold text-foreground">{fee.title}</p>
            <p className="shrink-0 font-bold tabular-nums text-violet-700 dark:text-violet-400">
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
            className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{reminder.job?.title}</p>
              <p className="text-[11px] text-muted-foreground">
                {reminder.recipient_name || reminder.target_type}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-700 dark:text-cyan-400">
              {reminder.reminder_type.replace("_", "-")}
            </span>
          </div>
        ))}
      </AlertCard>
    );
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-emerald-600" />
        <h2 className="text-sm font-bold text-foreground">Status Operasional & Perhatian Studio</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {alerts}
      </div>
    </div>
  );
}

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
      "glass-card rounded-2xl border p-4 shadow-sm animate-scale-up space-y-2.5",
      style.bg,
      style.border
    )}>
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border/50 pb-2">
        <div className={cn("gradient-icon !w-8 !h-8 !rounded-lg", style.iconBg)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn("text-xs font-bold truncate", style.titleColor)}>{title}</h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {count} item
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}
