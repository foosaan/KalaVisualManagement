"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Zap,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Tag,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  HelpCircle,
  TrendingUp,
  Receipt
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { sendChatMessageAction, executeChatJobCreationAction, type ChatMessage } from "@/lib/actions/chat";
import { formatCurrency } from "@/lib/utils";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-1",
    role: "assistant",
    content: `Halo! Saya **KalaAI**, asisten pribadi cerdas untuk operasional studio foto Anda 🎓📸

Saya terhubung langsung dengan **Database KalaVisual & Katalog Resmi Po.Graduation 2026**.

Anda bisa ajak saya ngobrol apa saja layaknya asisten pribadi, misalnya:
• *"Buat job baru dari form WA klien"* (Tinggal paste teks chat dari klien)
• *"Berapa total laba bersih dan sisa piutang bulan ini?"*
• *"Jadwal pemotretan terdekat saya kapan?"*
• *"Bikinin ide konsep & pose wisuda outdoor di kampus"*

Ada yang mau kita kerjakan sekarang?`,
    timestamp: "Online",
    suggestedReplies: [
      "Paste form booking Nisrina",
      "Berapa laba bersih bulan ini?",
      "Jadwal pemotretan terdekat",
      "Ide konsep & pose wisuda"
    ]
  }
];

const SAMPLE_WA_FORM = `_Form Booking_

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

export function AiChatInterface() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [executingJobId, setExecutingJobId] = useState<string | null>(null);
  const [executedCards, setExecutedCards] = useState<Record<string, { jobId: string; whatsAppUrl: string; whatsAppReply: string }>>({});
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    startTransition(async () => {
      try {
        const historyPayload = messages.map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("assistant" as const),
          content: m.content
        }));

        const aiResponse = await sendChatMessageAction(historyPayload, query);
        setMessages((prev) => [...prev, aiResponse]);
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Maaf, terjadi kendala saat menghubungkan ke asisten AI. Silakan coba lagi.",
            timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      }
    });
  };

  const handleExecuteJobCard = async (msgId: string, jobData: any) => {
    setExecutingJobId(msgId);

    try {
      const res = await executeChatJobCreationAction(jobData);
      if (res.success) {
        setExecutedCards((prev) => ({
          ...prev,
          [msgId]: {
            jobId: res.jobId,
            whatsAppUrl: res.whatsAppUrl,
            whatsAppReply: res.whatsAppReply
          }
        }));

        // Append assistant confirmation in chat
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `🎉 **JOB BERHASIL DITERBITKAN 100%!**\n\n• **Job ID**: \`#${res.jobId.slice(0, 8)}\`\n• **Klien**: ${jobData.clientName} (@${jobData.instagramHandle || "klien"})\n• **DP Tercatat**: ${formatCurrency(jobData.dpAmount)} (Lunas di menu Payments)\n• **Sisa Piutang**: ${formatCurrency(Math.max(jobData.totalPrice - jobData.dpAmount, 0))}\n\nKlik tombol hijau di atas untuk langsung mengirim balasan WhatsApp konfirmasi ke klien ya! 📲`,
            timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            suggestedReplies: [
              "Buka detail job",
              "Berapa sisa piutang sekarang?",
              "Cek jadwal kalender"
            ]
          }
        ]);
      }
    } catch (err: any) {
      alert(err?.message || "Gagal membuat job dari chat.");
    } finally {
      setExecutingJobId(null);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto rounded-2xl border border-border bg-card shadow-xl overflow-hidden animate-fade-in">
      {/* ── Chat Header ── */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-md shadow-emerald-500/20">
            <Bot className="h-5 w-5" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-foreground">KalaAI Studio Copilot</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                <Sparkles className="h-3 w-3" /> Gemini Catalog Engine
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Asisten interaktif serba bisa untuk Po.Graduation & KalaVisual Management
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setMessages(INITIAL_MESSAGES)}
          className="text-xs h-8 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          Reset Chat
        </Button>
      </div>

      {/* ── Message Bubbles Area ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-muted/10">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          const executed = executedCards[msg.id];

          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed animate-fade-in ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm mt-0.5">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}

              <div className={`space-y-2 max-w-[88%] sm:max-w-[80%]`}>
                {/* Text Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm ${
                    isUser
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none"
                      : "bg-card border border-border text-foreground rounded-bl-none whitespace-pre-line"
                  }`}
                >
                  {msg.content}
                </div>

                {/* Interactive Action Card inside Chat */}
                {msg.actionCard?.type === "job_preview" && msg.actionCard.data && (
                  <div className="rounded-2xl border border-emerald-500/30 bg-card p-4 shadow-md space-y-3 animate-scale-up">
                    <div className="flex items-center justify-between border-b border-border/80 pb-2">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5" /> Draf Job Otomatis Teridentifikasi
                      </span>
                      <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        Katalog Po.Graduation
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-muted/40 p-2.5 space-y-0.5">
                        <span className="text-[10px] text-muted-foreground">Klien & Instagram</span>
                        <p className="font-bold text-foreground">
                          {msg.actionCard.data.clientName} (@{msg.actionCard.data.instagramHandle || "-"})
                        </p>
                      </div>

                      <div className="rounded-lg bg-muted/40 p-2.5 space-y-0.5">
                        <span className="text-[10px] text-muted-foreground">Paket & Harga Resmi</span>
                        <p className="font-bold text-foreground">
                          {msg.actionCard.data.packageName} • <span className="text-emerald-600">{formatCurrency(msg.actionCard.data.totalPrice)}</span>
                        </p>
                      </div>

                      <div className="rounded-lg bg-muted/40 p-2.5 space-y-0.5">
                        <span className="text-[10px] text-muted-foreground">Jadwal & Waktu</span>
                        <p className="font-semibold text-foreground">
                          {msg.actionCard.data.startDate} ({msg.actionCard.data.startTime} - {msg.actionCard.data.endTime} WIB)
                        </p>
                      </div>

                      <div className="rounded-lg bg-muted/40 p-2.5 space-y-0.5">
                        <span className="text-[10px] text-muted-foreground">Lokasi Pemotretan</span>
                        <p className="font-semibold text-foreground truncate">
                          {msg.actionCard.data.location}
                        </p>
                      </div>
                    </div>

                    {/* Financial Pill */}
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        DP Masuk: <strong className="text-emerald-700">{formatCurrency(msg.actionCard.data.dpAmount)}</strong>
                      </span>
                      <span className="text-muted-foreground">
                        Sisa Pelunasan: <strong className="text-amber-700">{formatCurrency(msg.actionCard.data.totalPrice - msg.actionCard.data.dpAmount)}</strong>
                      </span>
                    </div>

                    {/* Action Execution Button */}
                    {!executed ? (
                      <Button
                        size="sm"
                        disabled={executingJobId === msg.id}
                        onClick={() => handleExecuteJobCard(msg.id, msg.actionCard?.data)}
                        className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-bold shadow-md shadow-emerald-600/20 text-xs py-2 flex items-center justify-center gap-1.5"
                      >
                        {executingJobId === msg.id ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Menerbitkan Job & DP ke Database...
                          </>
                        ) : (
                          <>
                            <Zap className="h-3.5 w-3.5" />
                            ⚡ Terbitkan Job & Catat DP Sekarang (1-Click)
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 p-2 rounded-xl border border-emerald-200">
                          <CheckCircle2 className="h-4 w-4" /> Job Terbit & DP Masuk ke Sistem!
                        </div>

                        {executed.whatsAppUrl && (
                          <a
                            href={executed.whatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 transition shadow-sm"
                          >
                            <Send className="h-3.5 w-3.5" /> Kirim Konfirmasi ke WhatsApp Klien
                            <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Suggested Reply Chips */}
                {msg.suggestedReplies && msg.suggestedReplies.length > 0 && !isUser && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedReplies.map((reply, rIdx) => (
                      <button
                        key={rIdx}
                        type="button"
                        onClick={() => {
                          if (reply === "Paste form booking Nisrina") {
                            handleSendMessage(SAMPLE_WA_FORM);
                          } else if (reply === "Buka detail job" && executed?.jobId) {
                            router.push(`/jobs/${executed.jobId}`);
                          } else {
                            handleSendMessage(reply);
                          }
                        }}
                        className="rounded-full border border-border/80 bg-background/80 px-3 py-1 text-[11px] font-medium text-foreground hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-500/10 transition-colors shadow-xs"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}

                <div className={`text-[10px] text-muted-foreground/60 ${isUser ? "text-right" : "text-left"}`}>
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground shadow-sm mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {isPending && (
          <div className="flex gap-3 text-xs leading-relaxed animate-fade-in justify-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-bl-none bg-card border border-border px-4 py-3 shadow-sm flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
              KalaAI sedang memproses data & katalog...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Box & Quick Action Toolbar ── */}
      <div className="border-t border-border p-3.5 bg-background space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ketik pesan atau paste chat booking WA (tekan Enter untuk kirim)..."
              className="w-full rounded-xl border border-border bg-muted/20 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-sans leading-relaxed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-4 rounded-xl shadow-sm flex items-center gap-1.5 font-bold"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </form>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
          <button
            type="button"
            onClick={() => handleSendMessage(SAMPLE_WA_FORM)}
            className="text-emerald-600 hover:underline flex items-center gap-1 font-medium"
          >
            <Sparkles className="h-3 w-3" /> Coba Paste Form Nisrina (Simulasi Chat)
          </button>
          <span>Shift + Enter untuk baris baru</span>
        </div>
      </div>
    </div>
  );
}
