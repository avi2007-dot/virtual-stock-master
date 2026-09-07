import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHead, Stat, MarketStatusPill } from "@/components/sim/Shell";
import { useSim } from "@/lib/sim/store";
import { STOCKS } from "@/lib/sim/data";
import { dayChange } from "@/lib/sim/indices";
import { inr, pct, signed, toneClass } from "@/lib/sim/format";
import { PriceChart } from "@/components/sim/PriceChart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/stock/$symbol")({
  head: () => ({
    meta: [
      { title: "Stock Details — CHRIST Virtual Stock Exchange" },
      {
        name: "description",
        content:
          "Simulated stock detail view with price chart, fictional fundamental ratios and technical levels for a fictional listed company.",
      },
      { property: "og:title", content: "Stock Details — fundamentals and technicals" },
      { property: "og:description", content: "Chart, P/E, EPS, support, resistance and momentum — all simulated." },
    ],
  }),
  component: StockPage,
});

const outlookTone = (o: string) =>
  ["POSITIVE", "BULLISH"].includes(o)
    ? "text-gain border-gain/40 bg-gain/10"
    : ["NEGATIVE", "BEARISH"].includes(o)
      ? "text-loss border-loss/40 bg-loss/10"
      : "text-warn border-warn/40 bg-warn/10";

function StockPage() {
  const { symbol } = Route.useParams();
  const { state } = useSim();
  const navigate = useNavigate();
  const meta = STOCKS.find((s) => s.symbol === symbol);
  const p = meta ? state.prices[meta.symbol] : undefined;

  if (!meta || !p) {
    return (
      <div className="panel p-8 text-center">
        <p className="text-sm text-muted-foreground">That company is not listed on this simulated exchange.</p>
        <Button asChild className="mt-4">
          <Link to="/app/market">Back to Market</Link>
        </Button>
      </div>
    );
  }

  const d = dayChange(p);
  const prev = p.history.length > 1 ? p.history[p.history.length - 2]! : p.open;

  return (
    <>
      <PageHead
        title={meta.name}
        sub={`${meta.symbol} · ${meta.sector} · simulated listing`}
        right={
          <div className="flex items-center gap-2">
            <MarketStatusPill />
            <Button
              size="sm"
              variant="gain"
              onClick={() => navigate({ to: "/app/trade", search: { symbol: meta.symbol, side: "BUY" } })}
            >
              BUY
            </Button>
            <Button
              size="sm"
              variant="loss"
              onClick={() => navigate({ to: "/app/trade", search: { symbol: meta.symbol, side: "SELL" } })}
            >
              SELL
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Current Price" value={inr(p.price)} />
        <Stat label="Day Change" value={`${signed(d.abs)} (${pct(d.pct)})`} tone={d.abs >= 0 ? "gain" : "loss"} />
        <Stat label="Previous Price" value={inr(prev)} />
        <Stat label="Day High" value={inr(p.high)} />
        <Stat label="Day Low" value={inr(p.low)} />
        <Stat label="Volume" value={p.volume.toLocaleString("en-IN")} />
      </div>

      <div className="mt-4">
        <PriceChart history={p.history} price={p.price} up={d.abs >= 0} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <div className="label-xs">Fundamental information</div>
            <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold", outlookTone(meta.fundamentals.outlook))}>
              {meta.fundamentals.outlook}
            </span>
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            {[
              ["Revenue growth", meta.fundamentals.revenueGrowth],
              ["Profit growth", meta.fundamentals.profitGrowth],
              ["EPS", meta.fundamentals.eps],
              ["Debt", meta.fundamentals.debt],
              ["P/E ratio", meta.fundamentals.pe],
              ["Dividend", meta.fundamentals.dividend],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/70 pb-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="tabular">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Fundamental analysis studies the business — growth, earnings, debt and valuation — to judge whether the
            price is justified. All figures here are fictional.
          </p>
        </div>

        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <div className="label-xs">Technical information</div>
            <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold", outlookTone(meta.technicals.outlook))}>
              {meta.technicals.outlook}
            </span>
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            {[
              ["Moving average", meta.technicals.ma],
              ["Support", inr(meta.technicals.support)],
              ["Resistance", inr(meta.technicals.resistance)],
              ["Momentum", meta.technicals.momentum],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/70 pb-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="tabular">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Technical analysis studies price and volume behaviour — support, resistance, moving averages and momentum
            — to time entries and exits.
          </p>
          <p className={cn("tabular mt-3 text-xs", toneClass(p.price - meta.technicals.resistance))}>
            Price is {p.price > meta.technicals.resistance ? "above resistance" : p.price < meta.technicals.support ? "below support" : "between support and resistance"}.
          </p>
        </div>
      </div>
    </>
  );
}
