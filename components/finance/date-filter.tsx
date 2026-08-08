"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRESETS = [
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "This Year", value: "this_year" },
  { label: "All Time", value: "all" }
] as const;

function getPresetDates(preset: string) {
  const now = new Date();
  switch (preset) {
    case "this_month":
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
      };
    case "last_month":
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10),
        to: new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10)
      };
    case "this_year":
      return {
        from: new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10),
        to: new Date(now.getFullYear(), 11, 31).toISOString().slice(0, 10)
      };
    default:
      return { from: "", to: "" };
  }
}

export function FinanceDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFrom = searchParams.get("from") || "";
  const currentTo = searchParams.get("to") || "";

  const [from, setFrom] = useState(currentFrom);
  const [to, setTo] = useState(currentTo);

  const applyFilter = (f: string, t: string) => {
    const params = new URLSearchParams();
    if (f) params.set("from", f);
    if (t) params.set("to", t);
    router.push(`/finance${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handlePreset = (preset: string) => {
    const { from: f, to: t } = getPresetDates(preset);
    setFrom(f);
    setTo(t);
    applyFilter(f, t);
  };

  const handleApply = () => {
    applyFilter(from, to);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            className="rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            key={preset.value}
            onClick={() => handlePreset(preset.value)}
            type="button"
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <Input
          onChange={(e) => setFrom(e.target.value)}
          placeholder="From date"
          type="date"
          value={from}
        />
        <Input
          onChange={(e) => setTo(e.target.value)}
          placeholder="To date"
          type="date"
          value={to}
        />
        <Button onClick={handleApply} size="sm" variant="outline">
          Apply
        </Button>
      </div>
    </div>
  );
}
