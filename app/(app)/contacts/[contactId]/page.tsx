import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Users2
} from "lucide-react";

import { getContactById, getContactJobHistory } from "@/lib/queries/contacts";
import { getLocale } from "@/lib/locale";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { JobStatusBadge } from "@/components/jobs/job-status-badge";
import { WorkflowStatusBadge } from "@/components/jobs/assignment-status-badge";
import { cn } from "@/lib/utils";

const ROLE_STYLE: Record<string, { bg: string; text: string; avatar: string }> = {
  client: { bg: "bg-amber-50", text: "text-amber-700", avatar: "from-amber-400 to-orange-500" },
  fg_model: { bg: "bg-emerald-50", text: "text-emerald-700", avatar: "from-emerald-400 to-cyan-500" },
  crew: { bg: "bg-blue-50", text: "text-blue-700", avatar: "from-blue-400 to-indigo-500" },
  editor: { bg: "bg-violet-50", text: "text-violet-700", avatar: "from-violet-400 to-purple-500" },
  vendor: { bg: "bg-cyan-50", text: "text-cyan-700", avatar: "from-cyan-400 to-teal-500" },
  other: { bg: "bg-slate-50", text: "text-slate-600", avatar: "from-slate-400 to-gray-500" }
};

const SHOOT_EMOJI: Record<string, string> = {
  portrait: "📷", prewedding: "💍", wedding: "👰", graduation: "🎓",
  brand: "📦", event: "🎤", family: "👨‍👩‍👧‍👦", other: "✨"
};

type ContactDetailPageProps = {
  params: Promise<{
    contactId: string;
  }>;
};

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { contactId } = await params;
  const locale = await getLocale();
  const contact = await getContactById(contactId);

  if (!contact) {
    notFound();
  }

  const jobHistory = await getContactJobHistory(contactId);

  const totalJobs = jobHistory.length;
  const totalFeeEarned = jobHistory.reduce((sum, jc) => sum + Number(jc.fee_amount ?? 0), 0);
  const unpaidFees = jobHistory.filter((jc) => jc.fee_status === "unpaid" && Number(jc.fee_amount ?? 0) > 0).length;

  const style = ROLE_STYLE[contact.kind] || ROLE_STYLE.other;
  const initials = contact.display_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ═══════════════════════════════════════
          HERO HEADER
         ═══════════════════════════════════════ */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-6 text-white animate-slide-up">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <Link
            href="/contacts"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/contacts/${contactId}/edit`}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/20 hover:text-white"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Link>
          </div>
        </div>

        {/* Avatar + Name */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-bold text-white shadow-lg",
            style.avatar
          )}>
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight truncate">{contact.display_name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize", style.bg, style.text)}>
                {contact.kind.replace("_", " ")}
              </span>
              {contact.organization_name && (
                <span className="text-xs text-white/40">🏢 {contact.organization_name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Contact info chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {contact.phone && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
              <Phone className="h-3 w-3" />
              {contact.phone}
            </span>
          )}
          {contact.email && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
              <Mail className="h-3 w-3" />
              {contact.email}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          {contact.phone && (
            <a
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
              href={`https://wa.me/${contact.phone.replace(/\D/g, "").replace(/^0/, "62")}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              <MessageCircle className="h-3 w-3" />
              WhatsApp
            </a>
          )}
          {contact.phone && (
            <a
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              href={`tel:${contact.phone}`}
            >
              <Phone className="h-3 w-3" />
              Telepon
            </a>
          )}
          {contact.email && (
            <a
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              href={`mailto:${contact.email}`}
            >
              <Mail className="h-3 w-3" />
              Email
            </a>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          KPI CARDS
         ═══════════════════════════════════════ */}
      <div className="grid gap-3 sm:grid-cols-3 animate-slide-up stagger-1">
        <div className="glass-card glass-card-hover rounded-xl p-4 bg-gradient-to-br from-cyan-500/5 to-cyan-500/[0.02]">
          <div className="flex items-center gap-2 mb-2">
            <div className="gradient-icon gradient-icon-cyan !h-8 !w-8 !rounded-lg">
              <Briefcase className="h-3.5 w-3.5" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Total Pekerjaan</p>
          </div>
          <p className="text-2xl font-bold tabular-nums">{totalJobs}</p>
        </div>

        <div className="glass-card glass-card-hover rounded-xl p-4 bg-gradient-to-br from-emerald-500/5 to-emerald-500/[0.02]">
          <div className="flex items-center gap-2 mb-2">
            <div className="gradient-icon gradient-icon-emerald !h-8 !w-8 !rounded-lg">
              <Users2 className="h-3.5 w-3.5" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Total Fee</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-emerald-700">{formatCurrency(totalFeeEarned, "IDR")}</p>
        </div>

        <div className={cn("glass-card glass-card-hover rounded-xl p-4", unpaidFees > 0 && "bg-gradient-to-br from-amber-500/5 to-amber-500/[0.02]")}>
          <div className="flex items-center gap-2 mb-2">
            <div className={cn("gradient-icon !h-8 !w-8 !rounded-lg", unpaidFees > 0 ? "gradient-icon-amber" : "gradient-icon-emerald")}>
              <Users2 className="h-3.5 w-3.5" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Fee Belum Dibayar</p>
          </div>
          <p className={cn("text-2xl font-bold tabular-nums", unpaidFees > 0 ? "text-amber-600" : "text-emerald-700")}>{unpaidFees}</p>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          NOTES
         ═══════════════════════════════════════ */}
      {contact.notes && (
        <div className="glass-card rounded-2xl p-5 animate-slide-up stagger-2">
          <p className="section-label mb-2">📝 Catatan</p>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{contact.notes}</p>
        </div>
      )}

      {/* ═══════════════════════════════════════
          JOB HISTORY
         ═══════════════════════════════════════ */}
      <div className="animate-slide-up stagger-3">
        <p className="section-label mb-3">
          📋 Riwayat Pekerjaan
          {totalJobs > 0 && <span className="text-muted-foreground font-normal"> — {totalJobs} pekerjaan</span>}
        </p>

        {jobHistory.length === 0 ? (
          <div className="glass-card rounded-2xl p-5">
            <EmptyState
              title="Belum ada riwayat"
              description="Kontak ini belum pernah ditugaskan ke pekerjaan."
            />
          </div>
        ) : (
          <div className="space-y-2">
            {jobHistory.map((jc, i) => {
              const job = jc.jobs as unknown as {
                id: string; title: string; shoot_type: string;
                start_at: string; status: string; total_price: string;
                currency: string; workflow_status: string;
              };
              if (!job) return null;

              return (
                <Link
                  key={`${job.id}-${jc.role}-${i}`}
                  href={`/jobs/${job.id}`}
                  className={cn(
                    "group glass-card glass-card-hover rounded-xl overflow-hidden block animate-slide-up",
                    i < 8 ? `stagger-${i + 1}` : ""
                  )}
                >
                  <div className="flex items-stretch">
                    {/* Left accent */}
                    <div className={cn(
                      "w-1 shrink-0",
                      job.status === "confirmed" ? "bg-emerald-500" :
                      job.status === "completed" ? "bg-cyan-500" :
                      job.status === "delivered" ? "bg-blue-500" :
                      job.status === "cancelled" ? "bg-red-400" :
                      "bg-amber-400"
                    )} />

                    <div className="flex-1 px-4 py-3">
                      <div className="flex items-start gap-3">
                        <span className="text-lg mt-0.5 shrink-0">
                          {SHOOT_EMOJI[job.shoot_type || ""] || "📷"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                              {job.title}
                            </p>
                            <JobStatusBadge status={job.status as any} />
                            <WorkflowStatusBadge status={(job.workflow_status || "scheduled") as any} locale={locale} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDateTime(job.start_at)}
                            <span className="mx-1.5">•</span>
                            <span className="capitalize">{jc.role?.replace("_", " ")}</span>
                            {jc.is_primary && <span className="text-primary ml-1">★</span>}
                          </p>
                        </div>

                        {/* Fee info */}
                        <div className="text-right shrink-0">
                          {jc.fee_amount ? (
                            <>
                              <p className="text-sm font-bold tabular-nums text-emerald-700">
                                {formatCurrency(jc.fee_amount, job.currency || "IDR")}
                              </p>
                              <span className={cn(
                                "rounded-full px-2 py-0.5 text-[9px] font-medium",
                                jc.fee_status === "paid"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-700"
                              )}>
                                {jc.fee_status === "paid" ? "Lunas" : "Belum"}
                              </span>
                            </>
                          ) : (
                            <p className="text-xs text-muted-foreground">—</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
