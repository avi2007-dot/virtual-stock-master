import { createFileRoute } from "@tanstack/react-router";
import { useSim, portfolioSummary } from "@/lib/sim/store";
import { PageHead, Stat } from "@/components/sim/Shell";
import { ConceptQuestion, DecisionForm } from "@/components/sim/QuizCard";
import { RISK_SCENARIOS, RISK_TYPES, START_CAPITAL, STOCKS } from "@/lib/sim/data";
import { inr, pct, signed, toneClass } from "@/lib/sim/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/risk")({
  head: () => ({
    meta: [
      { title: "Risk Centre — CHRIST Virtual Stock Exchange" },
      {
        name: "description",
        content:
          "Identify margin, market, liquidity, counterparty, operational and settlement risk, and see the risk profile of your simulated portfolio.",
      },
      { property: "og:title", content: "Risk Centre — CHRIST Virtual Stock Exchange" },
      {
        property: "og:description",
        content: "Risk types, risk-identification scenarios and a live risk profile of your virtual portfolio.",
      },
    ],
  }),
  component: RiskPage,
});

function RiskPage() {
  const { state, student } = useSim();
  const s = student ? portfolioSummary(student, state.prices) : null;

  const holdings = Object.entries(student?.holdings ?? {});
  const exposure = holdings.map(([sym, h]) => {
    const price = state.prices[sym]?.price ?? 0;
    const value = h.qty * price;
    return { sym, value, share: s && s.value > 0 ? (value / s.value) * 100 : 0 };
  });
  const top = exposure.slice().sort((a, b) => b.value - a.value)[0];
  const concentration = top?.share ?? 0;
  const cashShare = s && s.value > 0 ? (s.cash / s.value) * 100 : 100;

  const level =
    concentration > 50 ? "HIGH" : concentration > 30 ? "MODERATE" : holdings.length === 0 ? "NO EXPOSURE" : "BALANCED";
  const levelCls =
    level === "HIGH" ? "text-loss" : level === "MODERATE" ? "text-warn" : "text-gain";

  return (
    <div>
      <PageHead
        title="Risk Centre"
        sub="Risk management is what keeps a market safe — identify it, measure it, and control it."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Portfolio value" value={inr(s?.value ?? START_CAPITAL)} />
        <Stat
          label="Unrealised P&L"
          value={s ? `${signed(s.pnl)} (${pct(s.pnlPct)})` : "—"}
          tone={s ? (s.pnl > 0 ? "gain" : s.pnl < 0 ? "loss" : undefined) : undefined}
        />
        <Stat label="Cash buffer" value={`${cashShare.toFixed(1)}%`} hint="Un-invested virtual cash" />
        <Stat
          label="Largest single exposure"
          value={top ? `${top.sym} · ${concentration.toFixed(1)}%` : "None"}
          tone={concentration > 50 ? "loss" : concentration > 30 ? "warn" : undefined}
        />
      </div>

      <div className="panel mb-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold">Your simulated risk profile</h2>
          <span className={cn("font-display text-sm font-bold tracking-[0.14em]", levelCls)}>{level}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Concentration is the simplest risk measure: the more of your capital sits in one scrip, the more a single
          adverse move can hurt. Diversification and a cash buffer reduce market risk; position sizing and stop-loss
          orders limit the damage of any one decision.
        </p>

        {exposure.length > 0 ? (
          <div className="mt-4 space-y-3">
            {exposure.map((e) => {
              const meta = STOCKS.find((x) => x.symbol === e.sym);
              return (
                <div key={e.sym}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">
                      {e.sym} <span className="text-muted-foreground">· {meta?.name ?? ""}</span>
                    </span>
                    <span className="tabular text-muted-foreground">
                      {inr(e.value)} · {e.share.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-border/50">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        e.share > 50 ? "bg-loss" : e.share > 30 ? "bg-warn" : "bg-primary",
                      )}
                      style={{ width: `${Math.min(100, e.share)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            You hold no positions yet, so you carry no market risk — only opportunity cost.
          </p>
        )}
      </div>

      <h2 className="mb-3 font-display text-lg font-bold">Types of risk in the market</h2>
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {RISK_TYPES.map((r) => (
          <div key={r.name} className="panel p-5">
            <div className="font-display text-sm font-bold text-primary">{r.name}</div>
            <p className="mt-2 text-sm text-muted-foreground">{r.detail}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-display text-lg font-bold">Identify the risk</h2>
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {RISK_SCENARIOS.map((sc) => (
          <div key={sc.id} className="panel p-5">
            <ConceptQuestion
              responseKey={sc.id}
              question={sc.text}
              options={sc.options}
              answer={sc.answer}
            />
          </div>
        ))}
      </div>

      <div className="panel p-5">
        <h2 className="font-display text-base font-bold">Your risk management plan</h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Recorded for individual assessment by the evaluator.
        </p>
        <DecisionForm
          responseKey="riskPlan"
          choiceLabel="Which control would you apply first to your current portfolio?"
          tone="default"
          choices={[
            "Diversify across more scrips",
            "Place stop-loss orders",
            "Reduce position size",
            "Hold more cash",
            "Hedge with commodities",
          ]}
          reasons={[
            "Limit concentration risk",
            "Cap the maximum loss per trade",
            "Preserve margin capacity",
            "Prepare for settlement obligations",
          ]}
          justificationLabel="Explain how this control reduces a specific type of risk"
        />
      </div>
    </div>
  );
}
