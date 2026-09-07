import { createFileRoute, Link } from "@tanstack/react-router";
import { createFileRoute as _unused } from "@tanstack/react-router";
import { useSim } from "@/lib/sim/store";
import { PageHead } from "@/components/sim/Shell";
import { DecisionForm, ConceptQuestion } from "@/components/sim/QuizCard";
import { inr, pct, toneClass } from "@/lib/sim/format";
import { dayChange } from "@/lib/sim/indices";
import { STOCKS } from "@/lib/sim/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/rounds")({
  head: () => ({
    meta: [
      { title: "Educational Rounds — CHRIST Virtual Stock Exchange" },
      {
        name: "description",
        content:
          "Guided simulation rounds: opening trades, news reaction, market shock and commodity events, each recording your decision and reasoning.",
      },
      { property: "og:title", content: "Educational Rounds — CHRIST Virtual Stock Exchange" },
      {
        property: "og:description",
        content: "Four guided rounds of the virtual trading simulation with recorded decisions and reasoning.",
      },
    ],
  }),
  component: RoundsPage,
});

const ROUNDS = [
  {
    n: 1,
    title: "Round 1 — Opening Trades",
    brief:
      "The market has just opened. Study the watchlist, pick one company and place your first trade using the order type you can justify.",
    news: "Pre-open note: broad market opens firm; automobile and banking counters see early buying interest.",
  },
  {
    n: 2,
    title: "Round 2 — News Reaction",
    brief:
      "A news announcement hits the market. Decide how you will react — and record the reason for your action.",
    news:
      "BREAKING (simulated): Alpha Motors Ltd. reports a 25% rise in quarterly profit and announces a new EV plant. RetailMax Ltd. warns of weak festive demand.",
  },
  {
    n: 3,
    title: "Round 3 — Market Shock",
    brief:
      "A sharp fall has been triggered across all counters. Show how you manage risk when prices move against you.",
    news:
      "SHOCK EVENT (simulated): Global sell-off drags every listed counter down 5–10%. Volatility rises sharply and margins are revised upward.",
  },
  {
    n: 4,
    title: "Round 4 — Commodity Event",
    brief:
      "Attention shifts to the commodity segment on the simulated MCX platform. Compare equity and commodity behaviour.",
    news:
      "COMMODITY EVENT (simulated): Supply disruption lifts Crude Oil ~8.5%; Gold and Silver firm up on safe-haven buying.",
  },
] as const;

function RoundsPage() {
  const { state } = useSim();
  const active = state.round;

  return (
    <div>
      <PageHead
        title="Educational Rounds"
        sub="The evaluator controls which round is live. Each round records your decision and your reasoning for individual assessment."
        right={
          <Button asChild variant="outline">
            <Link to="/app/trade" search={{ symbol: "ALPHAM", side: "BUY" }}>
              Go to Order Entry
            </Link>
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {ROUNDS.map((r) => (
          <span
            key={r.n}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-semibold tracking-wide",
              active === r.n
                ? "border-primary bg-primary/15 text-primary"
                : active > r.n
                  ? "border-gain/40 bg-gain/10 text-gain"
                  : "border-border text-muted-foreground",
            )}
          >
            ROUND {r.n} {active === r.n ? "· LIVE" : active > r.n ? "· DONE" : "· LOCKED"}
          </span>
        ))}
      </div>

      {active === 0 && (
        <div className="panel p-6 text-sm text-muted-foreground">
          No round is live yet. The presenting team will start Round 1 from the evaluator console. Meanwhile you can
          explore the Market and Analysis pages.
        </div>
      )}

      <div className="space-y-6">
        {ROUNDS.filter((r) => r.n <= active).map((r) => (
          <div key={r.n} className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold">{r.title}</h2>
              {active === r.n && (
                <span className="rounded-full border border-gain/40 bg-gain/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-gain">
                  LIVE NOW
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{r.brief}</p>
            <div className="mt-3 rounded-md border border-warn/30 bg-warn/10 p-3 text-sm text-warn">{r.news}</div>

            {r.n === 4 ? (
              <div className="mt-5 grid gap-6 lg:grid-cols-2">
                <CommodityBoard />
                <DecisionForm
                  responseKey="round4"
                  choiceLabel="Your commodity decision"
                  choices={["BUY Gold", "BUY Crude Oil", "STAY OUT of commodities"]}
                  reasons={[
                    "Hedging against equity market fall",
                    "Supply disruption will push prices higher",
                    "Commodity volatility is too high for my risk appetite",
                  ]}
                  justificationLabel="Explain one difference between equity and commodity trading you used in this decision"
                />
              </div>
            ) : (
              <div className="mt-5 grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <Watchlist />
                </div>
                <div className="space-y-6">
                  {r.n === 1 && (
                    <DecisionForm
                      responseKey="round1"
                      choices={["BUY Alpha Motors", "BUY FinServe Bank", "BUY Bharat Technologies", "WAIT"]}
                      reasons={[
                        "Strong fundamentals",
                        "Favourable technical trend",
                        "Sector outlook",
                        "Waiting for a better price",
                      ]}
                      justificationLabel="Which order type did you use and why?"
                    />
                  )}
                  {r.n === 2 && (
                    <>
                      <DecisionForm
                        responseKey="round2"
                        choices={["BUY Alpha Motors", "SELL RetailMax", "HOLD everything"]}
                        reasons={[
                          "Positive earnings news",
                          "Negative demand outlook",
                          "News is already priced in",
                        ]}
                        justificationLabel="Is this a fundamental or a technical reason? Explain briefly."
                      />
                      <ConceptQuestion
                        responseKey="round2q"
                        question="Reacting to a company's quarterly profit announcement is an example of which type of analysis?"
                        options={["Fundamental analysis", "Technical analysis", "Neither"]}
                        answer="Fundamental analysis"
                      />
                    </>
                  )}
                  {r.n === 3 && (
                    <>
                      <DecisionForm
                        responseKey="round3"
                        choices={["SELL to cut losses", "HOLD my positions", "BUY more at lower prices"]}
                        reasons={[
                          "Stop-loss discipline / limit downside",
                          "Long-term view unchanged",
                          "Averaging down at support",
                        ]}
                        justificationLabel="Name the risk you are managing and how your action manages it"
                      />
                      <ConceptQuestion
                        responseKey="round3q"
                        question="Which order type would have automatically limited your loss during this fall?"
                        options={["Market order", "Limit order", "Stop-loss order"]}
                        answer="Stop-loss order"
                        followUp="At what price would you have set that trigger, and why?"
                      />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Watchlist() {
  const { state } = useSim();
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-border/60 px-4 py-2.5 label-xs">Live simulated watchlist</div>
      <table className="w-full text-sm">
        <tbody>
          {STOCKS.map((s) => {
            const p = state.prices[s.symbol]!;
            const d = dayChange(p);
            return (
              <tr key={s.symbol} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-2.5">
                  <div className="font-semibold">{s.symbol}</div>
                  <div className="text-xs text-muted-foreground">{s.name}</div>
                </td>
                <td className="tabular px-4 py-2.5 text-right">{inr(p.price)}</td>
                <td className={cn("tabular px-4 py-2.5 text-right", toneClass(d.pct))}>{pct(d.pct)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CommodityBoard() {
  const { state } = useSim();
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-border/60 px-4 py-2.5 label-xs">Simulated MCX contracts</div>
      <table className="w-full text-sm">
        <tbody>
          {Object.entries(state.commodities).map(([sym, p]) => {
            const d = dayChange(p);
            return (
              <tr key={sym} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-2.5 font-semibold">{sym}</td>
                <td className="tabular px-4 py-2.5 text-right">{inr(p.price)}</td>
                <td className={cn("tabular px-4 py-2.5 text-right", toneClass(d.pct))}>{pct(d.pct)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

void _unused;
