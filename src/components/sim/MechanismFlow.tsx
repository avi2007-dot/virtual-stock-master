import { MECHANISM_STAGES } from "@/lib/sim/data";
import { ArrowDown } from "lucide-react";

export function MechanismFlow() {
  return (
    <div className="space-y-0">
      {MECHANISM_STAGES.map((s, i) => (
        <div key={s.title}>
          <div
            className="panel flex flex-wrap items-center gap-x-4 gap-y-1 p-4 transition-all hover:border-primary/50 hover:shadow-glow"
            style={{ animation: `fade-in 0.4s ease both`, animationDelay: `${i * 70}ms` }}
          >
            <span className="tabular grid size-8 shrink-0 place-items-center rounded-md bg-primary/15 text-sm font-bold text-primary">
              {i + 1}
            </span>
            <span className="font-display text-sm font-semibold tracking-wide uppercase">{s.title}</span>
            <span className="w-full text-sm text-muted-foreground sm:w-auto sm:flex-1">{s.detail}</span>
          </div>
          {i < MECHANISM_STAGES.length - 1 && (
            <div className="flex justify-start py-1 pl-8">
              <ArrowDown className="size-4 animate-bounce text-primary/70" style={{ animationDelay: `${i * 120}ms` }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function FlowStrip({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <span className="rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium">{s}</span>
          {i < steps.length - 1 && <span className="text-primary">→</span>}
        </div>
      ))}
    </div>
  );
}
