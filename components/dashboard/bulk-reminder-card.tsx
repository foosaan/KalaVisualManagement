"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  MessageSquare,
  Send,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type UpcomingJobReminder = {
  id: string;
  title: string;
  shootType: string;
  startAt: string;
  location: string | null;
  clientName: string;
  clientPhone: string | null;
  whatsAppText: string;
  whatsAppUrl: string;
};

type BulkReminderCardProps = {
  upcomingJobs: UpcomingJobReminder[];
};

export function BulkReminderCard({ upcomingJobs }: BulkReminderCardProps) {
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});

  if (!upcomingJobs || upcomingJobs.length === 0) {
    return null;
  }

  const handleMarkSent = (jobId: string) => {
    setSentMap((prev) => ({ ...prev, [jobId]: true }));
  };

  return (
    <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent p-5 space-y-4 shadow-xl animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-md shadow-emerald-500/20">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">
                Blast Reminder H-1 & Konfirmasi Jadwal
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                <Sparkles className="h-3 w-3" /> {upcomingJobs.length} Klien Terdekat
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Kirim pengingat titik kumpul & perlengkapan ke klien dengan 1-klik WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* List of upcoming clients needing reminder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {upcomingJobs.map((job) => {
          const isSent = sentMap[job.id];
          const dateStr = new Date(job.startAt).toLocaleDateString("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short"
          });
          const timeStr = new Date(job.startAt).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit"
          });

          return (
            <div
              key={job.id}
              className="rounded-2xl border border-border/70 bg-card p-4 space-y-3 shadow-xs hover:border-emerald-500/40 transition flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground line-clamp-1">
                    {job.clientName}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full capitalize">
                    🎓 {job.shootType}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                  <span>{dateStr} • {timeStr} WIB</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground line-clamp-1">
                  <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">{job.location || "Lokasi belum diatur"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <a
                  href={job.whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleMarkSent(job.id)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold py-2 transition shadow-xs ${
                    isSent
                      ? "bg-muted text-muted-foreground border border-border"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                  }`}
                >
                  {isSent ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Terkirim
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Kirim Reminder WA
                      <ExternalLink className="h-3 w-3 ml-0.5" />
                    </>
                  )}
                </a>

                <Link
                  href={`/jobs/${job.id}`}
                  className="rounded-xl border border-border bg-background p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition"
                  title="Lihat Detail Job"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
