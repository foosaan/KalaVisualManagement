import { Sparkles } from "lucide-react";
import { AiChatInterface } from "@/components/chat/ai-chat-interface";

export default function AiChatPage() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="gradient-icon gradient-icon-emerald">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">KalaAI Studio Chat</h1>
          <p className="text-xs text-muted-foreground">
            Ngobrol langsung dengan asisten AI: buat job dari chat WA, cek piutang, dan jadwalkan pemotretan.
          </p>
        </div>
      </div>

      <AiChatInterface />
    </div>
  );
}
