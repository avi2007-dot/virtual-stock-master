import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSim } from "@/lib/sim/store";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function ChoiceRow({
  options,
  value,
  onChange,
  tone = "default",
}: {
  options: readonly string[];
  value: string | null;
  onChange: (v: string) => void;
  tone?: "default" | "trade";
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o;
        const t =
          tone === "trade" && o.toUpperCase().startsWith("BUY")
            ? "border-gain/50 text-gain"
            : tone === "trade" && o.toUpperCase().startsWith("SELL")
              ? "border-loss/50 text-loss"
              : "border-border text-foreground";
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={cn(
              "rounded-md border px-3.5 py-2 text-sm font-medium transition-all",
              t,
              active
                ? "bg-primary/15 border-primary text-primary shadow-glow"
                : "bg-background/50 hover:border-primary/40",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

/** Records a decision + optional reason chips + written justification for assessment. */
export function DecisionForm({
  responseKey,
  choices,
  reasons,
  reasonLabel = "Why did you make this decision?",
  justificationLabel = "Short written justification",
  choiceLabel = "Your decision",
  tone = "trade",
}: {
  responseKey: string;
  choices: readonly string[];
  reasons?: readonly string[];
  reasonLabel?: string;
  justificationLabel?: string;
  choiceLabel?: string;
  tone?: "default" | "trade";
}) {
  const { student, saveResponse } = useSim();
  const saved = student?.responses[responseKey];
  const [choice, setChoice] = useState<string | null>(saved?.choice ?? null);
  const [reason, setReason] = useState<string | null>(saved?.reason ?? null);
  const [text, setText] = useState(saved?.justification ?? "");

  const submit = () => {
    if (!choice) return toast.error("Select a decision first.");
    if (reasons && !reason) return toast.error("Select a reason for your decision.");
    if (text.trim().length < 10) return toast.error("Add a short justification (at least 10 characters).");
    saveResponse(responseKey, { choice, reason: reason ?? undefined, justification: text.trim() });
    toast.success("Response saved for assessment.");
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="label-xs mb-2">{choiceLabel}</div>
        <ChoiceRow options={choices} value={choice} onChange={setChoice} tone={tone} />
      </div>
      {reasons && (
        <div>
          <div className="label-xs mb-2">{reasonLabel}</div>
          <ChoiceRow options={reasons} value={reason} onChange={setReason} />
        </div>
      )}
      <div>
        <div className="label-xs mb-2">{justificationLabel}</div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 600))}
          maxLength={600}
          rows={3}
          placeholder="Explain your reasoning in one or two lines…"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={submit}>Save Response</Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-gain">
            <Check className="size-3.5" /> Recorded — {saved.choice}
            {saved.reason ? ` · ${saved.reason}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}

/** Single-answer concept question with instant feedback, stored for assessment. */
export function ConceptQuestion({
  responseKey,
  question,
  options,
  answer,
  followUp,
}: {
  responseKey: string;
  question: string;
  options: readonly string[];
  answer: string;
  followUp?: string;
}) {
  const { student, saveResponse } = useSim();
  const saved = student?.responses[responseKey];
  const [choice, setChoice] = useState<string | null>(saved?.choice ?? null);
  const [text, setText] = useState(saved?.justification ?? "");

  const submit = () => {
    if (!choice) return toast.error("Select an option.");
    if (followUp && text.trim().length < 5) return toast.error("Answer the follow-up question.");
    saveResponse(responseKey, { choice, justification: text.trim() || undefined });
    if (choice === answer) toast.success("Correct — response recorded.");
    else toast.warning("Response recorded. Review this concept.");
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{question}</p>
      <ChoiceRow options={options} value={choice} onChange={setChoice} />
      {followUp && (
        <div>
          <div className="label-xs mb-2">{followUp}</div>
          <Textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 400))} rows={2} />
        </div>
      )}
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={submit}>
          Submit Answer
        </Button>
        {saved && (
          <span className={cn("text-xs", saved.choice === answer ? "text-gain" : "text-warn")}>
            Recorded: {saved.choice} {saved.choice === answer ? "✓" : "· review this concept"}
          </span>
        )}
      </div>
    </div>
  );
}
