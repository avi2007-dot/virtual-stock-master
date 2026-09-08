import { createFileRoute, Link } from "@tanstack/react-router";

import { useSim, portfolioSummary, marksTotal } from "@/lib/sim/store";
import { PageHead, Stat } from "@/components/sim/Shell";
import { inr, pct, signed } from "@/lib/sim/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/assessment")({
  head: () => ({
    meta: [
      { title: "My Assessment — CHRIST Virtual Stock Exchange" },
      {
        name: "description",
        content:
          "Individual CIA assessment out of 5 marks, awarded manually by the evaluator across five criteria, plus your recorded responses.",
      },
      { property: "og:title", content: "My Assessment — CHRIST Virtual Stock Exchange" },
      {
        property: "og:description",
        content: "Five criteria, one mark each. Trading profit or loss does not affect these marks.",
      },
    ],
  }),
  component: AssessmentPage,
});

const CRITERIA = [
  { key: "trading", label: "Trading & Order Decisions" },
  { key: "analysis", label: "Fundamental & Technical Analysis" },
  { key: "mechanism", label: "Trading Mechanism" },
  { key: "settlement", label: "Settlement & Settlement Failure" },
  { key: "risk", label: "Risk Management" },
] as const;

const RESPONSE_GROUPS = [
  { label: "Trading rounds", prefix: "round" },
  { label: "Analysis", prefix: "an" },
  { label: "Settlement", prefix: "set" },
  { label: "Risk", prefix: "risk" },
];

function AssessmentPage() {
  const { state, student } = useSim();
  if (!student) return null;

  const s = portfolioSummary(student, state.prices);
  const marks = state.marks[student.id];
  const total = marksTotal(marks);
  const evaluated = !!marks?.savedAt;
  const responses = Object.entries(student.responses);

  return (
    <div>
      <PageHead
        title="My Assessment"
        sub="CIA – Component 2 · Individual assessment out of 5 marks, awarded manually by the evaluator."
        right={
          <Button asChild variant="outline" size="sm">
            <Link to="/leaderboard">Trading performance</Link>
          </Button>
        }
      />

      <div className="mb-6 rounded-md border border-warn/40 bg-warn/10 px-4 py-3 text-xs font-semibold tracking-[0.1em] text-warn">
        MARKS ARE AWARDED MANUALLY BY THE EVALUATOR · VIRTUAL PROFIT OR LOSS DOES NOT AFFECT YOUR MARKS
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-base font-bold">Individual assessment — 5 marks</h2>
            <span
              className={cn(
                "tabular font-display text-2xl font-bold",
                evaluated ? "text-primary" : "text-muted-foreground",
              )}
            >
              {evaluated ? `${total}/5` : "— / 5"}
            </span>
          </div>

          <div className="mt-4 divide-y divide-border/50">
            {CRITERIA.map((c) => {
              const v = marks?.[c.key] ?? null;
              const remark = marks?.remarks[c.key] ?? "";
              return (
                <div key={c.key} className="flex flex-wrap items-start justify-between gap-3 py-3">
                  <div>
                    <div className="text-sm font-medium">{c.label}</div>
                    <div className="label-xs mt-0.5">1 mark</div>
                    {evaluated && remark && (
                      <p className="mt-1 text-xs text-muted-foreground">Remark: {remark}</p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "tabular rounded-md border px-3 py-1 text-sm font-semibold",
                      !evaluated || v === null
                        ? "border-border text-muted-foreground"
                        : v === 1
                          ? "border-gain/50 bg-gain/10 text-gain"
                          : "border-loss/50 bg-loss/10 text-loss",
                    )}
                  >
                    {evaluated && v !== null ? `${v}/1` : "—/1"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            {evaluated
              ? `Marks saved by the evaluator on ${new Date(marks!.savedAt!).toLocaleString("en-IN")}${marks!.locked ? " · locked" : " · open for editing"}.`
              : "Your evaluation has not been completed yet. The presenting team will assess you individually."}
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-5">
            <div className="label-xs">Trader</div>
            <div className="mt-1 text-sm font-semibold">{student.name}</div>
            <div className="tabular mt-1 text-xs text-muted-foreground">
              {student.traderId} · {student.studentId} · Section {student.section}
            </div>
          </div>
          <Stat label="Portfolio value" value={inr(s.value)} hint="Trading performance only" />
          <Stat
            label="Virtual P&L"
            value={`${signed(s.pnl)} (${pct(s.pnlPct)})`}
            tone={s.pnl > 0 ? "gain" : s.pnl < 0 ? "loss" : undefined}
            hint="Not part of the 5 marks"
          />
          <Stat label="Executed trades" value={s.trades} />
        </div>
      </div>

      <div className="panel p-5">
        <h2 className="font-display text-base font-bold">Your recorded responses</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {responses.length} response{responses.length === 1 ? "" : "s"} recorded. The evaluator reviews these when
          awarding your marks.
        </p>

        {responses.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No responses yet — complete the rounds, analysis, settlement and risk activities.
          </p>
        ) : (
          <div className="mt-4 space-y-5">
            {RESPONSE_GROUPS.map((g) => {
              const items = responses.filter(([k]) => k.toLowerCase().startsWith(g.prefix));
              if (items.length === 0) return null;
              return (
                <div key={g.label}>
                  <div className="label-xs mb-2">{g.label}</div>
                  <div className="space-y-2">
                    {items.map(([k, r]) => (
                      <div key={k} className="rounded-md border border-border/60 bg-background/40 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="tabular text-xs text-muted-foreground">{k}</span>
                          <span className="text-sm font-medium">{r.choice}</span>
                        </div>
                        {r.reason && <p className="mt-1 text-xs text-muted-foreground">Reason: {r.reason}</p>}
                        {r.justification && <p className="mt-1 text-sm">{r.justification}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
