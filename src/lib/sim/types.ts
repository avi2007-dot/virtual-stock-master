export type OrderSide = "BUY" | "SELL";
export type OrderKind = "MARKET" | "LIMIT" | "STOPLOSS";
export type OrderStatus = "PENDING" | "EXECUTED" | "REJECTED" | "CANCELLED";

export type MarketPhase = "PREOPEN" | "OPEN" | "CLOSED" | "SETTLEMENT";

export interface Order {
  id: string;
  time: string;
  symbol: string;
  side: OrderSide;
  qty: number;
  kind: OrderKind;
  price: number;
  status: OrderStatus;
  note?: string;
}

export interface Holding {
  qty: number;
  avg: number;
}

export interface ResponseRecord {
  choice: string;
  reason?: string;
  justification?: string;
  at: string;
}

export interface Marks {
  trading: 0 | 1 | null;
  analysis: 0 | 1 | null;
  mechanism: 0 | 1 | null;
  settlement: 0 | 1 | null;
  risk: 0 | 1 | null;
  remarks: {
    trading: string;
    analysis: string;
    mechanism: string;
    settlement: string;
    risk: string;
  };
  locked: boolean;
  savedAt: string | null;
}

export type FailureType = "INSUFFICIENT_FUNDS" | "SHORT_DELIVERY" | "OPERATIONAL" | null;

export interface Student {
  id: string;
  name: string;
  studentId: string;
  section: string;
  traderId: string;
  cash: number;
  holdings: Record<string, Holding>;
  orders: Order[];
  responses: Record<string, ResponseRecord>;
  failure: FailureType;
  createdAt: string;
}

export interface PriceState {
  price: number;
  prev: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  history: number[];
}

export interface SimState {
  students: Student[];
  currentStudentId: string | null;
  prices: Record<string, PriceState>;
  commodities: Record<string, PriceState>;
  phase: MarketPhase;
  round: 0 | 1 | 2 | 3 | 4;
  paused: boolean;
  shockApplied: boolean;
  marks: Record<string, Marks>;
  clock: number;
}
