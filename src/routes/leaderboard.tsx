import { createFileRoute, Link } from "@tanstack/react-router";
import { useSim, portfolioSummary } from "@/lib/sim/store";
import { inr, pct, signed, toneClass } from "@/lib/sim/format";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/sim/csv";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Trading Performance Leaderboard — CHRIST Virtual Stock Exchange" },
      {
        name: "description",
        content:
          "Virtual trading performance of every participating trader. Performance is a learning measure only and does not decide assessment marks.",
      },
      { property: "og:title", content: "Trading Performance Leaderboard" },
      {
        property: "og:description",
        content: "Ranking by simulated portfolio value. Assessment marks are awarded manually and separately.",
      },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { state } = useSim();

  const rows = state.students
    .map((st) => ({ st, s: portfolioSummary(st, state.prices) }))
    .sort((a, b) => b.s.value - a.s.value);

  const exportCsv = () => {
    downloadCsv("cvse-trading-performance.csv", [
      ["Rank", "Trader ID", "Name", "Student ID", "Section", "Cash", "Investments", "Portfolio Value", "P&L", "P&L %", "Trades"],
      ...rows.map((r, i) => [
        i + 1,
        r.st.traderId,
        r.st.name,
        r.st.studentId,
        r.st.section,
        r.s.cash.toFixed(2),
        r.s.investments.toFixed(2),
        r.s.value.toFixed(2),
        r.s.pnl.toFixed(2),
        r.s.pnlPct.toFixed(2),
        r.s.trades,
      ]),
    ]);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">Trading Performance Leaderboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Ranking by simulated portfolio value. This is a trading performance measure only — it does not decide
              assessment marks.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={rows.length === 0}>
              Export CSV
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/app">Back to Trading Floor</Link>
            </Button>
          </div>
        </div>

        <div className="mb-6 rounded-md border border-warn/40 bg-warn/10 px-4 py-3 text-xs font-semibold tracking-[0.1em] text-warn">
          PROFIT OR LOSS DOES NOT DETERMINE CIA MARKS · ASSESSMENT IS AWARDED MANUALLY OUT OF 5 PER STUDENT
        </div>

        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left">
                {["#", "Trader", "Student ID", "Section", "Cash", "Investments", "Portfolio Value", "P&L", "Trades"].map(
                  (h) => (
                    <th key={h} className="label-xs px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.st.id} className="border-b border-border/40 last:border-0">
                  <td className="tabular px-4 py-3 font-semibold">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.st.name}</div>
                    <div className="tabular text-xs text-muted-foreground">{r.st.traderId}</div>
                  </td>
                  <td className="tabular px-4 py-3 text-muted-foreground">{r.st.studentId}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.st.section}</td>
                  <td className="tabular px-4 py-3">{inr(r.s.cash)}</td>
                  <td className="tabular px-4 py-3">{inr(r.s.investments)}</td>
                  <td className="tabular px-4 py-3 font-semibold">{inr(r.s.value)}</td>
                  <td className={cn("tabular px-4 py-3 font-semibold", toneClass(r.s.pnl))}>
                    {signed(r.s.pnl)} <span className="text-xs">({pct(r.s.pnlPct)})</span>
                  </td>
                  <td className="tabular px-4 py-3">{r.s.trades}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No traders have joined the simulation yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
