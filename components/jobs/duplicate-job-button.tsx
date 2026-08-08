"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";

import { duplicateJobAction } from "@/lib/actions/jobs";
import { Button } from "@/components/ui/button";

type DuplicateJobButtonProps = {
  jobId: string;
  label?: string;
  size?: "sm" | "default";
  variant?: "outline" | "ghost" | "secondary";
};

export function DuplicateJobButton({ jobId, label = "Duplicate", size = "sm", variant = "outline" }: DuplicateJobButtonProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDuplicate() {
    if (pending) return;
    startTransition(async () => {
      const result = await duplicateJobAction(jobId);
      if (result.success && result.data) {
        router.push(`/jobs/${result.data.id}/edit`);
      }
    });
  }

  return (
    <Button disabled={pending} onClick={handleDuplicate} size={size} type="button" variant={variant}>
      <Copy className="h-4 w-4" />
      {pending ? "Copying..." : label}
    </Button>
  );
}
