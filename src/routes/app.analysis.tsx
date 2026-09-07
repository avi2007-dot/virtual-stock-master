import { createFileRoute, Link } from "@tanstack/react-router";
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
  component: AnalysisPage;
});

function AnalysisPage() {
  return <div />;
}
