import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Stat } from "@/components/sim/Shell";
import { portfolioSummary, useSim, marksTotal } from "@/lib/sim/store";
import { indices, marketSummary, dayChange } from "@/lib/sim/indices";
import { inr, inr0, pct, signed, toneClass } from "@/lib/sim/format";
import { SESSION_TIMELINE, START_CAPITAL, STOCKS } from "@/lib/sim/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Trading Dashboard — CHRIST Virtual Stock Exchange" },
      {
        name: "description",
        content: "Your virtual trading dashboard: simulated indices, market summary, holdings and round progress.",
      },
      { property: "og:title", content: "Virtual Trading Dashboard" },
      { property: "og:description", content: "Simulated indices, cash balance, portfolio value and profit/loss." },
    ],
  }),
  component: Dashboard,
});

const ROUND_LABELS = [
  "Round 1 – Fundamental Analysis",
  "Round 2 – Technical Analysis",
  "Round 3 – Market Shock",
  "Round 4 – Commodity Market",
];

function Dashboard() {
  const { state, student } = useSim();
  if (!student) return null;
  const s = portfolioSummary(student, state.prices);
  const idx = indices(state.prices);
  const sum = marketSummary(state.prices);
  const marks = state.marks[student.id];

  return (
    <>
      <PageHead
        title={`Welcome, ${student.name.split(" ")[0]}`}
        sub={`${student.traderId} · ${student.section} · Round ${state.round === 0 ? "not started" : state.round} of 4`}
        right={
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link to="/app/trade">Place an Order</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/app/rounds">Go to Rounds</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Initial Capital" value={inr0(START_CAPITAL)} hint="Virtual money" />
        <Stat label="Cash Balance" value={inr(s.cash)} hint="Available to trade" />
        <Stat label="Portfolio Value" value={inr(s.value)} hint={`Investments ${inr(s.investments)}`} />
        <Stat
          label="Profit / Loss"
          value={`${signed(s.pnl)} (${pct(s.pnlPct)})`}
          tone={s.pnl >= 0 ? "gain" : "loss"}
          hint="Trading performance only — not your CIA mark"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="label-xs">Simulated indices</div>
            <div className="tabular text-xs text-muted-foreground">Session 09:15 – 15:30</div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              { name: "CHRIST SENSEX", d: idx.sensex, note: "Fictional broad-market index (BSE-style)" },
              { name: "CHRIST NIFTY 50", d: idx.nifty, note: "Fictional 50-stock index (NSE-style)" },
            ].map((i) => (
              <div key={i.name} className="rounded-lg border border-border bg-background/40 p-4">
                <div className="font-display text-sm font-semibold tracking-wide">{i.name}</div>
                <div className="tabular mt-1 text-2xl font-bold">
                  {i.d.value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={cn("tabular text-sm font-semibold", toneClass(i.d.change))}>{pct(i.d.change)}</div>
                <div className="mt-2 text-[11px] text-muted-foreground">{i.note} · SIMULATED</div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Advancing" value={sum.advancing} tone="gain" />
            <Stat label="Declining" value={sum.declining} tone="loss" />
            <Stat label="Unchanged" value={sum.unchanged} />
            <Stat label="Total Volume" value={sum.volume.toLocaleString("en-IN")} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-5">
            <div className="label-xs">Round progress</div>
            <ul className="mt-3 space-y-2 text-sm">
              {ROUND_LABELS.map((l, i) => {
                const done = !!student.responses[`round${i + 1}`];
                return (
                  <li key={l} className="flex items-center justify-between gap-2">
                    <span className={done ? "" : "text-muted-foreground"}>{l}</span>
                    <span className={done ? "text-gain" : "text-muted-foreground"}>{done ? "✓" : "—"}</span>
                  </li>
                );
              })}
              <li className="flex items-center justify-between gap-2">
                <span className={Object.keys(student.responses).some((k) => k.startsWith("set")) ? "" : "text-muted-foreground"}>
                  Settlement
                </span>
                <span className={Object.keys(student.responses).some((k) => k.startsWith("set")) ? "text-gain" : "text-muted-foreground"}>
                  {Object.keys(student.responses).some((k) => k.startsWith("set")) ? "✓" : "—"}
                </span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className={Object.keys(student.responses).some((k) => k.startsWith("risk")) ? "" : "text-muted-foreground"}>
                  Risk Management
                </span>
                <span className={Object.keys(student.responses).some((k) => k.startsWith("risk")) ? "text-gain" : "text-muted-foreground"}>
                  {Object.keys(student.responses).some((k) => k.startsWith("risk")) ? "✓" : "—"}
                </span>
              </li>
            </ul>
            <div className="mt-4 rounded-md border border-border bg-surface p-3 text-xs">
              <div className="label-xs">CIA Assessment</div>
              <div className="tabular mt-1 text-lg font-bold">
                {marks?.locked ? `${marksTotal(marks)} / 5` : "Not yet marked"}
              </div>
              <p className="mt-1 text-muted-foreground">Marks are awarded manually by the evaluator.</p>
            </div>
          </div>

          <div className="panel p-5">
            <div className="label-xs">Session stages</div>
            <ul className="mt-3 space-y-2 text-xs">
              {SESSION_TIMELINE.map((t) => (
                <li key={t.label} className="flex gap-3">
                  <span className="tabular w-24 shrink-0 text-primary">{t.time}</span>
                  <span>{t.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="panel mt-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="label-xs">Watchlist</div>
          <Link to="/app/market" className="text-xs text-primary">
            Full market →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {STOCKS.map((st) => {
            const p = state.prices[st.symbol]!;
            const d = dayChange(p);
            return (
              <Link
                key={st.symbol}
                to="/app/stock/$symbol"
                params={{ symbol: st.symbol }}
                className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-surface-strong/60"
              >
                <span>
                  <span className="block text-sm font-medium">{st.name}</span>
                  <span className="label-xs">
                    {st.symbol} · {st.sector}
                  </span>
                </span>
                <span className="text-right">
                  <span className="tabular block text-sm">{inr(p.price)}</span>
                  <span className={cn("tabular block text-xs", toneClass(d.abs))}>
                    {signed(d.abs)} ({pct(d.pct)})
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
