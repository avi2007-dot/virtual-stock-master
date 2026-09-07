import { useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { inr } from "@/lib/sim/format";

const RANGES = ["1D", "1W", "1M"] as const;
type Range = (typeof RANGES)[number];

/** Deterministic pseudo-history so the chart is stable between renders. */
function buildSeries(history: number[], price: number, range: Range) {
  if (range === "1D") {
    return history.slice(-30).map((v, i) => ({ t: `T${i + 1}`, v: +v.toFixed(2) }));
  }
  const points = range === "1W" ? 7 : 30;
  const out: { t: string; v: number }[] = [];
  for (let i = points; i >= 1; i--) {
    const wobble = Math.sin(i * (range === "1W" ? 1.1 : 0.55)) * 0.018 + Math.cos(i * 0.3) * 0.01;
    out.push({
      t: range === "1W" ? `D-${i - 1}` : `${i - 1}d`,
      v: +(price * (1 - i * 0.0022 + wobble)).toFixed(2),
    });
  }
  out.push({ t: "Now", v: +price.toFixed(2) });
  return out;
}

export function PriceChart({
  history,
  price,
  up,
  height = 260,
}: {
  history: number[];
  price: number;
  up: boolean;
  height?: number;
}) {
  const [range, setRange] = useState<Range>("1D");
  const data = useMemo(() => buildSeries(history, price, range), [history, price, range]);
  const color = up ? "var(--gain)" : "var(--loss)";

  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="label-xs">Price Chart · simulated</div>
        <div className="flex gap-1 rounded-md border border-border bg-background/60 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`g-${up ? "up" : "dn"}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="t" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis
              domain={["dataMin - 5", "dataMax + 5"]}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={58}
              tickFormatter={(v: number) => inr(v, 0)}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              formatter={(v: number) => [inr(v), "Price"]}
            />
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#g-${up ? "up" : "dn"})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
