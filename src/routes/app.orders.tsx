import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/sim/Shell";
import { useSim } from "@/lib/sim/store";
import { inr } from "@/lib/sim/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/sim/types";

export const Route = createFileRoute("/app/orders")({
  head: () => ({
    meta: [
      { title: "Order Book — CHRIST Virtual Stock Exchange" },
      {
        name: "description",
        content:
          "Order history with order ID, time, stock, side, quantity, order type, price and status: pending, executed, rejected or cancelled.",
      },
      { property: "og:title", content: "Order Book & Order History" },
      { property: "og:description", content: "Simulated order matching for market, limit and stop-loss orders." },
    ],
  }),
  component: OrdersPage,
});

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: "text-warn border-warn/40 bg-warn/10",
  EXECUTED: "text-gain border-gain/40 bg-gain/10",
  REJECTED: "text-loss border-loss/40 bg-loss/10",
  CANCELLED: "text-muted-foreground border-border bg-surface",
};

function OrdersPage() {
  const { student, cancelOrder } = useSim();
  if (!student) return null;
  const orders = student.orders;

  return (
    <>
      <PageHead
        title="Order Book"
        sub="Limit and stop-loss orders rest here until the simulated price triggers them."
      />

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {["Order ID", "Time", "Stock", "Side", "Qty", "Order Type", "Price", "Status", ""].map((h) => (
                <th key={h} className="label-xs px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                  No orders placed yet.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-surface-strong/50">
                <td className="tabular px-4 py-3">{o.id}</td>
                <td className="tabular px-4 py-3 text-muted-foreground">{o.time}</td>
                <td className="tabular px-4 py-3">{o.symbol}</td>
                <td className={cn("px-4 py-3 font-semibold", o.side === "BUY" ? "text-gain" : "text-loss")}>
                  {o.side}
                </td>
                <td className="tabular px-4 py-3">{o.qty}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {o.kind === "STOPLOSS" ? "Stop-Loss" : o.kind === "LIMIT" ? "Limit" : "Market"}
                </td>
                <td className="tabular px-4 py-3">{inr(o.price)}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide",
                      STATUS_STYLE[o.status],
                    )}
                  >
                    {o.status}
                  </span>
                  {o.note && <div className="mt-1 text-[11px] text-muted-foreground">{o.note}</div>}
                </td>
                <td className="px-4 py-3">
                  {o.status === "PENDING" && (
                    <Button size="sm" variant="outline" onClick={() => cancelOrder(o.id)}>
                      Cancel
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
