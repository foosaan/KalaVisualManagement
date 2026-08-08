import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Receipt
} from "lucide-react";

import { DatabaseSetupState } from "@/components/layout/database-setup-state";
import { GreetingHero } from "@/components/dashboard/greeting-hero";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { MonthlyChart } from "@/components/dashboard/monthly-chart";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { UnpaidProgressCard } from "@/components/dashboard/unpaid-progress-card";
import { AlertSection } from "@/components/dashboard/alert-card";
import { BulkReminderCard } from "@/components/dashboard/bulk-reminder-card";

import { getDashboardData } from "@/lib/queries/dashboard";
import { getLocale } from "@/lib/locale";
import { requireUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const dashboardData = await getDashboardData();
  const locale = await getLocale();
  const { user } = await requireUser();

  if (dashboardData.setupRequired) {
    return (
      <DatabaseSetupState
        firstErrorMessage={dashboardData.firstErrorMessage}
        missingResources={dashboardData.missingResources}
      />
    );
  }

  const {
    upcomingJobs,
    pendingReminders,
    summary,
    unpaidJobs,
    monthlyTrend,
    unassignedJobs,
    unpaidFees,
    upcomingDeadlines
  } = dashboardData;

  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.business_name ||
    null;

  const formattedUpcomingReminders = (upcomingJobs || []).map((j: any) => {
    const clientName = j.client_contact?.display_name || "Klien";
    const clientPhone = j.client_contact?.phone || "";
    const dateStr = new Date(j.start_at).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
    const timeStr = new Date(j.start_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    const whatsAppText = `Halo Kak ${clientName} 🎓✨

Mengingatkan jadwal sesi foto wisuda bersama *Po.Graduation* terdekat:
📅 *Tanggal:* ${dateStr}
⏰ *Waktu:* ${timeStr} WIB
📍 *Lokasi:* ${j.location || "Kampus"}

📌 *Catatan & Persiapan:*
1. Jangan lupa bawa toga, selempang, dan atribut wisuda.
2. Harap hadir tepat waktu (waktu foto menyesuaikan sisa durasi jika terlambat).
3. Fotografer kami siap stand by di lokasi 15 menit sebelum sesi dimulai.

Sampai jumpa di lokasi ya Kak! 🙏✨
_Po.Graduation Photography_`;

    const cleanPhone = clientPhone.replace(/[^0-9]/g, "");
    const targetPhone = cleanPhone.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;
    const whatsAppUrl = targetPhone
      ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(whatsAppText)}`
      : `https://wa.me/?text=${encodeURIComponent(whatsAppText)}`;

    return {
      id: j.id,
      title: j.title,
      shootType: j.shoot_type,
      startAt: j.start_at,
      location: j.location,
      clientName,
      clientPhone,
      whatsAppText,
      whatsAppUrl
    };
  });

  return (
    <div className="space-y-8">
      {/* ── Hero Greeting ── */}
      <GreetingHero
        name={userName}
        locale={locale}
        upcomingCount={summary.upcomingCount}
        unpaidCount={summary.unpaidCount}
      />

      {/* ── Bulk Reminder Blast Widget (If upcoming shoots exist) ── */}
      {formattedUpcomingReminders.length > 0 && (
        <BulkReminderCard upcomingJobs={formattedUpcomingReminders} />
      )}

      {/* ── Quick Actions ── */}
      <QuickActions locale={locale} />

      {/* ── KPI Summary Cards ── */}
      <div>
        <p className="section-label mb-3">{t("dashboard.todaySummary", locale)}</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            accent="emerald"
            iconName="banknote"
            label={t("dashboard.grossThisMonth", locale)}
            value={formatCurrency(summary.totalGross)}
            helper={t("dashboard.totalAgreedPrice", locale)}
            index={1}
            href="/finance"
          />
          <SummaryCard
            accent="cyan"
            iconName="dollar"
            label={t("dashboard.netThisMonth", locale)}
            value={formatCurrency(summary.totalNet)}
            helper={t("dashboard.afterExpenses", locale)}
            index={2}
            href="/finance"
          />
          <SummaryCard
            accent="amber"
            iconName="receipt"
            label={t("dashboard.unpaidJobs", locale)}
            value={String(summary.unpaidCount)}
            helper={t("dashboard.needFollowUp", locale)}
            index={3}
            href="/payments"
          />
          <SummaryCard
            iconName="calendar"
            label={t("dashboard.upcomingShoots", locale)}
            value={String(summary.upcomingCount)}
            helper={t("dashboard.next7Days", locale)}
            index={4}
            href="/calendar"
          />
        </div>

        {/* Secondary KPIs */}
        {(summary.unassignedCount > 0 || summary.deadlineCount > 0) && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
            {summary.unassignedCount > 0 && (
              <SummaryCard
                accent="amber"
                iconName="users"
                label={locale === "id" ? "Belum Ditugaskan" : "Unassigned"}
                value={String(summary.unassignedCount)}
                helper={locale === "id" ? "Job belum ada fotografer" : "Jobs without photographer"}
                index={5}
                href="/jobs?status=confirmed"
              />
            )}
            {summary.deadlineCount > 0 && (
              <SummaryCard
                accent="red"
                iconName="clock"
                label={locale === "id" ? "Deadline Dekat" : "Upcoming Deadlines"}
                value={String(summary.deadlineCount)}
                helper={locale === "id" ? "Dalam 3 hari ke depan" : "Within next 3 days"}
                index={6}
                href="/jobs"
              />
            )}
          </div>
        )}
      </div>

      {/* ── Revenue Chart ── */}
      <MonthlyChart data={monthlyTrend} locale={locale} />

      {/* ── Main Content Grid: Timeline + Unpaid ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Shoots Timeline */}
        <div className="animate-slide-up stagger-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-muted-foreground/60" />
              <h2 className="section-label">{t("dashboard.upcomingShoots", locale)}</h2>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              {t("dashboard.viewAll", locale)}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ActivityTimeline jobs={upcomingJobs as any} locale={locale} />
        </div>

        {/* Unpaid Jobs */}
        <div className="animate-slide-up stagger-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground/60" />
              <h2 className="section-label">{t("dashboard.unpaidJobsTitle", locale)}</h2>
            </div>
            <Link
              href="/payments"
              className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
            >
              {t("dashboard.viewAll", locale)}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <UnpaidProgressCard jobs={unpaidJobs as any} locale={locale} />
        </div>
      </div>

      {/* ── Alert Section ── */}
      <AlertSection
        unassignedJobs={unassignedJobs}
        upcomingDeadlines={upcomingDeadlines}
        unpaidFees={unpaidFees}
        pendingReminders={pendingReminders}
        locale={locale}
      />
    </div>
  );
}
