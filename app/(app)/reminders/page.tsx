import {
  Bell,
  BellOff,
  Search
} from "lucide-react";

import { cancelReminderAction } from "@/lib/actions/reminders";
import { getRemindersPageData } from "@/lib/queries/reminders";
import { formatDateTime } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", icon: "⏳" },
  sent: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "✅" },
  failed: { bg: "bg-red-50", text: "text-red-700", icon: "❌" },
  cancelled: { bg: "bg-muted", text: "text-muted-foreground", icon: "🚫" }
};

type RemindersPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function RemindersPage({ searchParams }: RemindersPageProps) {
  const { status = "all" } = await searchParams;
  const reminders = await getRemindersPageData();
  const filteredReminders =
    status === "all" ? reminders : reminders.filter((reminder) => reminder.status === status);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="gradient-icon gradient-icon-amber">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Pengingat</h1>
          <p className="text-xs text-muted-foreground">Reminder otomatis dari jadwal pekerjaan.</p>
        </div>
      </div>

      {/* ── Filter ── */}
      <div className="glass-card rounded-2xl p-4">
        <form className="grid gap-3 sm:grid-cols-[160px_auto]">
          <Select
            defaultValue={status}
            name="status"
            options={[
              { label: "Semua Status", value: "all" },
              { label: "⏳ Pending", value: "pending" },
              { label: "✅ Sent", value: "sent" },
              { label: "❌ Failed", value: "failed" },
              { label: "🚫 Cancelled", value: "cancelled" }
            ]}
          />
          <button className={buttonVariants({ variant: "outline", size: "default" })} type="submit">
            Filter
          </button>
        </form>
      </div>

      {/* ── Results ── */}
      {filteredReminders.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {filteredReminders.length} pengingat
        </p>
      )}

      {/* ── Reminder Cards ── */}
      {filteredReminders.length === 0 ? (
        <EmptyState
          title={reminders.length === 0 ? "Belum ada pengingat" : "Tidak ada pengingat dengan status ini"}
          description={
            reminders.length === 0
              ? "Buat atau update pekerjaan untuk auto-generate pengingat."
              : "Coba filter lain."
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredReminders.map((reminder, i) => {
            const statusCfg = STATUS_CONFIG[reminder.status] || STATUS_CONFIG.pending;
            return (
              <div
                key={reminder.id}
                className={cn(
                  "group glass-card glass-card-hover rounded-xl px-4 py-3 animate-slide-up",
                  i < 8 ? `stagger-${i + 1}` : ""
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Status icon */}
                  <span className="text-xl shrink-0">{statusCfg.icon}</span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate">{reminder.jobs?.title || "—"}</p>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", statusCfg.bg, statusCfg.text)}>
                        {reminder.status}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {reminder.reminder_type.replace("_", "-")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDateTime(reminder.scheduled_for)} • {reminder.recipient_name || reminder.target_contact?.display_name || "Self"} • {reminder.channel}
                    </p>
                    {reminder.message && (
                      <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1 italic">
                        "{reminder.message}"
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  {reminder.status === "pending" ? (
                    <form action={cancelReminderAction.bind(null, reminder.id, reminder.job_id)}>
                      <button
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                        type="submit"
                      >
                        Batal
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
