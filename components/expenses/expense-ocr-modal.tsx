"use client";

import { useState, useTransition, useRef } from "react";
import {
  Camera,
  Upload,
  Receipt,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  Loader2,
  CreditCard,
  FileText,
  Calendar,
  Tag
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { parseReceiptAction, type ParsedReceiptData } from "@/lib/actions/ai-expense-ocr";
import { formatCurrency } from "@/lib/utils";

type ExpenseOcrModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: ParsedReceiptData) => void;
};

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  equipment_rental: { label: "Sewa Alat / Lensa", emoji: "📸" },
  studio_rent: { label: "Sewa Studio", emoji: "🏛️" },
  transport: { label: "Transport & Bensin", emoji: "🚗" },
  meal: { label: "Konsumsi / Makan Kru", emoji: "🍔" },
  editing: { label: "Biaya Editor / Retouch", emoji: "✏️" },
  fg_fee: { label: "Fee Fotografer", emoji: "👤" },
  crew_fee: { label: "Fee Kru / Asisten / MUA", emoji: "👥" },
  other: { label: "Pengeluaran Lainnya", emoji: "📦" }
};

export function ExpenseOcrModal({ isOpen, onClose, onApply }: ExpenseOcrModalProps) {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [rawText, setRawText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [parsedResult, setParsedResult] = useState<ParsedReceiptData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = () => {
    if (!imageBase64 && !rawText.trim()) {
      setErrorMsg("Silakan upload foto struk atau ketik catatan pengeluaran.");
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      try {
        const res = await parseReceiptAction({
          imageBase64: imageBase64 || undefined,
          imageMimeType: imageMimeType,
          rawText: rawText || undefined
        });

        if (res.success && res.data) {
          setParsedResult(res.data);
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "Gagal membaca struk pengeluaran.");
      }
    });
  };

  const handleApplyToForm = () => {
    if (!parsedResult) return;
    onApply(parsedResult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-5 py-4 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-foreground">
                  Scan Nota & Struk (AI Vision)
                </h2>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  OCR Cepat
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Foto struk makan, bensin, atau sewa alat untuk auto-fill pengeluaran.
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

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {!parsedResult ? (
            <div className="space-y-3.5">
              {/* Image Upload Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 p-6 text-center transition-all hover:bg-muted/40 hover:border-amber-500/50 cursor-pointer"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {imageBase64 ? (
                  <div className="space-y-2">
                    <img
                      src={`data:${imageMimeType};base64,${imageBase64}`}
                      alt="Receipt Preview"
                      className="max-h-36 mx-auto rounded-xl object-contain shadow-sm border border-border"
                    />
                    <p className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Foto struk terpilih! Klik untuk ganti
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 group-hover:scale-110 transition-transform">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">
                      Klik untuk Upload / Ambil Foto Struk
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Mendukung foto nota fisik, struk GoPay/OVO, atau invoice rental
                    </p>
                  </div>
                )}
              </div>

              {/* Text Fallback */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-amber-600" /> Atau Ketik / Paste Catatan Nota:
                </label>
                <Textarea
                  rows={3}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Contoh: Makan siang nasi padang kru 3 orang total 85.000 warung bu siti"
                  className="text-xs rounded-xl bg-muted/30 focus:bg-background border-border/80 resize-none"
                />
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300">
                  {errorMsg}
                </div>
              )}
            </div>
          ) : (
            /* Parsed Result Preview */
            <div className="space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Struk Berhasil Discan!
                </span>
                <button
                  type="button"
                  onClick={() => setParsedResult(null)}
                  className="text-[11px] font-medium text-emerald-700 hover:underline"
                >
                  Scan Ulang
                </button>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Nominal Pengeluaran</span>
                  <span className="text-base font-bold text-emerald-700 tabular-nums">
                    {formatCurrency(parsedResult.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-border/60 pt-2 text-xs">
                  <span className="text-muted-foreground">Kategori</span>
                  <span className="font-semibold text-foreground">
                    {CATEGORY_LABELS[parsedResult.category]?.emoji} {CATEGORY_LABELS[parsedResult.category]?.label || parsedResult.category}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-border/60 pt-2 text-xs">
                  <span className="text-muted-foreground">Deskripsi / Toko</span>
                  <span className="font-semibold text-foreground truncate max-w-[200px]">
                    {parsedResult.description || parsedResult.vendorName}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-border/60 pt-2 text-xs">
                  <span className="text-muted-foreground">Tanggal</span>
                  <span className="font-medium text-muted-foreground">
                    {parsedResult.expenseDate}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3.5 bg-muted/20">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
            Batal
          </Button>

          {!parsedResult ? (
            <Button
              size="sm"
              onClick={handleScan}
              disabled={isPending || (!imageBase64 && !rawText.trim())}
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Membaca Struk...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Scan dengan AI
                </>
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleApplyToForm}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
            >
              Terapkan ke Form Pengeluaran <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
