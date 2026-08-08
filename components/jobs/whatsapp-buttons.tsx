"use client";

import { useState } from "react";
import { MessageCircle, Copy, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp-templates";

type WhatsAppButtonsProps = {
  phone: string | null;
  message: string;
  locale?: "id" | "en";
  className?: string;
};

export function WhatsAppButtons({ phone, message, locale = "id", className }: WhatsAppButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const labels = {
    copy: locale === "id" ? "Salin Pesan" : "Copy Message",
    copied: locale === "id" ? "Tersalin!" : "Copied!",
    openWa: locale === "id" ? "Buka WhatsApp" : "Open WhatsApp",
    noPhone: locale === "id" ? "Tidak ada nomor HP" : "No phone number"
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <button
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all",
          copied
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-border/60 bg-white text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        onClick={handleCopy}
        type="button"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? labels.copied : labels.copy}
      </button>

      {phone ? (
        <a
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-medium text-emerald-700 transition-all hover:bg-emerald-100"
          href={buildWhatsAppUrl(phone, message)}
          rel="noopener noreferrer"
          target="_blank"
        >
          <MessageCircle className="h-3 w-3" />
          <span className="hidden sm:inline">{labels.openWa}</span>
          <ExternalLink className="h-2.5 w-2.5 opacity-50" />
        </a>
      ) : (
        <span className="text-[10px] text-muted-foreground italic">{labels.noPhone}</span>
      )}
    </div>
  );
}
