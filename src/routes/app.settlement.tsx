import { createFileRoute } from "@tanstack/react-router";
import { useSim, portfolioSummary } from "@/lib/sim/store";
import { PageHead, Stat } from "@/components/sim/Shell";
import { ConceptQuestion, DecisionForm } from "@/components/sim/QuizCard";
import { SETTLEMENT_SCENARIOS } from "@/lib/sim/data";
import { inr } from "@/lib/sim/format";
import { FlowStrip } from "@/components/sim/MechanismFlow";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/settlement")({
  head: () => ({
    meta: [
      { title: "Clearing & Settlement — CHRIST Virtual Stock Exchange" },
      {
        name: "description",
        content:
          "Understand T+1 clearing and settlement, obligations, short delivery, auction and what happens when settlement fails.",
      },
      { property: "og:title", content: "Clearing & Settlement — CHRIST Virtual Stock Exchange" },
      {
        property: "og:description",
        content: "T+1 settlement cycle, obligations, settlement failure scenarios and consequences.",
      },
    ],
  }),
  component: SettlementPage,
});

const FAILURE_TEXT = {
  INSUFFICIENT_FUNDS: {
    title: "SETTLEMENT FAILURE — Insufficient Funds",
    body:
      "Your simulated pay-in obligation could not be met in full on the settlement date. The clearing corporation treats this as a funds shortage.",
    consequence:
      "Consequences: the trade is closed out or the shares are withheld, a penalty is levied, and repeated default can lead to suspension of the trading facility.",
  },
  SHORT_DELIVERY: {
    title: "SETTLEMENT FAILURE — Short Delivery",
    body:
      "You sold securities that were not available in your demat account on the settlement date, so delivery could not be completed.",
    consequence:
      "Consequences: the shortage goes to the exchange auction / close-out mechanism, the buyer is protected, and the difference plus a penalty is recovered from you.",
  },
  OPERATIONAL: {
    title: "SETTLEMENT FAILURE — Operational Failure",
    body:
      "A simulated system/process breakdown at the intermediary prevented your settlement instruction from being processed in time.",
    consequence:
      "Consequences: settlement is delayed, penalties may apply to the intermediary, and the incident is reported as an operational risk event.",
  },
} as const;

function SettlementPage() {
  const { state, student } = useSim();
  const s = student ? portfolioSummary(student, state.prices) : null;
  const executed = student?.orders.filter((o) => o.status === "EXECUTED") ?? [];
  const buyObligation = executed.filter((o) => o.side === "BUY").reduce((a, o) => a + o.price * o.qty, 0);
  const sellObligation = executed.filter((o) => o.side === "SELL").reduce((a, o) => a + o.price * o.qty, 0);
  const failure = student?.failure ?? null;

  return (
    <div>
      <PageHead
        title="Clearing &amp; Settlement"
        sub="What happens after a trade is executed — and what happens when settlement fails."
      />

      {failure && (
        <div className="panel mb-6 border-loss/50 bg-loss/10 p-5">
          <h2 className="font-display text-base font-bold text-loss">{FAILURE_TEXT[failure].title}</h2>
          <p className="mt-2 text-sm">{FAILURE_TEXT[failure].body}</p>
          <p className="mt-2 text-sm text-muted-foreground">{FAILURE_TEXT[failure].consequence}</p>
          <div className="mt-4">
            <DecisionForm
              responseKey="failureAction"
              choiceLabel="How will you resolve this failure?"
              tone="default"
              choices={["Arrange funds / securities before pay-in", "Close out the position", "Accept auction / close-out and penalty"]}
              reasons={["Avoid penalty and protect reputation", "Reduce further exposure", "No alternative available now"]}
              justificationLabel="Explain the consequence of this settlement failure in your own words"
            />
          </div>
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Executed trades" value={executed.length} />
        <Stat label="Pay-in obligation (buys)" value={inr(buyObligation)} />
        <Stat label="Pay-out obligation (sells)" value={inr(sellObligation)} />
        <Stat label="Available cash" value={inr(s?.cash ?? 0)} tone={(s?.cash ?? 0) > 0 ? undefined : "loss"} />
      </div>

      <div className="panel mb-6 p-5">
        <h2 className="font-display text-base font-bold">The T+1 settlement cycle</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          India follows a T+1 cycle: a trade executed on day T is settled on the next working day. Funds move from the
          buyer and securities move from the seller through the clearing corporation, which becomes the counterparty to
          both sides and guarantees settlement.
        </p>
        <div className="mt-4">
          <FlowStrip
            steps={[
              "Trade Day (T)",
              "Trade Confirmation",
              "Clearing — obligations netted",
              "Pay-in of funds & securities",
              "Pay-out (T+1)",
              "Settlement complete",
            ]}
          />
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {[
          {
            t: "Clearing",
            d: "The clearing corporation calculates what each member owes: net funds payable and net securities deliverable.",
          },
          {
            t: "Settlement",
            d: "On the settlement day, funds are debited from buyers and securities are credited to their demat accounts.",
          },
          {
            t: "Settlement failure",
            d: "If funds or securities are not available on pay-in, the obligation fails — leading to close-out, auction and penalties.",
          },
        ].map((c) => (
          <div key={c.t} className="panel p-5">
            <div className="font-display text-base font-bold text-primary">{c.t}</div>
            <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-display text-lg font-bold">Settlement failure scenarios</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {SETTLEMENT_SCENARIOS.map((sc) => (
          <div key={sc.id} className={cn("panel p-5")}>
            <div className="font-display text-sm font-bold uppercase tracking-wide text-warn">{sc.title}</div>
            <p className="mt-2 text-sm text-muted-foreground">{sc.text}</p>
            <div className="mt-4">
              <ConceptQuestion
                responseKey={sc.id}
                question={sc.question}
                options={sc.options}
                answer={sc.answer}
                followUp="State one consequence of this outcome."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
