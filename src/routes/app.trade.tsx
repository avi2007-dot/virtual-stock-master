import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHead, Stat } from "@/components/sim/Shell";
import { useSim } from "@/lib/sim/store";
import { ORDER_TYPE_HELP, STOCKS } from "@/lib/sim/data";
import { inr } from "@/lib/sim/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MechanismFlow } from "@/components/sim/MechanismFlow";
import type { OrderKind, OrderSide } from "@/lib/sim/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/trade")({
  validateSearch: (search: Record<string, unknown>) => ({
    symbol: typeof search["symbol"] === "string" ? search["symbol"] : "ALPHAM",
    side: search["side"] === "SELL" ? ("SELL" as const) : ("BUY" as const),
  }),
  head: () => ({
    meta: [
      { title: "Order Entry — CHRIST Virtual Stock Exchange" },
      {
        name: "description",
        content:
          "Place simulated buy and sell orders using market, limit and stop-loss order types with full validation and a confirmation step.",
      },
      { property: "og:title", content: "Trading Order Panel" },
      { property: "og:description", content: "Market, limit and stop-loss orders on virtual capital." },
    ],
  }),
  component: TradePage,
});

const KINDS: { key: OrderKind; label: string }[] = [
  { key: "MARKET", label: "Market Order" },
  { key: "LIMIT", label: "Limit Order" },
  { key: "STOPLOSS", label: "Stop-Loss Order" },
];

function TradePage() {
  const search = Route.useSearch();
  const { state, student, placeOrder } = useSim();
  const [symbol, setSymbol] = useState(search.symbol);
  const [side, setSide] = useState<OrderSide>(search.side);
  const [kind, setKind] = useState<OrderKind>("MARKET");
  const [qty, setQty] = useState("10");
  const [price, setPrice] = useState("");
  const [open, setOpen] = useState(false);

  const meta = STOCKS.find((s) => s.symbol === symbol) ?? STOCKS[0]!;
  const p = state.prices[meta.symbol]!;
  const qtyNum = Number(qty);
  const effPrice = kind === "MARKET" ? p.price : Number(price || 0);
  const value = useMemo(() => (qtyNum > 0 ? qtyNum * effPrice : 0), [qtyNum, effPrice]);
  const held = student?.holdings[meta.symbol]?.qty ?? 0;
  const cash = student?.cash ?? 0;
  const estBalance = side === "BUY" ? cash - value : cash + value;

  const validate = () => {
    if (!Number.isInteger(qtyNum) || qtyNum <= 0) {
      toast.error("Enter a valid whole quantity greater than 0.");
      return false;
    }
    if (kind !== "MARKET" && (!Number(price) || Number(price) <= 0)) {
      toast.error("Enter a valid price for this order type.");
      return false;
    }
    if (side === "BUY" && value > cash) {
      toast.error("Insufficient funds.");
      return false;
    }
    if (side === "SELL" && qtyNum > held) {
      toast.error("You cannot sell more shares than you own.");
      return false;
    }
    return true;
  };

  const confirm = () => {
    const res = placeOrder({ symbol: meta.symbol, side, qty: qtyNum, kind, price: effPrice });
    setOpen(false);
    if (!res.ok) toast.error(res.message);
    else if (res.status === "EXECUTED") toast.success(res.message);
    else toast.success(res.message);
  };

  return (
    <>
      <PageHead title="Trading Order Panel" sub="Every order is validated against your virtual cash and holdings." />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Stock</Label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {STOCKS.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.name} ({s.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Order</Label>
              <div className="mt-1.5 flex gap-2">
                <Button
                  className="flex-1"
                  variant={side === "BUY" ? "gain" : "outline"}
                  onClick={() => setSide("BUY")}
                >
                  BUY
                </Button>
                <Button
                  className="flex-1"
                  variant={side === "SELL" ? "loss" : "outline"}
                  onClick={() => setSide("SELL")}
                >
                  SELL
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                className="mt-1.5 tabular"
                inputMode="numeric"
                value={qty}
                onChange={(e) => setQty(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>

            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                className="mt-1.5 tabular"
                inputMode="decimal"
                disabled={kind === "MARKET"}
                placeholder={kind === "MARKET" ? `Market ${inr(p.price)}` : "Enter price"}
                value={kind === "MARKET" ? "" : price}
                onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
              />
            </div>
          </div>

          <div className="mt-4">
            <Label>Order Type</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {KINDS.map((k) => (
                <Button
                  key={k.key}
                  size="sm"
                  variant={kind === k.key ? "default" : "outline"}
                  onClick={() => setKind(k.key)}
                >
                  {k.label}
                </Button>
              ))}
            </div>
            <p className="mt-3 rounded-md border border-primary/30 bg-primary/10 p-3 text-xs text-foreground">
              {ORDER_TYPE_HELP[kind]}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Est. Order Value" value={inr(value)} />
            <Stat label="Available Cash" value={inr(cash)} />
            <Stat label="Available Qty" value={held} hint={meta.symbol} />
            <Stat
              label="Est. Balance"
              value={inr(estBalance)}
              {...(estBalance < 0 ? { tone: "loss" as const } : {})}
            />
          </div>

          <Button
            size="lg"
            className="mt-5 w-full"
            variant={side === "BUY" ? "gain" : "loss"}
            onClick={() => validate() && setOpen(true)}
          >
            PLACE ORDER
          </Button>
        </div>

        <div className="space-y-4">
          <div className="panel p-5">
            <div className="label-xs">Live quote · simulated</div>
            <div className="mt-1 text-sm font-semibold">{meta.name}</div>
            <div className="tabular mt-1 text-2xl font-bold">{inr(p.price)}</div>
            <dl className="mt-3 space-y-1.5 text-xs">
              {[
                ["Open", inr(p.open)],
                ["High", inr(p.high)],
                ["Low", inr(p.low)],
                ["Volume", p.volume.toLocaleString("en-IN")],
                ["Sector", meta.sector],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="tabular">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="panel p-5">
            <div className="label-xs">Order types at a glance</div>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {Object.entries(ORDER_TYPE_HELP).map(([k, v]) => (
                <li key={k} className={cn(k === kind && "text-foreground")}>
                  {v}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">How Your Trade Works</h2>
        <p className="mt-1 mb-3 text-sm text-muted-foreground">
          Every order you place follows this path from your account to settlement.
        </p>
        <MechanismFlow />
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm this order?</DialogTitle>
            <DialogDescription>Virtual order — no real money is involved.</DialogDescription>
          </DialogHeader>
          <dl className="space-y-2 text-sm">
            {[
              ["Stock", `${meta.name} (${meta.symbol})`],
              ["Buy / Sell", side],
              ["Quantity", String(qtyNum)],
              ["Order type", KINDS.find((k) => k.key === kind)!.label],
              ["Price", kind === "MARKET" ? `Market ${inr(p.price)}` : inr(Number(price))],
              ["Estimated value", inr(value)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border pb-1.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="tabular font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirm}>Confirm Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
