"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  CalendarClock,
  CircleDollarSign,
  Clock,
  Receipt,
  Users2
} from "lucide-react";

import { cn } from "@/lib/utils";

type IconName = "banknote" | "dollar" | "receipt" | "calendar" | "users" | "clock";

type SummaryCardProps = {
  label: string;
  value: string;
  helper: string;
  accent?: "emerald" | "cyan" | "amber" | "red" | "violet" | "default";
  iconName?: IconName;
  index?: number;
  href?: string;
};

const iconMap: Record<IconName, React.ComponentType<{ className?: string }>> = {
  banknote: Banknote,
  dollar: CircleDollarSign,
  receipt: Receipt,
  calendar: CalendarClock,
  users: Users2,
  clock: Clock
};

const accentConfig: Record<string, {
  gradient: string;
  iconGradient: string;
  glowColor: string;
  valueColor: string;
}> = {
  emerald: {
    gradient: "from-emerald-500/5 to-emerald-500/[0.02]",
    iconGradient: "gradient-icon-emerald",
    glowColor: "group-hover:shadow-[0_8px_32px_-8px_hsl(160_84%_39%/0.15)]",
    valueColor: "text-emerald-700"
  },
  cyan: {
    gradient: "from-cyan-500/5 to-cyan-500/[0.02]",
    iconGradient: "gradient-icon-cyan",
    glowColor: "group-hover:shadow-[0_8px_32px_-8px_hsl(187_92%_35%/0.15)]",
    valueColor: "text-cyan-700"
  },
  amber: {
    gradient: "from-amber-500/5 to-amber-500/[0.02]",
    iconGradient: "gradient-icon-amber",
    glowColor: "group-hover:shadow-[0_8px_32px_-8px_hsl(38_92%_50%/0.15)]",
    valueColor: "text-amber-700"
  },
  red: {
    gradient: "from-red-500/5 to-red-500/[0.02]",
    iconGradient: "gradient-icon-red",
    glowColor: "group-hover:shadow-[0_8px_32px_-8px_hsl(0_72%_51%/0.15)]",
    valueColor: "text-red-700"
  },
  violet: {
    gradient: "from-violet-500/5 to-violet-500/[0.02]",
    iconGradient: "gradient-icon-violet",
    glowColor: "group-hover:shadow-[0_8px_32px_-8px_hsl(263_70%_50%/0.15)]",
    valueColor: "text-violet-700"
  },
  default: {
    gradient: "from-gray-500/5 to-gray-500/[0.02]",
    iconGradient: "gradient-icon-emerald",
    glowColor: "group-hover:shadow-[0_8px_32px_-8px_rgb(0_0_0/0.08)]",
    valueColor: "text-foreground"
  }
};

export function SummaryCard({
  label,
  value,
  helper,
  accent = "default",
  iconName,
  index = 0,
  href
}: SummaryCardProps) {
  const config = accentConfig[accent] || accentConfig.default;
  const Icon = iconName ? iconMap[iconName] : null;

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {label}
          </p>
          <p className={cn(
            "text-2xl font-bold tabular-nums tracking-tight",
            config.valueColor
          )}>
            {value}
          </p>
          <p className="text-xs text-muted-foreground/70">{helper}</p>
        </div>

        {Icon && (
          <div className={cn("gradient-icon", config.iconGradient, "transition-transform group-hover:scale-110 group-hover:rotate-3")}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </>
  );

  const className = cn(
    "group glass-card glass-card-hover rounded-2xl p-5 bg-gradient-to-br",
    config.gradient,
    config.glowColor,
    "animate-slide-up",
    index > 0 ? `stagger-${index}` : "",
    href && "cursor-pointer"
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
}
