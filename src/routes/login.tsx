import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSim } from "@/lib/sim/store";
import { inr0 } from "@/lib/sim/format";
import { START_CAPITAL } from "@/lib/sim/data";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Student Login — CHRIST Virtual Stock Exchange" },
      {
        name: "description",
        content:
          "Enter your name, student ID and section to receive a Trader ID and ₹1,00,000 of virtual capital in the trading simulation.",
      },
      { property: "og:title", content: "Student Login — Virtual Trading Floor" },
      { property: "og:description", content: "Get your Trader ID and virtual capital. No password required." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(60),
  studentId: z.string().trim().min(2, "Enter your student ID").max(30),
  section: z.string().trim().min(1, "Enter your team or section").max(30),
});

function LoginPage() {
  const { login } = useSim();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", studentId: "", section: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details.");
      return;
    }
    const student = login(parsed.data.name, parsed.data.studentId, parsed.data.section);
    toast.success(`Welcome, ${student.name} · ${student.traderId}`);
    navigate({ to: "/app" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="label-xs">
          ← CHRIST Virtual Stock Exchange
        </Link>
        <div className="panel mt-4 p-7">
          <h1 className="font-display text-2xl font-bold">Student Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            No password and no real authentication — this is a classroom simulation.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="name">Student Name</Label>
              <Input
                id="name"
                className="mt-1.5"
                value={form.name}
                maxLength={60}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Ananya Rao"
              />
            </div>
            <div>
              <Label htmlFor="sid">Student ID</Label>
              <Input
                id="sid"
                className="mt-1.5"
                value={form.studentId}
                maxLength={30}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                placeholder="e.g. 23BCOM1042"
              />
            </div>
            <div>
              <Label htmlFor="sec">Team / Section</Label>
              <Input
                id="sec"
                className="mt-1.5"
                value={form.section}
                maxLength={30}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                placeholder="e.g. B.Com 4A / Team 3"
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Enter Market
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-border bg-surface p-4 text-xs text-muted-foreground">
            On entry you receive a unique <span className="text-foreground">Trader ID</span> and a cash balance of{" "}
            <span className="tabular text-primary">{inr0(START_CAPITAL)}</span> in virtual money.
            <br />
            Example — Trader ID: <span className="tabular">TRD-1042</span> · Cash Balance:{" "}
            <span className="tabular">₹1,00,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
