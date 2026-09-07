export const inr = (n: number, decimals = 2) =>
  "₹" +
  n.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export const inr0 = (n: number) => inr(n, 0);

export const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

export const signed = (n: number) => `${n >= 0 ? "+" : "-"}${inr(Math.abs(n))}`;

export const toneClass = (n: number) =>
  n > 0 ? "text-gain" : n < 0 ? "text-loss" : "text-muted-foreground";
