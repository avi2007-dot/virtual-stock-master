import { createFileRoute } from "@tanstack/react-router";
import { useSim } from "@/lib/sim/store";
import { PageHead } from "@/components/sim/Shell";
import { ConceptQuestion } from "@/components/sim/QuizCard";
import { ECOSYSTEM, EQ_VS_COMM, SESSION_TIMELINE, STOCKS, ORDER_TYPE_HELP } from "@/lib/sim/data";
import { MechanismFlow } from "@/components/sim/MechanismFlow";
import { indices } from "@/lib/sim/indices";
import { inr, pct, toneClass } from "@/lib/sim/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/analysis")({
  head: () => ({
    meta: [
      { title: "Analysis Hub — CHRIST Virtual Stock Exchange" },
      {
        name: "description",
        content:
          "Learn fundamental and technical analysis, exchanges and regulators, depositories, indices, order types and the trading mechanism inside the simulation.",
      },
      { property: "og:title", content: "Analysis Hub — CHRIST Virtual Stock Exchange" },
      {
        property: "og:description",
        content: "Fundamental vs technical analysis, BSE/NSE/MCX/SEBI, depositories, indices and order types.",
      },
    ],
  }),
  component: AnalysisPage,
});

const DEPOSITORIES = [
  {
    code: "NSDL",
    full: "National Securities Depository Limited",
    detail:
      "India's first depository (1996). Holds securities in electronic (dematerialised) form and maintains ownership records.",
  },
  {
    code: "CDSL",
    full: "Central Depository Services (India) Limited",
    detail: "Second depository (1999). Performs the same custody and record-keeping role for demat holdings.",
  },
  {
    code: "DP",
    full: "Depository Participant",
    detail:
      "The agent (bank or broker) through which an investor opens and operates a demat account with NSDL or CDSL.",
  },
  {
    code: "Demat vs Trading",
    full: "Two different accounts",
    detail:
      "A demat account stores your securities; a trading account is used to place buy/sell orders on the exchange. Both are needed to trade delivery-based equity.",
  },
];

function AnalysisPage() {
  const { state } = useSim();
  const idx = indices(state.prices);

  return (
    <div>
      <PageHead
        title="Analysis Hub"
        sub="Everything the simulation assesses: analysis, market institutions, indices, order types, mechanism and sessions."
      />

      <Tabs defaultValue="analysis">
        <TabsList className="flex-wrap">
          <TabsTrigger value="analysis">Fundamental &amp; Technical</TabsTrigger>
          <TabsTrigger value="market">Exchanges &amp; SEBI</TabsTrigger>
          <TabsTrigger value="depository">Depositories &amp; Demat</TabsTrigger>
          <TabsTrigger value="indices">Indices</TabsTrigger>
          <TabsTrigger value="orders">Order Types</TabsTrigger>
          <TabsTrigger value="mechanism">Mechanism &amp; Sessions</TabsTrigger>
        </TabsList>

        {/* ------------------------------- ANALYSIS ------------------------------- */}
        <TabsContent value="analysis" className="mt-5 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="panel p-5">
              <h2 className="font-display text-base font-bold">Fundamental Analysis</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Studies the business itself — revenue and profit growth, earnings per share, debt levels, valuation
                (P/E), dividends and management outlook — to judge whether a share is worth its price. Best suited to
                medium and long-term decisions.
              </p>
            </div>
            <div className="panel p-5">
              <h2 className="font-display text-base font-bold">Technical Analysis</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Studies price and volume behaviour — moving averages, support and resistance, trend and momentum — to
                judge <em>when</em> to buy or sell. Best suited to short-term trading decisions.
              </p>
            </div>
          </div>

          <div className="panel overflow-x-auto">
            <div className="border-b border-border/60 px-4 py-2.5 label-xs">
              Simulated company data (fictional)
            </div>
            <table className="w-full min-w-[900px] text-sm">
              <thead className="label-xs">
                <tr className="border-b border-border/60">
                  <th className="px-4 py-2 text-left">Company</th>
                  <th className="px-4 py-2 text-right">Price</th>
                  <th className="px-4 py-2 text-left">Revenue</th>
                  <th className="px-4 py-2 text-left">Profit</th>
                  <th className="px-4 py-2 text-left">EPS</th>
                  <th className="px-4 py-2 text-left">P/E</th>
                  <th className="px-4 py-2 text-left">Debt</th>
                  <th className="px-4 py-2 text-left">Fundamental</th>
                  <th className="px-4 py-2 text-left">Technical</th>
                </tr>
              </thead>
              <tbody>
                {STOCKS.map((s) => {
                  const p = state.prices[s.symbol]!;
                  return (
                    <tr key={s.symbol} className="border-b border-border/40 last:border-0">
                      <td className="px-4 py-2.5">
                        <div className="font-semibold">{s.symbol}</div>
                        <div className="text-xs text-muted-foreground">{s.name}</div>
                      </td>
                      <td className="tabular px-4 py-2.5 text-right">{inr(p.price)}</td>
                      <td className="px-4 py-2.5">{s.fundamentals.revenueGrowth}</td>
                      <td className="px-4 py-2.5">{s.fundamentals.profitGrowth}</td>
                      <td className="tabular px-4 py-2.5">{s.fundamentals.eps}</td>
                      <td className="tabular px-4 py-2.5">{s.fundamentals.pe}</td>
                      <td className="px-4 py-2.5">{s.fundamentals.debt}</td>
                      <td className="px-4 py-2.5">
                        <Tag
                          text={s.fundamentals.outlook}
                          tone={
                            s.fundamentals.outlook === "POSITIVE"
                              ? "gain"
                              : s.fundamentals.outlook === "NEGATIVE"
                                ? "loss"
                                : "warn"
                          }
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <Tag
                          text={s.technicals.outlook}
                          tone={
                            s.technicals.outlook === "BULLISH"
                              ? "gain"
                              : s.technicals.outlook === "BEARISH"
                                ? "loss"
                                : "warn"
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="panel p-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide">Check your understanding</h3>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <ConceptQuestion
                responseKey="anaQ1"
                question="A trader buys a share because it has crossed its 50-day moving average with rising volume. This is:"
                options={["Fundamental analysis", "Technical analysis", "Insider information"]}
                answer="Technical analysis"
              />
              <ConceptQuestion
                responseKey="anaQ2"
                question="Which one of these is a fundamental indicator?"
                options={["Support level", "Earnings per share (EPS)", "Momentum", "Resistance level"]}
                answer="Earnings per share (EPS)"
                followUp="Pick any one company above and justify a BUY or AVOID using both types of analysis."
              />
            </div>
          </div>
        </TabsContent>

        {/* -------------------------------- MARKET -------------------------------- */}
        <TabsContent value="market" className="mt-5 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            {ECOSYSTEM.map((e) => (
              <div key={e.code} className="panel p-5">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-lg font-bold text-primary">{e.code}</span>
                  <span className="text-sm text-muted-foreground">{e.full}</span>
                </div>
                <p className="mt-2 text-sm">{e.role}</p>
                <p className="mt-2 text-sm text-muted-foreground">{e.history}</p>
                <p className="mt-2 text-sm text-muted-foreground">{e.does}</p>
              </div>
            ))}
          </div>

          <div className="panel overflow-x-auto">
            <div className="border-b border-border/60 px-4 py-2.5 label-xs">Equity vs Commodity trading</div>
            <table className="w-full min-w-[640px] text-sm">
              <thead className="label-xs">
                <tr className="border-b border-border/60">
                  <th className="px-4 py-2 text-left">Feature</th>
                  <th className="px-4 py-2 text-left">Equity</th>
                  <th className="px-4 py-2 text-left">Commodity</th>
                </tr>
              </thead>
              <tbody>
                {EQ_VS_COMM.map((r) => (
                  <tr key={r.feature} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-2.5 font-medium">{r.feature}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.equity}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.commodity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel p-5">
            <ConceptQuestion
              responseKey="anaQ3"
              question="Who regulates both the equity and the commodity derivatives segments in India?"
              options={["BSE", "SEBI", "NSDL", "MCX"]}
              answer="SEBI"
            />
          </div>
        </TabsContent>

        {/* ------------------------------ DEPOSITORY ------------------------------ */}
        <TabsContent value="depository" className="mt-5 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            {DEPOSITORIES.map((d) => (
              <div key={d.code} className="panel p-5">
                <div className="font-display text-base font-bold text-primary">{d.code}</div>
                <div className="text-sm text-muted-foreground">{d.full}</div>
                <p className="mt-2 text-sm">{d.detail}</p>
              </div>
            ))}
          </div>
          <div className="panel p-5">
            <ConceptQuestion
              responseKey="anaQ4"
              question="Where are your shares actually held after a delivery-based purchase settles?"
              options={["In the trading account", "In the demat account with a depository", "With the exchange", "In cash"]}
              answer="In the demat account with a depository"
            />
          </div>
        </TabsContent>

        {/* -------------------------------- INDICES ------------------------------- */}
        <TabsContent value="indices" className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { name: "CHRIST SENSEX (simulated)", v: idx.sensex, note: "Modelled on the BSE benchmark of 30 large companies." },
              { name: "CHRIST NIFTY 50 (simulated)", v: idx.nifty, note: "Modelled on the NSE benchmark of 50 large companies." },
            ].map((i) => (
              <div key={i.name} className="panel p-5">
                <div className="label-xs">{i.name}</div>
                <div className="tabular mt-1 text-2xl font-bold">
                  {i.v.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </div>
                <div className={cn("tabular text-sm font-semibold", toneClass(i.v.change))}>{pct(i.v.change)}</div>
                <p className="mt-2 text-sm text-muted-foreground">{i.note}</p>
              </div>
            ))}
          </div>
          <div className="panel p-5 text-sm text-muted-foreground">
            An index is a basket of selected shares whose weighted value shows the overall direction of the market. It
            is used as a benchmark to compare portfolio performance, to gauge sentiment and as the underlying for index
            derivatives. Values shown here are fictional and derived from the six simulated companies.
          </div>
          <div className="panel p-5">
            <ConceptQuestion
              responseKey="anaQ5"
              question="The SENSEX and NIFTY are published by which institutions respectively?"
              options={["BSE and NSE", "NSE and BSE", "SEBI and MCX", "NSDL and CDSL"]}
              answer="BSE and NSE"
            />
          </div>
        </TabsContent>

        {/* ------------------------------- ORDER TYPES ---------------------------- */}
        <TabsContent value="orders" className="mt-5 space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(ORDER_TYPE_HELP).map(([k, v]) => (
              <div key={k} className="panel p-5">
                <div className="font-display text-base font-bold text-primary">{k}</div>
                <p className="mt-2 text-sm text-muted-foreground">{v}</p>
              </div>
            ))}
          </div>
          <div className="panel p-5">
            <ConceptQuestion
              responseKey="anaQ6"
              question="You want certainty of price but are willing to risk non-execution. Which order do you place?"
              options={["Market order", "Limit order", "Stop-loss order"]}
              answer="Limit order"
              followUp="Give one situation in this simulation where a market order is the better choice."
            />
          </div>
        </TabsContent>

        {/* ------------------------------- MECHANISM ------------------------------ */}
        <TabsContent value="mechanism" className="mt-5 space-y-5">
          <MechanismFlow />
          <div className="panel overflow-hidden">
            <div className="border-b border-border/60 px-4 py-2.5 label-xs">Trading session timeline</div>
            {SESSION_TIMELINE.map((t) => (
              <div key={t.label} className="flex flex-wrap gap-x-4 gap-y-1 border-b border-border/40 px-4 py-3 last:border-0">
                <span className="tabular w-28 text-sm font-semibold text-primary">{t.time}</span>
                <span className="text-sm font-medium">{t.label}</span>
                <span className="w-full text-sm text-muted-foreground sm:w-auto sm:flex-1">{t.detail}</span>
              </div>
            ))}
          </div>
          <div className="panel p-5">
            <ConceptQuestion
              responseKey="anaQ7"
              question="On what basis does the exchange match buy and sell orders?"
              options={["Price–time priority", "First come only", "Largest quantity first", "Random allocation"]}
              answer="Price–time priority"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Tag({ text, tone }: { text: string; tone: "gain" | "loss" | "warn" }) {
  return (
    <span
      className={cn(
        "rounded border px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        tone === "gain" && "border-gain/40 bg-gain/10 text-gain",
        tone === "loss" && "border-loss/40 bg-loss/10 text-loss",
        tone === "warn" && "border-warn/40 bg-warn/10 text-warn",
      )}
    >
      {text}
    </span>
  );
}
