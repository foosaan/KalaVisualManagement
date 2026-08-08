"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateWorkflowStatusAction } from "@/lib/actions/jobs";
import { cn } from "@/lib/utils";

type WorkflowStatus = "scheduled" | "shot" | "editing" | "ready" | "delivered";

const STEPS: { value: WorkflowStatus; label: string; icon: string }[] = [
  { value: "scheduled", label: "Scheduled", icon: "📅" },
  { value: "shot", label: "Shot", icon: "📸" },
  { value: "editing", label: "Editing", icon: "✏️" },
  { value: "ready", label: "Ready", icon: "📦" },
  { value: "delivered", label: "Delivered", icon: "✅" }
];

type InlineWorkflowSelectorProps = {
  jobId: string;
  current: WorkflowStatus;
  variant?: "select" | "steps";
};

export function InlineWorkflowSelector({ jobId, current, variant = "select" }: InlineWorkflowSelectorProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(newStatus: WorkflowStatus) {
    if (newStatus === current || pending) return;
    startTransition(async () => {
      await updateWorkflowStatusAction(jobId, newStatus);
      router.refresh();
    });
  }

  if (variant === "steps") {
    const currentIndex = STEPS.findIndex((s) => s.value === current);
    const nextStep = STEPS[currentIndex + 1];

    return (
      <div className="flex items-center gap-2">
        {/* Step dots */}
        <div className="flex items-center gap-1">
          {STEPS.map((step, i) => (
            <button
              key={step.value}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-all",
                i <= currentIndex ? "bg-primary scale-100" : "bg-muted scale-90",
                !pending && "hover:scale-125 cursor-pointer"
              )}
              disabled={pending}
              onClick={() => handleChange(step.value)}
              title={`${step.icon} ${step.label}`}
              type="button"
            />
          ))}
        </div>

        {/* Next step button */}
        {nextStep && (
          <button
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all",
              "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10",
              pending && "opacity-50 cursor-wait"
            )}
            disabled={pending}
            onClick={() => handleChange(nextStep.value)}
            type="button"
          >
            {pending ? "..." : `${nextStep.icon} ${nextStep.label} →`}
          </button>
        )}
      </div>
    );
  }

  // Select variant (for table rows)
  return (
    <select
      className={cn(
        "h-7 rounded-lg border border-border bg-background px-2 text-[11px] font-medium transition-all",
        "hover:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30",
        pending && "opacity-50 cursor-wait"
      )}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value as WorkflowStatus)}
      value={current}
    >
      {STEPS.map((step) => (
        <option key={step.value} value={step.value}>
          {step.icon} {step.label}
        </option>
      ))}
    </select>
  );
}
