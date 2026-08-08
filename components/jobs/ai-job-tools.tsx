"use client";

import { useState } from "react";
import { Sparkles, Camera, MessageCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AiShotlistModal } from "@/components/jobs/ai-shotlist-modal";

type AiJobToolsProps = {
  job: {
    id: string;
    title: string;
    shootType: string;
    clientName?: string | null;
    location?: string | null;
    concept?: string | null;
  };
};

export function AiJobTools({ job }: AiJobToolsProps) {
  const [showShotlist, setShowShotlist] = useState(false);

  return (
    <>
      <AiShotlistModal
        isOpen={showShotlist}
        onClose={() => setShowShotlist(false)}
        job={job}
      />

      <Button
        type="button"
        size="sm"
        onClick={() => setShowShotlist(true)}
        className="flex items-center gap-1.5 rounded-lg bg-violet-600/90 text-white hover:bg-violet-600 transition shadow-sm h-8 px-3 text-xs"
      >
        <Sparkles className="h-3.5 w-3.5 text-violet-200" />
        AI Shotlist Guide
      </Button>
    </>
  );
}
