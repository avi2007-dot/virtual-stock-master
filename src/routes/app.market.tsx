import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHead, Stat, MarketStatusPill } from "@/components/sim/Shell";
import { useSim } from "@/lib/sim/store";
import { COMMODITIES, SESSION_TIMELINE, STOCKS } from "@/lib/sim/data";
import { dayChange, indices, marketSummary } from "@/lib/sim/indices";
import { inr, pct, signed, toneClass } from "@/lib/sim/format";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/market")({
  head: () => ({
    meta: [
      { title: "Market Overview — CHRIST Virtual Stock Exchange" },
      {
        name: "description",
        content:
          "Simulated market screen with fictional indices, six listed companies, market summary and simulated commodity contracts.",
      },
      { property: "og:title", content: "Market Overview — simulated equity and commodity prices" },
      { property: "og:description", content: "Advancing and declining stocks, volumes and live-looking prices." },
    ],
  }),
  component: MarketPage,
});

function MarketPage() {
  const { state } = useSim();
  const navigate = useNavigate();
  const idx = indices(state.prices);
  const sum = marketSummary(state.prices);

  return (
    <>
      <PageHead
        title="Market Overview"
        sub="Fictional educational indices and contracts — prices move in controlled simulated rounds."
        right={<MarketStatusPill />}
      />

      <div className="grid gap-3 lg:grid-cols-4">
        <div className="panel p-5 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { name: "CHRIST SENSEX", d: idx.sensex },
              { name: "CHRIST NIFTY 50", d: idx.nifty },
            ].map((i) => (
              <div key={i.name}>
                <div className="font-display text-sm font-semibold tracking-wide">{i.name}</div>
                <div className="tabular mt-1 text-2xl font-bold">
                  {i.d.value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={cn("tabular text-sm font-semibold", toneClass(i.d.change))}>{pct(i.d.change)}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-warn">SIMULATED INDICES — educational use only.</p>
        </div>
        <Stat label="Advancing / Declining" value={`${sum.advancing} / ${sum.declining}`} />
        <Stat label="Total Volume" value={sum.volume.toLocaleString("en-IN")} hint={`Unchanged: ${sum.unchanged}`} />
      </div>

      <div className="panel mt-4 flex flex-wrap gap-x-8 gap-y-2 p-4">
        {SESSION_TIMELINE.map((t) => (
          <div key={t.label}>
            <div className="tabular text-xs text-primary">{t.time}</div>
            <div className="text-sm font-medium">{t.label}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="equity" className="mt-6">
        <TabsList>
          <TabsTrigger value="equity">Equity Market</TabsTrigger>
          <TabsTrigger value="commodity">Commodity Market</TabsTrigger>
        </TabsList>

        <TabsContent value="equity" className="mt-4">
          <div className="panel overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Company", "Symbol", "Sector", "Price", "Change", "% Change", "Volume", "Action"].map((h) => (
                    <th key={h} className="label-xs px-4 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {STOCKS.map((s) => {
                  const p = state.prices[s.symbol]!;
                  const d = dayChange(p);
                  return (
                    <tr key={s.symbol} className="transition-colors hover:bg-surface-strong/50">
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="tabular px-4 py-3 text-muted-foreground">{s.symbol}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.sector}</td>
                      <td className="tabular px-4 py-3">{inr(p.price)}</td>
                      <td className={cn("tabular px-4 py-3", toneClass(d.abs))}>{signed(d.abs)}</td>
                      <td className={cn("tabular px-4 py-3", toneClass(d.pct))}>{pct(d.pct)}</td>
                      <td className="tabular px-4 py-3 text-muted-foreground">{p.volume.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            variant="gain"
                            onClick={() => navigate({ to: "/app/trade", search: { symbol: s.symbol, side: "BUY" } })}
                          >
                            BUY
                          </Button>
                          <Button
                            size="sm"
                            variant="loss"
                            onClick={() => navigate({ to: "/app/trade", search: { symbol: s.symbol, side: "SELL" } })}
                          >
                            SELL
                          </Button>
                          <Button asChild size="sm" variant="outline">
                            <Link to="/app/stock/$symbol" params={{ symbol: s.symbol }}>
                              View Analysis
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="commodity" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {COMMODITIES.map((c) => {
              const p = state.commodities[c.symbol]!;
              const d = dayChange(p);
              return (
                <div key={c.symbol} className="panel p-5">
                  <div className="label-xs">{c.symbol} · MCX-style contract</div>
                  <div className="mt-1 text-sm font-semibold">{c.name}</div>
                  <div className="tabular mt-2 text-xl font-bold">{inr(p.price)}</div>
                  <div className={cn("tabular text-sm", toneClass(d.abs))}>
                    {signed(d.abs)} ({pct(d.pct)})
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {c.unit} · {c.lot}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Commodity contracts here are simulated for the Round 4 exercise. Positions are recorded as decisions with
            justification rather than as cash trades.
          </p>
        </TabsContent>
      </Tabs>
    </>
  );
}
