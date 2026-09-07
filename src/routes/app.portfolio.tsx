import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Stat } from "@/components/sim/Shell";
import { portfolioSummary, useSim } from "@/lib/sim/store";
import { START_CAPITAL, STOCKS } from "@/lib/sim/data";
import { inr, inr0, pct, signed, toneClass } from "@/lib/sim/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — CHRIST Virtual Stock Exchange" },
      {
        name: "description",
        content:
          "Virtual portfolio dashboard: cash, investments, portfolio value, profit and loss and a holdings table that updates with every trade.",
      },
      { property: "og:title", content: "Virtual Portfolio & Holdings" },
      { property: "og:description", content: "Quantity, buy price, current price and profit or loss per holding." },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { state, student } = useSim();
  if (!student) return null;
  const s = portfolioSummary(student, state.prices);
  const rows = Object.entries(student.holdings);

  return (
    <>
      <PageHead
        title="Portfolio"
        sub="Trading performance only — this does not decide your CIA mark."
        right={
          <Button asChild size="sm">
            <Link to="/app/trade" search={{ symbol: "ALPHAM", side: "BUY" }}>
              Trade
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Initial Capital" value={inr0(START_CAPITAL)} />
        <Stat label="Cash" value={inr(s.cash)} />
        <Stat label="Investments" value={inr(s.investments)} />
        <Stat label="Portfolio Value" value={inr(s.value)} />
        <Stat label="P&L" value={signed(s.pnl)} tone={s.pnl >= 0 ? "gain" : "loss"} />
        <Stat label="P&L %" value={pct(s.pnlPct)} tone={s.pnl >= 0 ? "gain" : "loss"} />
      </div>

      <div className="panel mt-4 overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {["Stock", "Quantity", "Buy Price (avg)", "Current Price", "Invested", "Current Value", "P&L"].map(
                (h) => (
                  <th key={h} className="label-xs px-4 py-3 font-medium">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No holdings yet. Place a buy order from the Trade screen.
                </td>
              </tr>
            )}
            {rows.map(([sym, h]) => {
              const meta = STOCKS.find((x) => x.symbol === sym);
              const cur = state.prices[sym]?.price ?? 0;
              const invested = h.qty * h.avg;
              const value = h.qty * cur;
              const pl = value - invested;
              return (
                <tr key={sym} className="hover:bg-surface-strong/50">
                  <td className="px-4 py-3">
                    <Link to="/app/stock/$symbol" params={{ symbol: sym }} className="font-medium hover:text-primary">
                      {meta?.name ?? sym}
                    </Link>
                    <div className="label-xs">{sym}</div>
                  </td>
                  <td className="tabular px-4 py-3">{h.qty}</td>
                  <td className="tabular px-4 py-3">{inr(h.avg)}</td>
                  <td className="tabular px-4 py-3">{inr(cur)}</td>
                  <td className="tabular px-4 py-3">{inr(invested)}</td>
                  <td className="tabular px-4 py-3">{inr(value)}</td>
                  <td className={cn("tabular px-4 py-3 font-semibold", toneClass(pl))}>
                    {signed(pl)} ({pct((pl / invested) * 100)})
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Securities bought in this simulation are shown as if held electronically in your demat account. Cash and
        holdings update automatically as orders execute.
      </p>
    </>
  );
}
