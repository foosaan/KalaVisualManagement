"use client";

import { useState, useTransition } from "react";
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Camera,
  Heart,
  Send,
  ExternalLink,
  Copy,
  Check,
  HelpCircle,
  Sparkles,
  Layers,
  ChevronDown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveClientPhotoSelectionAction, type ClientPortalData } from "@/lib/actions/portal";
import { formatCurrency } from "@/lib/utils";

type ClientPortalViewProps = {
  data: ClientPortalData;
};

export function ClientPortalView({ data }: ClientPortalViewProps) {
  const { job, financial, profile } = data;
  const [selectedPhotos, setSelectedPhotos] = useState("");
  const [editorNotes, setEditorNotes] = useState("");
  const [modelRelease, setModelRelease] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [successState, setSuccessState] = useState<{
    whatsAppUrl: string;
    whatsAppText: string;
  } | null>(null);
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);
  const [showTnC, setShowTnC] = useState(false);

  // Calculate number of selected photos
  const photoTokens = selectedPhotos
    .split(/[\n,;\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const count = photoTokens.length;
  const maxQuota = 35;
  const progressPercent = Math.min((count / maxQuota) * 100, 100);

  const formattedStartDate = new Date(job.start_at).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const formattedStartTime = new Date(job.start_at).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const formattedEndTime = new Date(job.end_at).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const handleCopyBank = () => {
    navigator.clipboard.writeText("692701003058501");
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleSaveSelection = () => {
    if (!selectedPhotos.trim()) {
      alert("Silakan masukkan nomor atau nama file foto yang ingin diedit terlebih dahulu.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await saveClientPhotoSelectionAction({
          jobId: job.id,
          selectedPhotos,
          editorNotes,
          modelReleaseApproved: modelRelease,
          clientName: job.client_name || "Klien"
        });

        if (res.success) {
          setSuccessState({
            whatsAppUrl: res.whatsAppUrl,
            whatsAppText: res.whatsAppText
          });
        }
      } catch (err: any) {
        alert(err?.message || "Gagal menyimpan pilihan foto.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 lg:p-8 flex justify-center selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-2xl space-y-6 animate-fade-in">
        {/* ── Studio Header ── */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
          
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-300">
                <GraduationCap className="h-3.5 w-3.5" /> Po.Graduation Client Portal
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white pt-1">
                {job.title}
              </h1>
              <p className="text-xs text-white/60">
                Klien: <strong className="text-white">{job.client_name}</strong> {job.client_instagram ? `(@${job.client_instagram})` : ""}
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/25">
              🎓
            </div>
          </div>

          {/* Schedule Chips */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2 text-white/80">
              <Calendar className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{formattedStartDate}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Clock className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>{formattedStartTime} - {formattedEndTime} WIB</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 sm:col-span-2">
              <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="truncate">{job.location || "UIN Sunan Kalijaga Yogyakarta"}</span>
            </div>
          </div>
        </div>

        {/* ── Kwitansi Digital & Payment Status Card ── */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <CreditCard className="h-4 w-4" /> Kwitansi & Status Pembayaran
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              financial.outstanding === 0
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
            }`}>
              {financial.outstanding === 0 ? "✓ Lunas 100%" : "DP Diterima (Sisa Tagihan)"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-white/5 border border-white/5">
            <div>
              <span className="text-[10px] text-white/50 block">Total Paket</span>
              <strong className="text-sm font-bold text-white tabular-nums">{formatCurrency(job.total_price)}</strong>
            </div>
            <div className="border-x border-white/10">
              <span className="text-[10px] text-white/50 block">DP Diterima</span>
              <strong className="text-sm font-bold text-emerald-400 tabular-nums">{formatCurrency(financial.paid)}</strong>
            </div>
            <div>
              <span className="text-[10px] text-white/50 block">Sisa Pelunasan</span>
              <strong className="text-sm font-bold text-amber-400 tabular-nums">{formatCurrency(financial.outstanding)}</strong>
            </div>
          </div>

          {financial.outstanding > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-white/70">
                <span>Rekening Pelunasan Hari-H (Transfer BRI):</span>
                <button
                  type="button"
                  onClick={handleCopyBank}
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  {copiedBank ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedBank ? "Tersalin!" : "Salin No Rek"}
                </button>
              </div>
              <p className="font-mono text-sm font-bold text-white">
                6927 0100 3058 501 <span className="text-xs font-normal text-white/60 font-sans">a/n Fauzan Alfikri (BRI)</span>
              </p>
              <p className="text-[11px] text-white/50">
                *Pelunasan dilakukan di hari photoshoot berlangsung melalui nomor rekening yang sama.
              </p>
            </div>
          )}
        </div>

        {/* ── FITUR CULLING / PILIH FOTO OLEH KLIEN ── */}
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 via-slate-900 to-slate-900 p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 shadow-md">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Fitur Pemilihan Foto Edit (Culling)</h3>
                <p className="text-[11px] text-white/60">Pilih hingga {maxQuota} foto favorit Anda untuk diretus oleh editor.</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-xl">
              {count} / {maxQuota} Foto
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  count > maxQuota ? "bg-amber-500" : "bg-gradient-to-r from-emerald-500 to-cyan-400"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {count > maxQuota && (
              <p className="text-[10px] text-amber-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Anda memilih lebih dari kuota paket ({count}/{maxQuota} foto). Foto tambahan akan dikenakan biaya ekstra.
              </p>
            )}
          </div>

          {!successState ? (
            <div className="space-y-3.5 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80 flex items-center justify-between">
                  <span>Daftar Nomor File Foto Pilihan:</span>
                  <span className="text-[10px] text-white/40">Pisahkan dengan koma atau baris baru</span>
                </label>
                <Textarea
                  rows={4}
                  value={selectedPhotos}
                  onChange={(e) => setSelectedPhotos(e.target.value)}
                  placeholder={`Contoh input:\nDSC_0012, DSC_0025, DSC_0044, DSC_0089\natau cukup nomornya: 1, 14, 25, 33, 40`}
                  className="font-mono text-xs rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500 resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80">
                  Catatan Khusus untuk Editor (Opsional):
                </label>
                <Textarea
                  rows={2}
                  value={editorNotes}
                  onChange={(e) => setEditorNotes(e.target.value)}
                  placeholder="Contoh: Tolong cerahkan wajah di foto DSC_0012, dan rapikan kerutan selempang di DSC_0044."
                  className="text-xs rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Model Release Toggle */}
              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/[0.02] border border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={modelRelease}
                  onChange={(e) => setModelRelease(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 text-emerald-500 focus:ring-emerald-400 h-4 w-4 bg-transparent"
                />
                <span className="text-xs text-white/70 leading-snug">
                  Saya mengizinkan foto hasil pemotretan ini untuk dijadikan portofolio resmi media sosial <strong>@Po.Graduation</strong>.
                </span>
              </label>

              <Button
                onClick={handleSaveSelection}
                disabled={isPending || !selectedPhotos.trim()}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 py-3 rounded-2xl text-xs flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                Simpan & Kirim {count} Foto Pilihan ke Editor via WhatsApp
              </Button>
            </div>
          ) : (
            /* Success Culling State */
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3 animate-scale-in">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> Pilihan {count} Foto Berhasil Disimpan!
              </div>
              <p className="text-xs text-white/70">
                Editor Po.Graduation akan segera memproses foto Anda (estimasi 1–7 hari kerja). Silakan klik tombol di bawah untuk konfirmasi ke WhatsApp kami:
              </p>
              <a
                href={successState.whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2.5 transition shadow-sm"
              >
                <Send className="h-3.5 w-3.5" /> Konfirmasi Pilihan ke WhatsApp Po.Graduation
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          )}
        </div>

        {/* ── Google Drive Storage Notice ── */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
              <FolderOpen className="h-4 w-4" /> Link Google Drive & Penyimpanan File
            </div>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-semibold">
              Aktif 2 - 3 Bulan
            </span>
          </div>

          <p className="text-xs text-white/70 leading-relaxed">
            Semua file soft file master disimpan di Google Drive selama <strong>2–3 bulan</strong>. Harap segera mendownload semua file foto ke laptop/HP Anda sebelum terhapus permanen dari cloud.
          </p>

          {job.drive_url ? (
            <a
              href={job.drive_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs py-2.5 transition shadow-md shadow-cyan-500/20 mt-1"
            >
              <FolderOpen className="h-4 w-4" /> Buka Folder Google Drive Foto
              <ExternalLink className="h-3.5 w-3.5 ml-1" />
            </a>
          ) : (
            <div className="rounded-xl bg-white/5 p-2.5 text-center text-xs text-white/50 font-mono">
              Link Google Drive akan muncul di sini saat sesi shoot selesai diupload.
            </div>
          )}
        </div>

        {/* ── Official TnC Accordion ── */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowTnC(!showTnC)}
            className="w-full flex items-center justify-between p-4 text-xs font-bold text-white/80 hover:bg-white/5 transition"
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-emerald-400" /> Syarat & Ketentuan (SOP Po.Graduation)
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showTnC ? "rotate-180" : ""}`} />
          </button>

          {showTnC && (
            <div className="p-4 pt-0 space-y-2 text-xs text-white/60 border-t border-white/5 font-sans leading-relaxed">
              <p>• <strong>DP:</strong> Uang DP hangus apabila ada pembatalan sepihak dari klien.</p>
              <p>• <strong>Reschedule:</strong> Maksimal H-14 dan hanya jika slot jadwal masih tersedia.</p>
              <p>• <strong>Keterlambatan:</strong> Di hari-H tidak ada toleransi keterlambatan (waktu foto menyesuaikan sisa durasi paket).</p>
              <p>• <strong>Soft File:</strong> Diberikan maksimal H+1 acara.</p>
              <p>• <strong>Batas Pilih Foto:</strong> Maksimal 14 hari dari waktu sesi foto (lebih dari itu kuota edit otomatis hangus).</p>
              <p>• <strong>Estimasi Edit:</strong> Pengerjaan 1–7 hari kerja setelah klien selesai memilih.</p>
            </div>
          )}
        </div>

        {/* Studio Footer */}
        <div className="text-center text-xs text-white/40 pt-4 space-y-1">
          <p>© 2026 Po.Graduation Photography. All rights reserved.</p>
          <p>WhatsApp: +62 877-6533-4496 • Instagram: @Po.Graduation</p>
        </div>
      </div>
    </div>
  );
}
