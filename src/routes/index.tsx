import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, LineChart, ShieldCheck } from "lucide-react";
import { inr0 } from "@/lib/sim/format";
import { START_CAPITAL } from "@/lib/sim/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CHRIST Virtual Stock Exchange — Trading Simulation" },
      {
        name: "description",
        content:
          "A virtual stock-market trading simulation for a college CIA: trade fictional stocks and commodities, analyse, settle trades and study risk management.",
      },
      { property: "og:title", content: "CHRIST Virtual Stock Exchange" },
      {
        property: "og:description",
        content: "Experience the stock market. Make decisions. Manage risk. Understand settlement.",
      },
    ],
  }),
  component: Landing,
});

const CARDS = [
  {
    icon: LineChart,
    title: "Trade",
    text: "Place virtual buy and sell orders using market, limit and stop-loss order types.",
  },
  {
    icon: BarChart3,
    title: "Analyze",
    text: "Use fundamental and technical information to make and justify your decisions.",
  },
  {
    icon: ShieldCheck,
    title: "Settle",
    text: "Understand trade settlement, settlement failures and risk management.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-md bg-primary font-display text-sm font-bold text-primary-foreground">
            CV
          </span>
          <span className="label-xs">CIA – Component 2</span>
        </div>
        <Link to="/admin" className="text-xs text-muted-foreground transition-colors hover:text-primary">
          Evaluator access
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20">
        <section className="pt-10 pb-16 text-center sm:pt-16">
          <span className="label-xs inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1">
            <span className="size-1.5 rounded-full bg-gain animate-pulse-dot" /> Simulated market · educational use
            only
          </span>
          <h1 className="mt-6 font-display text-4xl leading-tight font-bold sm:text-6xl">
            CHRIST Virtual
            <br />
            <span className="text-primary">Stock Exchange</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Experience the stock market. Make decisions. Manage risk. Understand settlement.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Trading Simulation &amp; Learning Assessment</p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/login">
                Enter Trading Floor <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/how-it-works">How It Works</Link>
            </Button>
          </div>

          <div className="panel mx-auto mt-10 w-fit px-6 py-4">
            <div className="label-xs">Starting Virtual Capital</div>
            <div className="tabular mt-1 text-2xl font-bold text-primary">{inr0(START_CAPITAL)}</div>
            <div className="mt-1 text-xs text-muted-foreground">No real money. No brokerage account.</div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {CARDS.map((c) => (
            <div
              key={c.title}
              className="panel group p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
            >
              <c.icon className="size-6 text-primary" />
              <h2 className="mt-4 font-display text-lg font-semibold">{c.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
            </div>
          ))}
        </section>

        <section className="panel mt-10 p-6">
          <div className="label-xs">Concepts assessed</div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {[
              "Basics of trading",
              "BSE · NSE · MCX · SEBI",
              "SENSEX & NIFTY 50",
              "Depositories & Demat",
              "Equity vs Commodities",
              "Order types",
              "Trading sessions",
              "Fundamental analysis",
              "Technical analysis",
              "Trading mechanism",
              "Settlement process",
              "Settlement failure",
              "Risk management",
            ].map((t) => (
              <span key={t} className="rounded-md border border-border bg-surface px-2.5 py-1.5">
                {t}
              </span>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Fictional indices, companies and commodity contracts. Not affiliated with BSE, NSE, MCX or SEBI.
      </footer>
    </div>
  );
}
