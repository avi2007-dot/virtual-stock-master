import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useSim, portfolioSummary, marksTotal, emptyMarks } from "@/lib/sim/store";
import { inr, pct, signed, toneClass } from "@/lib/sim/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { downloadCsv } from "@/lib/sim/csv";
import { cn } from "@/lib/utils";
import type { FailureType, Marks, MarketPhase, SimState } from "@/lib/sim/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Evaluator Mode — CHRIST Virtual Stock Exchange" },
      {
        name: "description",
        content:
          "Evaluator dashboard for individual CIA marking out of 5, market and round controls, settlement failure assignment and CSV export.",
      },
      { property: "og:title", content: "Evaluator Mode — CHRIST Virtual Stock Exchange" },
      {
        property: "og:description",
        content: "Award 0 or 1 for each of five criteria per student, save, lock and edit marks, and export results.",
      },
    ],
  }),
  component: AdminPage,
});

const CRITERIA = [
  { key: "trading", label: "Trading & Order Decisions" },
  { key: "analysis", label: "Fundamental & Technical Analysis" },
  { key: "mechanism", label: "Trading Mechanism" },
  { key: "settlement", label: "Settlement & Settlement Failure" },
  { key: "risk", label: "Risk Management" },
] as const;

const PHASES: MarketPhase[] = ["PREOPEN", "OPEN", "CLOSED", "SETTLEMENT"];
const ROUNDS: SimState["round"][] = [0, 1, 2, 3, 4];
const FAILURES: { v: FailureType; label: string }[] = [
  { v: null, label: "None" },
  { v: "INSUFFICIENT_FUNDS", label: "Insufficient funds" },
  { v: "SHORT_DELIVERY", label: "Short delivery" },
  { v: "OPERATIONAL", label: "Operational" },
];

function AdminPage() {
  const {
    state,
    setPhase,
    setRound,
    setPaused,
    applyShock,
    applyCommodityEvent,
    nudgePrices,
    resetSimulation,
    setFailure,
    saveMarks,
    unlockMarks,
  } = useSim();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const rows = useMemo(
    () =>
      state.students
        .filter((st) =>
          [st.name, st.studentId, st.traderId, st.section].join(" ").toLowerCase().includes(query.toLowerCase()),
        )
        .map((st) => ({ st, s: portfolioSummary(st, state.prices), marks: state.marks[st.id] })),
    [state.students, state.prices, state.marks, query],
  );

  const selected = state.students.find((st) => st.id === selectedId) ?? null;
  const evaluatedCount = state.students.filter((st) => state.marks[st.id]?.savedAt).length;

  const exportAssessment = () => {
    downloadCsv("cvse-individual-assessment.csv", [
      [
        "Trader ID",
        "Name",
        "Student ID",
        "Section",
        "Trading & Order Decisions (1)",
        "Fundamental & Technical Analysis (1)",
        "Trading Mechanism (1)",
        "Settlement & Settlement Failure (1)",
        "Risk Management (1)",
        "Total (out of 5)",
        "Remarks - Trading",
        "Remarks - Analysis",
        "Remarks - Mechanism",
        "Remarks - Settlement",
        "Remarks - Risk",
        "Status",
        "Evaluated At",
      ],
      ...state.students.map((st) => {
        const m = state.marks[st.id] ?? emptyMarks();
        return [
          st.traderId,
          st.name,
          st.studentId,
          st.section,
          m.trading ?? "",
          m.analysis ?? "",
          m.mechanism ?? "",
          m.settlement ?? "",
          m.risk ?? "",
          m.savedAt ? `${marksTotal(m)}/5` : "Not evaluated",
          m.remarks.trading,
          m.remarks.analysis,
          m.remarks.mechanism,
          m.remarks.settlement,
          m.remarks.risk,
          m.savedAt ? (m.locked ? "Locked" : "Open for editing") : "Pending",
          m.savedAt ? new Date(m.savedAt).toLocaleString("en-IN") : "",
        ];
      }),
    ]);
    toast.success("Individual assessment CSV exported.");
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">Evaluator Mode</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Individual marking for CIA – Component 2. Each student is assessed out of 5 marks, one mark per criterion.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={exportAssessment} disabled={state.students.length === 0}>
              Export Assessment CSV
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/leaderboard">Leaderboard</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/">Home</Link>
            </Button>
          </div>
        </div>

        <div className="mb-6 rounded-md border border-warn/40 bg-warn/10 px-4 py-3 text-xs font-semibold tracking-[0.1em] text-warn">
          MARKS MUST BE AWARDED MANUALLY · VIRTUAL PROFIT OR LOSS MUST NOT DETERMINE MARKS · NO PERCENTAGES
        </div>

        {/* Simulation controls */}
        <div className="panel mb-6 p-5">
          <h2 className="font-display text-base font-bold">Market &amp; round controls</h2>
          <div className="mt-4 grid gap-5 lg:grid-cols-3">
            <div>
              <div className="label-xs mb-2">Trading session</div>
              <div className="flex flex-wrap gap-2">
                {PHASES.map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    variant={state.phase === p ? "default" : "outline"}
                    onClick={() => setPhase(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant={state.paused ? "gain" : "warn"}
                  onClick={() => setPaused(!state.paused)}
                >
                  {state.paused ? "Resume trading" : "Halt trading"}
                </Button>
                <Button size="sm" variant="outline" onClick={nudgePrices}>
                  Nudge prices
                </Button>
              </div>
            </div>

            <div>
              <div className="label-xs mb-2">Educational round</div>
              <div className="flex flex-wrap gap-2">
                {ROUNDS.map((r) => (
                  <Button
                    key={r}
                    size="sm"
                    variant={state.round === r ? "default" : "outline"}
                    onClick={() => setRound(r)}
                  >
                    {r === 0 ? "Not started" : `Round ${r}`}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div className="label-xs mb-2">Market events</div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="loss" onClick={applyShock}>
                  Apply market crash
                </Button>
                <Button size="sm" variant="outline" onClick={applyCommodityEvent}>
                  Commodity event
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm("Reset the entire simulation? All traders, orders and marks will be cleared.")) {
                      resetSimulation();
                      setSelectedId(null);
                      toast.success("Simulation reset.");
                    }
                  }}
                >
                  Reset simulation
                </Button>
              </div>
              {state.shockApplied && (
                <p className="mt-2 text-xs text-warn">Market crash already applied in this session.</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          {/* Student list */}
          <div className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-base font-bold">
                Participating students{" "}
                <span className="tabular text-sm font-normal text-muted-foreground">
                  · {evaluatedCount}/{state.students.length} evaluated
                </span>
              </h2>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, ID, section…"
                className="w-56"
              />
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left">
                    {["Trader", "Student ID", "Section", "Portfolio", "P&L", "Responses", "Marks", ""].map((h) => (
                      <th key={h} className="label-xs px-3 py-2 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ st, s, marks }) => (
                    <tr
                      key={st.id}
                      className={cn(
                        "border-b border-border/40 last:border-0",
                        selectedId === st.id && "bg-primary/10",
                      )}
                    >
                      <td className="px-3 py-2">
                        <div className="font-medium">{st.name}</div>
                        <div className="tabular text-xs text-muted-foreground">{st.traderId}</div>
                      </td>
                      <td className="tabular px-3 py-2 text-muted-foreground">{st.studentId}</td>
                      <td className="px-3 py-2 text-muted-foreground">{st.section}</td>
                      <td className="tabular px-3 py-2">{inr(s.value)}</td>
                      <td className={cn("tabular px-3 py-2", toneClass(s.pnl))}>
                        {signed(s.pnl)} <span className="text-xs">({pct(s.pnlPct)})</span>
                      </td>
                      <td className="tabular px-3 py-2">{Object.keys(st.responses).length}</td>
                      <td className="tabular px-3 py-2 font-semibold">
                        {marks?.savedAt ? (
                          <span className="text-primary">{marksTotal(marks)}/5</span>
                        ) : (
                          <span className="text-muted-foreground">—/5</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedId(st.id)}>
                          {marks?.savedAt ? "Review" : "Evaluate"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center text-sm text-muted-foreground">
                        No students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Evaluation form */}
          <div>
            {selected ? (
              <EvaluationForm
                key={selected.id}
                studentName={selected.name}
                studentMeta={`${selected.traderId} · ${selected.studentId} · Section ${selected.section}`}
                responses={selected.responses}
                marks={state.marks[selected.id] ?? emptyMarks()}
                failure={selected.failure}
                onFailure={(f) => setFailure(selected.id, f)}
                onSave={(m) => {
                  saveMarks(selected.id, m);
                  toast.success(`Marks saved and locked — ${marksTotal(m)}/5`);
                }}
                onUnlock={() => {
                  unlockMarks(selected.id);
                  toast.info("Marks unlocked for editing.");
                }}
              />
            ) : (
              <div className="panel p-8 text-center text-sm text-muted-foreground">
                Select a student to open the individual evaluation form (5 marks).
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EvaluationForm({
  studentName,
  studentMeta,
  responses,
  marks,
  failure,
  onFailure,
  onSave,
  onUnlock,
}: {
  studentName: string;
  studentMeta: string;
  responses: Record<string, { choice: string; reason?: string; justification?: string }>;
  marks: Marks;
  failure: FailureType;
  onFailure: (f: FailureType) => void;
  onSave: (m: Marks) => void;
  onUnlock: () => void;
}) {
  const [draft, setDraft] = useState<Marks>(marks);
  const locked = marks.locked;
  const total = marksTotal(draft);

  const setScore = (key: (typeof CRITERIA)[number]["key"], v: 0 | 1) =>
    setDraft((d) => ({ ...d, [key]: d[key] === v ? null : v }));
  const setRemark = (key: (typeof CRITERIA)[number]["key"], v: string) =>
    setDraft((d) => ({ ...d, remarks: { ...d.remarks, [key]: v.slice(0, 300) } }));

  const submit = () => {
    const missing = CRITERIA.filter((c) => draft[c.key] === null);
    if (missing.length > 0) {
      toast.error(`Award 0 or 1 for: ${missing.map((m) => m.label).join(", ")}`);
      return;
    }
    onSave(draft);
  };

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold">Individual Assessment — 5 Marks</h2>
          <div className="mt-1 text-sm font-medium">{studentName}</div>
          <div className="tabular text-xs text-muted-foreground">{studentMeta}</div>
        </div>
        <div className="text-right">
          <div className="label-xs">Total</div>
          <div className="tabular font-display text-2xl font-bold text-primary">{total}/5</div>
        </div>
      </div>

      {locked && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-gain/40 bg-gain/10 px-3 py-2 text-xs text-gain">
          <span>
            Marks locked{marks.savedAt ? ` on ${new Date(marks.savedAt).toLocaleString("en-IN")}` : ""}.
          </span>
          <Button size="sm" variant="outline" onClick={onUnlock}>
            Edit Marks
          </Button>
        </div>
      )}

      <div className="mt-4 space-y-4">
        {CRITERIA.map((c, i) => (
          <div key={c.key} className="rounded-md border border-border/60 bg-background/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-medium">
                {i + 1}. {c.label} <span className="text-muted-foreground">— 1 Mark</span>
              </div>
              <div className="flex gap-2">
                {([0, 1] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    disabled={locked}
                    onClick={() => setScore(c.key, v)}
                    className={cn(
                      "tabular rounded-md border px-3 py-1 text-sm font-semibold transition-colors disabled:opacity-60",
                      draft[c.key] === v
                        ? v === 1
                          ? "border-gain bg-gain/15 text-gain"
                          : "border-loss bg-loss/15 text-loss"
                        : "border-border text-muted-foreground hover:border-primary/50",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              value={draft.remarks[c.key]}
              disabled={locked}
              onChange={(e) => setRemark(c.key, e.target.value)}
              rows={2}
              placeholder="Evaluator remarks (optional)"
              className="mt-2"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button onClick={submit} disabled={locked}>
          Save &amp; Lock Marks
        </Button>
        {!locked && marks.savedAt && (
          <span className="text-xs text-muted-foreground">Editing previously saved marks.</span>
        )}
      </div>

      <div className="mt-5 border-t border-border/60 pt-4">
        <div className="label-xs mb-2">Assign settlement failure scenario</div>
        <div className="flex flex-wrap gap-2">
          {FAILURES.map((f) => (
            <Button
              key={f.label}
              size="sm"
              variant={failure === f.v ? "default" : "outline"}
              onClick={() => onFailure(f.v)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-border/60 pt-4">
        <div className="label-xs mb-2">Recorded responses ({Object.keys(responses).length})</div>
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {Object.entries(responses).map(([k, r]) => (
            <div key={k} className="rounded-md border border-border/50 bg-background/40 p-2.5 text-xs">
              <div className="flex justify-between gap-2">
                <span className="tabular text-muted-foreground">{k}</span>
                <span className="font-medium">{r.choice}</span>
              </div>
              {r.reason && <div className="mt-1 text-muted-foreground">Reason: {r.reason}</div>}
              {r.justification && <div className="mt-1">{r.justification}</div>}
            </div>
          ))}
          {Object.keys(responses).length === 0 && (
            <p className="text-xs text-muted-foreground">No responses recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
