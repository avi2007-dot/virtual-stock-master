import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { MechanismFlow } from "@/components/sim/MechanismFlow";
import { SESSION_TIMELINE } from "@/lib/sim/data";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — CHRIST Virtual Stock Exchange" },
      {
        name: "description",
        content:
          "The student journey through the trading simulation: login, market rounds, analysis, settlement, settlement failure and risk management.",
      },
      { property: "og:title", content: "How the trading simulation works" },
      {
        property: "og:description",
        content: "Login, trade, analyse, respond to a market shock, settle trades and identify risk.",
      },
    ],
  }),
  component: HowItWorks,
});

const JOURNEY = [
  ["Login", "Enter your name, student ID and section. You receive a Trader ID and ₹1,00,000 virtual capital."],
  ["Market opens", "Simulated prices move in controlled rounds — the evaluator opens and halts the market."],
  ["Trade", "Place market, limit and stop-loss orders. Every order is validated against cash and holdings."],
  ["Round 1 – Fundamental analysis", "React to a company news event and justify your decision."],
  ["Round 2 – Technical analysis", "Read support, resistance and momentum on a simulated chart."],
  ["Round 3 – Market shock", "Prices fall sharply. Decide how to respond and name the risk principle used."],
  ["Round 4 – Commodity market", "A crude-oil supply event: trade a simulated commodity contract."],
  ["Settlement", "Trade date → clearing → settlement. Identify buyer and seller obligations."],
  ["Settlement failure", "Insufficient funds, short delivery and operational failure scenarios."],
  ["Risk management", "Identify margin, liquidity, counterparty, operational, market and settlement risk."],
  ["Final result", "Your trading performance and your individually awarded CIA marks out of 5."],
];

function HowItWorks() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <span className="label-xs">CIA – Component 2</span>
      <h1 className="mt-2 font-display text-3xl font-bold">How It Works</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        The simulation uses fictional companies, fictional indices and virtual money only. Nothing here connects
        to a real exchange, broker or depository.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">Student journey</h2>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {JOURNEY.map(([t, d], i) => (
            <li key={t} className="panel flex gap-3 p-4">
              <span className="tabular text-primary">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <span className="block text-sm font-semibold">{t}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{d}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">How your trade works</h2>
        <div className="mt-3">
          <MechanismFlow />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Trading session</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-5">
          {SESSION_TIMELINE.map((s) => (
            <div key={s.label} className="panel p-4">
              <div className="tabular text-sm text-primary">{s.time}</div>
              <div className="mt-1 text-sm font-semibold">{s.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 flex gap-3">
        <Button asChild>
          <Link to="/login">Enter Trading Floor</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Back</Link>
        </Button>
      </div>
    </div>
  );
}
