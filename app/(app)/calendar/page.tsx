import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";

import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { getCalendarData } from "@/lib/queries/calendar";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { buttonVariants } from "@/components/ui/button";

type CalendarPageProps = {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const locale = await getLocale();
  const now = new Date();
  const year = params.year ? parseInt(params.year, 10) : now.getFullYear();
  const month = params.month ? parseInt(params.month, 10) : now.getMonth();

  const { jobs } = await getCalendarData(year, month);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="gradient-icon gradient-icon-blue">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("calendar.title", locale)}</h1>
            <p className="text-xs text-muted-foreground">{t("calendar.description", locale)}</p>
          </div>
        </div>
        <Link href="/jobs/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          {t("jobs.createJob", locale)}
        </Link>
      </div>

      <div className="glass-card rounded-2xl p-4 sm:p-5 overflow-hidden">
        <CalendarGrid jobs={jobs} month={month} year={year} />
      </div>
    </div>
  );
}
