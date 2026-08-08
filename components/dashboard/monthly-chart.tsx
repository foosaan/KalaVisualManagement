"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

import { type Locale, t } from "@/lib/i18n";
import { TrendingUp } from "lucide-react";

type MonthlyDataPoint = {
  month: string;
  gross: number;
  net: number;
};

type MonthlyChartProps = {
  data: MonthlyDataPoint[];
  locale: Locale;
};

function formatCompactIDR(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return String(value);
}

function CustomTooltip({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="glass-card rounded-xl px-4 py-3 shadow-elevated border border-white/60">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {label}
      </p>
      {payload.map((entry) => (
        <div className="flex items-center gap-2" key={entry.name}>
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: entry.color }}
          />
          <p className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: Rp{entry.value.toLocaleString("id-ID")}
          </p>
        </div>
      ))}
    </div>
  );
}

export function MonthlyChart({ data, locale }: MonthlyChartProps) {
  if (data.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-scale-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="gradient-icon gradient-icon-emerald">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold">{t("dashboard.monthlyTrend", locale)}</h3>
            <p className="text-sm text-muted-foreground">{t("dashboard.monthlyTrendDesc", locale)}</p>
          </div>
        </div>
        <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16">
          <p className="text-sm text-muted-foreground">
            {t("dashboard.noTrendData", locale)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 animate-scale-in stagger-3">
      <div className="flex items-center gap-3 mb-6">
        <div className="gradient-icon gradient-icon-emerald">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold">{t("dashboard.monthlyTrend", locale)}</h3>
          <p className="text-xs text-muted-foreground">{t("dashboard.monthlyTrendDesc", locale)}</p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <defs>
              <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(187, 92%, 35%)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(187, 92%, 35%)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(220 13% 91% / 0.6)"
            />
            <XAxis
              axisLine={false}
              dataKey="month"
              fontSize={11}
              tickLine={false}
              tick={{ fill: "hsl(220 9% 56%)" }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              fontSize={11}
              tickFormatter={formatCompactIDR}
              tickLine={false}
              tick={{ fill: "hsl(220 9% 56%)" }}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
            />

            <Area
              type="monotone"
              dataKey="gross"
              fill="url(#grossGradient)"
              stroke="hsl(160, 84%, 39%)"
              strokeWidth={2.5}
              name="Gross"
              dot={{ r: 0 }}
              activeDot={{
                r: 5,
                fill: "hsl(160, 84%, 39%)",
                stroke: "white",
                strokeWidth: 2
              }}
            />
            <Area
              type="monotone"
              dataKey="net"
              fill="url(#netGradient)"
              stroke="hsl(187, 92%, 35%)"
              strokeWidth={2.5}
              name="Net"
              dot={{ r: 0 }}
              activeDot={{
                r: 5,
                fill: "hsl(187, 92%, 35%)",
                stroke: "white",
                strokeWidth: 2
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
