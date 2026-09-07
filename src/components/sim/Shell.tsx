import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSim, portfolioSummary } from "@/lib/sim/store";
import { inr, pct, signed, toneClass } from "@/lib/sim/format";
import { Button } from "@/components/ui/button";
import { STOCKS } from "@/lib/sim/data";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/app", label: "Dashboard" },
  { to: "/app/market", label: "Market" },
  { to: "/app/trade", label: "Trade" },
  { to: "/app/portfolio", label: "Portfolio" },
  { to: "/app/orders", label: "Orders" },
  { to: "/app/rounds", label: "Rounds" },
  { to: "/app/analysis", label: "Analysis" },
  { to: "/app/settlement", label: "Settlement" },
  { to: "/app/risk", label: "Risk Center" },
  { to: "/app/assessment", label: "Assessment" },
  { to: "/leaderboard", label: "Leaderboard" },
] as const;

export function MarketStatusPill() {
  const { state } = useSim();
  const map = {
    PREOPEN: { text: "PRE-OPEN", cls: "text-warn border-warn/40 bg-warn/10" },
    OPEN: { text: "MARKET OPEN", cls: "text-gain border-gain/40 bg-gain/10" },
    CLOSED: { text: "MARKET CLOSED", cls: "text-loss border-loss/40 bg-loss/10" },
    SETTLEMENT: { text: "SETTLEMENT", cls: "text-chart-2 border-chart-2/40 bg-chart-2/10" },
  }[state.phase];
  const label = state.paused ? { text: "TRADING HALTED", cls: "text-warn border-warn/40 bg-warn/10" } : map;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.12em]",
        label.cls,
      )}
    >
      <span className="size-1.5 rounded-full bg-current animate-pulse-dot" />
      {label.text}
    </span>
  );
}

function Ticker() {
  const { state } = useSim();
  const items = STOCKS.map((s) => {
    const p = state.prices[s.symbol]!;
    const ch = ((p.price - p.open) / p.open) * 100;
    return { sym: s.symbol, price: p.price, ch };
  });
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-border/60 bg-surface/60">
      <div className="flex w-max animate-ticker gap-8 py-1.5">
        {row.map((i, idx) => (
          <span key={idx} className="tabular flex items-center gap-2 text-xs whitespace-nowrap">
            <span className="text-muted-foreground">{i.sym}</span>
            <span>{inr(i.price)}</span>
            <span className={toneClass(i.ch)}>{pct(i.ch)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { student, state, hydrated, logout } = useSim();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (hydrated && !student) navigate({ to: "/login" });
  }, [hydrated, student, navigate]);

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading trading floor…
      </div>
    );
  }

  const s = portfolioSummary(student, state.prices);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 backdrop-blur-md">
        <div className="border-b border-border/60 bg-background/85">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
            <Link to="/app" className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground font-display text-sm font-bold">
                CV
              </span>
              <span className="leading-tight">
                <span className="block font-display text-sm font-bold tracking-wide">
                  CHRIST VIRTUAL STOCK EXCHANGE
                </span>
                <span className="label-xs">Trading Simulation &amp; Learning Assessment</span>
              </span>
            </Link>

            <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-2">
              <MarketStatusPill />
              <div className="hidden sm:block">
                <div className="label-xs">Trader</div>
                <div className="text-sm font-semibold">
                  {student.name} <span className="tabular text-muted-foreground">· {student.traderId}</span>
                </div>
              </div>
              <div>
                <div className="label-xs">Cash</div>
                <div className="tabular text-sm">{inr(s.cash)}</div>
              </div>
              <div>
                <div className="label-xs">Portfolio</div>
                <div className="tabular text-sm">{inr(s.value)}</div>
              </div>
              <div>
                <div className="label-xs">P&amp;L</div>
                <div className={cn("tabular text-sm font-semibold", toneClass(s.pnl))}>
                  {signed(s.pnl)} ({pct(s.pnlPct)})
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => { logout(); navigate({ to: "/" }); }}>
                Exit
              </Button>
            </div>
          </div>
        </div>

        <nav className="border-b border-border/60 bg-surface/70">
          <div className="mx-auto flex max-w-[1500px] gap-1 overflow-x-auto px-3">
            {NAV.map((n) => {
              const active = n.to === "/app" ? pathname === "/app" : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "relative whitespace-nowrap px-3 py-2.5 text-[13px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {n.label}
                  {active && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
        <Ticker />
      </header>

      <div className="bg-warn/10 text-center text-[11px] font-semibold tracking-[0.16em] text-warn py-1.5">
        SIMULATED MARKET – FOR EDUCATIONAL PURPOSES ONLY · NO REAL MONEY
      </div>

      <main className="mx-auto max-w-[1500px] px-4 py-6 animate-in fade-in duration-500">{children}</main>

      <footer className="mx-auto max-w-[1500px] px-4 pb-10 pt-4 text-xs text-muted-foreground">
        CHRIST Virtual Stock Exchange · CIA – Component 2 · Fictional indices, companies and commodity
        contracts. Not affiliated with BSE, NSE, MCX or SEBI.
      </footer>
    </div>
  );
}

export function PageHead({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Stat({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "gain" | "loss" | "warn";
  hint?: string;
}) {
  return (
    <div className="panel p-4">
      <div className="label-xs">{label}</div>
      <div
        className={cn(
          "tabular mt-1.5 text-xl font-semibold",
          tone === "gain" && "text-gain",
          tone === "loss" && "text-loss",
          tone === "warn" && "text-warn",
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
