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
import { TrendingUp, Sparkles, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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
    return `${(value / 1_000_000).toFixed(1)}jt`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}rb`;
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
    <div className="rounded-2xl bg-slate-900 text-white p-3.5 shadow-2xl border border-white/10 text-xs space-y-1.5 backdrop-blur-md">
      <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider border-b border-white/10 pb-1">
        📅 Periode: {label}
      </p>
      {payload.map((entry) => (
        <div className="flex items-center justify-between gap-4" key={entry.name}>
          <div className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="font-medium text-white/80">{entry.name}:</span>
          </div>
          <strong className="font-mono font-bold text-white tabular-nums">
            {formatCurrency(entry.value)}
          </strong>
        </div>
      ))}
    </div>
  );
}

export function MonthlyChart({ data, locale }: MonthlyChartProps) {
  const totalGross = data.reduce((sum, d) => sum + (d.gross || 0), 0);
  const totalNet = data.reduce((sum, d) => sum + (d.net || 0), 0);
  const marginPercent = totalGross > 0 ? Math.round((totalNet / totalGross) * 100) : 0;

  if (data.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-6 shadow-md border border-border/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Tren Omset & Laba Bersih</h3>
              <p className="text-xs text-muted-foreground">Grafik performa finansial studio per bulan</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-12 text-center space-y-1">
          <Sparkles className="h-6 w-6 text-emerald-500 mb-1" />
          <p className="text-xs font-semibold text-foreground">Belum ada data transaksi bulanan</p>
          <p className="text-[11px] text-muted-foreground">Buat pekerjaan pertama untuk melihat grafik finansial.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-6 shadow-md border border-border/80 space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-md shadow-emerald-500/20">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Tren Omset & Laba Bersih</h3>
            <p className="text-xs text-muted-foreground">Perbandingan Omset Kotor (Gross) vs Laba Bersih (Net Profit)</p>
          </div>
        </div>

        {/* Quick Margin Metric */}
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-right">
            <span className="text-[10px] text-muted-foreground block">Margin Keuntungan</span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
              {marginPercent}% Profit
            </span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full pt-4">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={data} margin={{ top: 25, right: 15, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border) / 0.7)"
            />
            <XAxis
              axisLine={false}
              dataKey="month"
              fontSize={11}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              fontSize={11}
              tickFormatter={formatCompactIDR}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              width={42}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            />

            <Area
              type="monotone"
              dataKey="gross"
              fill="url(#grossGradient)"
              stroke="#10b981"
              strokeWidth={3}
              name="Omset Kotor (Gross)"
              dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="net"
              fill="url(#netGradient)"
              stroke="#06b6d4"
              strokeWidth={3}
              name="Laba Bersih (Net)"
              dot={{ r: 3, fill: "#06b6d4", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#06b6d4", stroke: "#ffffff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
