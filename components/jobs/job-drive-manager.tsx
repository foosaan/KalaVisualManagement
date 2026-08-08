"use client";

import { useState, useTransition } from "react";
import {
  FolderOpen,
  Link as LinkIcon,
  ExternalLink,
  Send,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateJobDriveUrlAction } from "@/lib/actions/jobs";

type JobDriveManagerProps = {
  jobId: string;
  initialDriveUrl?: string | null;
  clientName?: string | null;
  clientPhone?: string | null;
};

export function JobDriveManager({
  jobId,
  initialDriveUrl,
  clientName = "Klien",
  clientPhone
}: JobDriveManagerProps) {
  const [driveUrl, setDriveUrl] = useState(initialDriveUrl || "");
  const [savedUrl, setSavedUrl] = useState(initialDriveUrl || "");
  const [isPending, startTransition] = useTransition();
  const [copiedPortal, setCopiedPortal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const portalUrl = typeof window !== "undefined" ? `${window.location.origin}/portal/${jobId}` : `/portal/${jobId}`;

  const handleSave = () => {
    if (!driveUrl.trim()) {
      setErrorMsg("Silakan masukkan link Google Drive yang valid.");
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      const res = await updateJobDriveUrlAction(jobId, driveUrl);
      if (res.success) {
        setSavedUrl(driveUrl.trim());
      } else {
        setErrorMsg(res.message || "Gagal menyimpan link Google Drive.");
      }
    });
  };

  const handleCopyPortal = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopiedPortal(true);
    setTimeout(() => setCopiedPortal(false), 2000);
  };

  // WhatsApp template for photo delivery
  const waDeliveryMessage = `Halo Kak ${clientName || "Klien"} 🎓✨

Kabar gembira! File soft file foto wisuda bersama *Po.Graduation* sudah selesai di-upload ke Google Drive ya! 📸

📁 *Link Google Drive:*
${savedUrl || driveUrl}

🌐 *Link Portal Klien & Pilih Foto:*
${portalUrl}

📝 *SOP & Catatan:*
1. Silakan pilih nomor foto yang ingin diedit melalui link Portal Klien di atas (kuota sesuai paket).
2. Batas waktu pemilihan foto maksimal 14 hari dari waktu sesi foto.
3. Link Google Drive aktif kami simpan selama 2–3 bulan. Harap segera download semua file ke HP/laptop sebelum terhapus ya Kak.

Terima kasih banyak! 🙏✨
_Po.Graduation Photography_`;

  const cleanPhone = (clientPhone || "").replace(/[^0-9]/g, "");
  const targetPhone = cleanPhone.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;
  const waDeliveryUrl = targetPhone
    ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(waDeliveryMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(waDeliveryMessage)}`;

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4 animate-slide-up border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 via-background to-transparent shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500 text-white shadow-sm">
            <FolderOpen className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Google Drive & Delivery Link</h3>
              {savedUrl ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Link Aktif
                </span>
              ) : (
                <span className="text-[10px] font-medium text-amber-700 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                  Belum Ada Link
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Submit link folder Google Drive foto klien untuk membuka akses portal dan pemilihan foto.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyPortal}
          className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 hover:underline flex items-center gap-1"
        >
          {copiedPortal ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copiedPortal ? "Link Portal Tersalin!" : "Salin Link Portal Klien"}
        </button>
      </div>

      {/* Input Form Area */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              placeholder="Paste link Google Drive di sini: https://drive.google.com/drive/folders/..."
              className="pl-9 text-xs rounded-xl font-mono"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={isPending || !driveUrl.trim() || driveUrl === savedUrl}
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shrink-0"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                Menyimpan...
              </>
            ) : (
              "💾 Simpan Link Drive"
            )}
          </Button>
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/50 p-2 rounded-lg border border-rose-200">
            {errorMsg}
          </p>
        )}

        {/* Action Row when Drive URL is active */}
        {savedUrl && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href={savedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 px-3 py-1.5 text-xs font-semibold transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Buka Google Drive
            </a>

            <a
              href={waDeliveryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
              Kirim Link Drive ke WhatsApp Klien
            </a>
          </div>
        )}

        {/* SOP Retention Warning Notice */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 text-[11px] text-muted-foreground flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
            File Google Drive aktif selama <strong>2–3 bulan</strong> sesuai SOP Po.Graduation.
          </span>
          <span className="font-semibold text-cyan-700 dark:text-cyan-300">
            Retention Active
          </span>
        </div>
      </div>
    </div>
  );
}
