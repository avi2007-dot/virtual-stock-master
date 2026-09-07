import { STOCKS } from "./data";
import type { PriceState } from "./types";

const SENSEX_BASE = 72450;
const NIFTY_BASE = 22180;

/** Fictional indices derived from the 6 simulated stocks. */
export function indices(prices: Record<string, PriceState>) {
  const changes = STOCKS.map((s) => {
    const p = prices[s.symbol];
    return p ? (p.price - s.start) / s.start : 0;
  });
  const avg = changes.reduce((a, b) => a + b, 0) / (changes.length || 1);
  return {
    sensex: { value: SENSEX_BASE * (1 + avg + 0.0124), change: (avg + 0.0124) * 100 },
    nifty: { value: NIFTY_BASE * (1 + avg + 0.0087), change: (avg + 0.0087) * 100 },
  };
}

export function marketSummary(prices: Record<string, PriceState>) {
  let advancing = 0;
  let declining = 0;
  let unchanged = 0;
  let volume = 0;
  STOCKS.forEach((s) => {
    const p = prices[s.symbol];
    if (!p) return;
    volume += p.volume;
    const d = +(p.price - p.open).toFixed(2);
    if (d > 0) advancing++;
    else if (d < 0) declining++;
    else unchanged++;
  });
  return { advancing, declining, unchanged, volume };
}

export function dayChange(p: PriceState) {
  const abs = p.price - p.open;
  return { abs, pct: (abs / p.open) * 100 };
}
