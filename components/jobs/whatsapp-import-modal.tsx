"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Instagram,
  User,
  CreditCard,
  FileText,
  X,
  ArrowRight,
  Loader2,
  Zap,
  Tag,
  Copy,
  Check,
  Send,
  ExternalLink
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  parseWhatsAppBookingAction,
  instantAutoSubmitJobAction,
  type ParsedBookingData
} from "@/lib/actions/ai-import";
import { formatCurrency } from "@/lib/utils";

type WhatsAppImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: ParsedBookingData, assignedContactId?: string) => void;
  existingContacts: Array<{ id: string; display_name: string; kind: string; phone: string | null }>;
  onContactCreated?: (contact: { id: string; display_name: string; kind: string; phone: string | null }) => void;
};

const SAMPLE_WA_TEXT = `_Form Booking_

Nama : Nisrina 
Tanggal : antara tgl 12/13 Agustus 2026
Jam : 
Lokasi foto : UIN Sunan Kalijaga Yogyakarta 
Kampus : UIN Sunan Kalijaga Yogyakarta 
paket : Graduation premium package
Instagram : nisrinaraa

Setelah mengisi format diatas silakan melakukan DP ke rekening 

6927 0100 3058 501 
BRI a/n Fauzan Alfikri 

dan mengirimkan bukti transfer yang telah dilakukan. 

DP Rp 50.000
*NB: Uang DP akan hangus jika melakukan cancel booking.*`;

export function WhatsAppImportModal({
  isOpen,
  onClose,
  onApply,
  existingContacts
}: WhatsAppImportModalProps) {
  const router = useRouter();
  const [rawText, setRawText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedBookingData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    jobId: string;
    whatsAppReply: string;
    whatsAppUrl: string;
  } | null>(null);
  const [copiedReply, setCopiedReply] = useState(false);

  if (!isOpen) return null;

  const handleParse = () => {
    if (!rawText.trim()) {
      setErrorMsg("Silakan paste teks form WhatsApp terlebih dahulu.");
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      try {
        const res = await parseWhatsAppBookingAction(rawText);
        if (res.success && res.data) {
          setParsedResult(res.data);
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "Gagal mengekstrak teks WhatsApp.");
      }
    });
  };

  const handle1ClickAutoSubmit = async () => {
    if (!parsedResult) return;
    setIsAutoSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await instantAutoSubmitJobAction(parsedResult);
      if (res.success) {
        setSuccessResult({
          jobId: res.jobId,
          whatsAppReply: res.whatsAppReply,
          whatsAppUrl: res.whatsAppUrl
        });
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal melakukan 1-Click Instant Submit.");
      setIsAutoSubmitting(false);
    }
  };

  const handleCopyReply = () => {
    if (!successResult?.whatsAppReply) return;
    navigator.clipboard.writeText(successResult.whatsAppReply);
    setCopiedReply(true);
    setTimeout(() => setCopiedReply(false), 2000);
  };

  const handleApplyToForm = () => {
    if (!parsedResult) return;
    onApply(parsedResult, parsedResult.existingContactId || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-5 py-4 bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-md shadow-emerald-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-foreground">
                  Quick Import WhatsApp & Auto-Pilot
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                  <Sparkles className="h-3 w-3" /> Catalog Intelligent
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Terkoneksi otomatis dengan Katalog Resmi Po.Graduation & Database DP.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {successResult ? (
            /* ═════════════════════════════════════════════
               SUCCESS SCREEN (AFTER 1-CLICK AUTO-SUBMIT)
               ═════════════════════════════════════════════ */
            <div className="space-y-4 animate-scale-in">
              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-5 text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                  <Check className="h-6 w-6 stroke-[3]" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Job & DP Berhasil Terdaftar 100% Otomatis! 🎉
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Kontak klien <strong>{parsedResult?.clientName}</strong>, jadwal pemotretan, dan pembayaran DP <strong>{formatCurrency(parsedResult?.dpAmount || 50000)}</strong> sudah masuk ke database.
                </p>
              </div>

              {/* Ready-to-Send WhatsApp Confirmation Message */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                    Pesan Konfirmasi WhatsApp Siap Kirim:
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyReply}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    {copiedReply ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedReply ? "Tersalin!" : "Salin Pesan"}
                  </button>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-xs text-muted-foreground whitespace-pre-line font-mono max-h-48 overflow-y-auto leading-relaxed">
                  {successResult.whatsAppReply}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                {successResult.whatsAppUrl && (
                  <a
                    href={successResult.whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
                  >
                    <Send className="h-4 w-4" />
                    Kirim Konfirmasi ke WhatsApp Klien
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </a>
                )}
                <Button
                  onClick={() => {
                    router.push(`/jobs/${successResult.jobId}`);
                    onClose();
                  }}
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                >
                  Buka Detail Job
                </Button>
              </div>
            </div>
          ) : !parsedResult ? (
            /* ═════════════════════════════════════════════
               INPUT AREA (PASTE WHATSAPP CHAT)
               ═════════════════════════════════════════════ */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                  Paste Teks Chat / Form Booking WhatsApp:
                </label>
                <button
                  type="button"
                  onClick={() => setRawText(SAMPLE_WA_TEXT)}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Gunakan Contoh Form Nisrina
                </button>
              </div>

              <Textarea
                rows={8}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`Contoh Form WA:\n\nNama : Nisrina\nTanggal : antara tgl 12/13 Agustus 2026\nLokasi foto : UIN Sunan Kalijaga Yogyakarta\npaket : Graduation premium package\nInstagram : nisrinaraa\nDP Rp 50.000`}
                className="font-mono text-xs leading-relaxed rounded-xl resize-none bg-muted/30 focus:bg-background border-border/80"
              />

              {errorMsg && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300">
                  {errorMsg}
                </div>
              )}
            </div>
          ) : (
            /* ═════════════════════════════════════════════
               PARSED RESULT PREVIEW (CATALOG INTELLIGENT)
               ═════════════════════════════════════════════ */
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 to-transparent border border-emerald-500/20 px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Katalog Cocok: {parsedResult.packageName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setParsedResult(null)}
                  className="text-[11px] font-semibold text-emerald-700 hover:underline"
                >
                  Ganti Teks
                </button>
              </div>

              {/* Data Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Client Info */}
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                    <User className="h-3.5 w-3.5 text-emerald-600" /> Nama Klien & Kontak
                  </div>
                  <p className="text-sm font-bold text-foreground">{parsedResult.clientName}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground pt-0.5">
                    {parsedResult.instagramHandle && (
                      <span className="inline-flex items-center gap-1 text-pink-600 font-semibold">
                        <Instagram className="h-3 w-3" /> @{parsedResult.instagramHandle}
                      </span>
                    )}
                    {parsedResult.clientPhone && <span>📱 {parsedResult.clientPhone}</span>}
                  </div>
                </div>

                {/* Shoot Type & Catalog Package */}
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                    <Tag className="h-3.5 w-3.5 text-violet-600" /> Paket Resmi Po.Graduation
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300 capitalize">
                      🎓 {parsedResult.shootType}
                    </span>
                    <span className="text-xs font-semibold text-foreground truncate">
                      {parsedResult.packageName}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {parsedResult.matchedPackage?.description || "35 File edit + All soft files"}
                  </p>
                </div>

                {/* Date & Time */}
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 text-cyan-600" /> Tanggal & Durasi Sesi
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {parsedResult.startDate}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <Clock className="h-3 w-3" /> {parsedResult.startTime} - {parsedResult.endTime} WIB (Durasi {parsedResult.matchedPackage?.durationHours || 2} Jam)
                  </p>
                </div>

                {/* Location */}
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-amber-600" /> Lokasi Pemotretan
                  </div>
                  <p className="text-xs font-semibold text-foreground line-clamp-2">
                    {parsedResult.location || "UIN Sunan Kalijaga Yogyakarta"}
                  </p>
                </div>

                {/* Financial Summary Card */}
                <div className="sm:col-span-2 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                      <CreditCard className="h-3.5 w-3.5 text-emerald-600" /> Rincian Finansial & DP
                    </div>
                    <div className="text-xs space-x-2">
                      <span>Total Paket: <strong className="text-foreground">{formatCurrency(parsedResult.totalPrice)}</strong></span>
                      <span>•</span>
                      <span>DP Masuk: <strong className="text-emerald-700">{formatCurrency(parsedResult.dpAmount)}</strong></span>
                      <span>•</span>
                      <span>Sisa Pelunasan: <strong className="text-amber-700">{formatCurrency(Math.max(parsedResult.totalPrice - parsedResult.dpAmount, 0))}</strong></span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-lg shrink-0">
                    Rek: BRI a/n Fauzan Alfikri
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300">
                  {errorMsg}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!successResult && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-border px-5 py-3.5 bg-muted/20 gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isPending || isAutoSubmitting}>
              Batal
            </Button>

            {!parsedResult ? (
              <Button
                size="sm"
                onClick={handleParse}
                disabled={isPending || !rawText.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Mengekstrak Katalog...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Ekstrak dengan AI
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleApplyToForm}
                  disabled={isAutoSubmitting}
                  className="text-xs"
                >
                  Terapkan ke Form
                </Button>

                <Button
                  size="sm"
                  onClick={handle1ClickAutoSubmit}
                  disabled={isAutoSubmitting}
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-md shadow-emerald-600/20 text-xs font-bold flex items-center gap-1.5"
                >
                  {isAutoSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Auto-Submitting...
                    </>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5" />
                      ⚡ 1-Click Instant Submit
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
