"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Bot,
  Search,
  X,
  ArrowRight,
  TrendingUp,
  CalendarDays,
  CalendarClock,
  Wallet,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Camera
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { askAiCopilotAction, type CopilotResponse } from "@/lib/actions/ai-copilot";
import { cn } from "@/lib/utils";

type AiCopilotModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SUGGESTED_QUESTIONS = [
  "Tampilkan job yang belum lunas",
  "Berapa total laba bersih bulan ini?",
  "Jadwal pemotretan terdekat",
  "Ide konsep & shotlist foto wisuda"
];

export function AiCopilotModal({ isOpen, onClose }: AiCopilotModalProps) {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [response, setResponse] = useState<CopilotResponse | null>(null);
  const [history, setHistory] = useState<Array<{ role: "user" | "ai"; text: string; data?: any }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isPending]);

  if (!isOpen) return null;

  const handleAsk = (textToAsk?: string) => {
    const q = textToAsk || query;
    if (!q.trim() || isPending) return;

    setHistory((prev) => [...prev, { role: "user", text: q }]);
    setQuery("");

    startTransition(async () => {
      try {
        const res = await askAiCopilotAction(q);
        setResponse(res);
        setHistory((prev) => [...prev, { role: "ai", text: res.answer, data: res }]);
      } catch {
        setHistory((prev) => [
          ...prev,
          {
            role: "ai",
            text: "Maaf, terjadi kesalahan saat menghubungi asisten AI. Silakan coba kembali."
          }
        ]);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-scale-up flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-5 py-3.5 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-foreground">
                  KalaAI Copilot
                </h2>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Asisten Cerdas
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Tanya seputar keuangan, piutang, jadwal, atau ide konsep pemotretan.
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

        {/* Chat / Content History Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[250px]">
          {history.length === 0 ? (
            <div className="space-y-4 my-auto py-6">
              <div className="text-center space-y-1.5">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Ada yang bisa saya bantu hari ini?</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Ketik pertanyaan apapun seputar operasional fotografi, cek piutang, atau klik rekomendasi di bawah:
                </p>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleAsk(q)}
                    className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/20 p-3 text-left text-xs font-medium text-foreground transition-all hover:bg-muted/60 hover:border-emerald-500/40 hover:text-emerald-700"
                  >
                    <span className="truncate">{q}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {history.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex gap-3 text-xs leading-relaxed animate-fade-in",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "ai" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 max-w-[85%]",
                      msg.role === "user"
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-muted/40 border border-border text-foreground rounded-bl-none whitespace-pre-line"
                    )}
                  >
                    {msg.text}

                    {/* Action buttons if available */}
                    {msg.data?.suggestedActions && msg.data.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-3 mt-2 border-t border-border/60">
                        {msg.data.suggestedActions.map((action: any, aIdx: number) => (
                          <Link
                            key={aIdx}
                            href={action.href || "#"}
                            onClick={onClose}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-500/20 transition-colors"
                          >
                            {action.label} <ArrowRight className="h-3 w-3" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isPending && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse pl-2">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  KalaAI sedang menganalisis data...
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="border-t border-border p-3.5 bg-muted/20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tanya apa saja (misal: 'job yang belum lunas', 'cek jadwal minggu ini')..."
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!query.trim() || isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 h-9 px-3.5 rounded-xl shadow-sm"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
