import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { COMMODITIES, START_CAPITAL, STOCKS } from "./data";
import type {
  FailureType,
  MarketPhase,
  Marks,
  Order,
  OrderKind,
  OrderSide,
  PriceState,
  SimState,
  Student,
} from "./types";

const KEY = "cvse-state-v2";

function seedPrice(start: number): PriceState {
  return {
    price: start,
    prev: start,
    open: start,
    high: start,
    low: start,
    volume: Math.round(start * 120),
    history: Array.from({ length: 24 }, (_, i) => +(start * (1 + Math.sin(i / 3) * 0.004)).toFixed(2)),
  };
}

export function initialState(): SimState {
  const prices: Record<string, PriceState> = {};
  STOCKS.forEach((s) => (prices[s.symbol] = seedPrice(s.start)));
  const commodities: Record<string, PriceState> = {};
  COMMODITIES.forEach((c) => (commodities[c.symbol] = seedPrice(c.start)));
  return {
    students: [],
    currentStudentId: null,
    prices,
    commodities,
    phase: "OPEN",
    round: 0,
    paused: false,
    shockApplied: false,
    marks: {},
    clock: 0,
  };
}

export function emptyMarks(): Marks {
  return {
    trading: null,
    analysis: null,
    mechanism: null,
    settlement: null,
    risk: null,
    remarks: { trading: "", analysis: "", mechanism: "", settlement: "", risk: "" },
    locked: false,
    savedAt: null,
  };
}

export const marksTotal = (m?: Marks) =>
  m ? (["trading", "analysis", "mechanism", "settlement", "risk"] as const).reduce((a, k) => a + (m[k] ?? 0), 0) : 0;

/* ------------------------------ derived helpers ----------------------------- */

export function investedValue(student: Student, prices: Record<string, PriceState>) {
  return Object.entries(student.holdings).reduce(
    (sum, [sym, h]) => sum + h.qty * (prices[sym]?.price ?? 0),
    0,
  );
}

export function portfolioSummary(student: Student, prices: Record<string, PriceState>) {
  const investments = investedValue(student, prices);
  const value = student.cash + investments;
  const pnl = value - START_CAPITAL;
  return {
    cash: student.cash,
    investments,
    value,
    pnl,
    pnlPct: (pnl / START_CAPITAL) * 100,
    trades: student.orders.filter((o) => o.status === "EXECUTED").length,
  };
}

/* --------------------------------- context --------------------------------- */

interface Ctx {
  state: SimState;
  hydrated: boolean;
  student: Student | null;
  login: (name: string, studentId: string, section: string) => Student;
  logout: () => void;
  placeOrder: (input: {
    symbol: string;
    side: OrderSide;
    qty: number;
    kind: OrderKind;
    price: number;
  }) => { ok: boolean; message: string; status?: Order["status"] };
  cancelOrder: (orderId: string) => void;
  saveResponse: (key: string, value: { choice: string; reason?: string; justification?: string }) => void;
  setPhase: (p: MarketPhase) => void;
  setRound: (r: SimState["round"]) => void;
  setPaused: (p: boolean) => void;
  applyShock: () => void;
  applyCommodityEvent: () => void;
  nudgePrices: () => void;
  resetSimulation: () => void;
  setFailure: (studentId: string, f: FailureType) => void;
  saveMarks: (studentId: string, marks: Marks) => void;
  unlockMarks: (studentId: string) => void;
}

const SimContext = createContext<Ctx | null>(null);

const clamp = (n: number) => Math.max(1, +n.toFixed(2));

function tickPrice(p: PriceState, drift = 0): PriceState {
  const vol = 0.0055;
  const change = p.price * ((Math.random() - 0.5) * 2 * vol + drift);
  const price = clamp(p.price + change);
  const history = [...p.history, price].slice(-60);
  return {
    ...p,
    price,
    high: Math.max(p.high, price),
    low: Math.min(p.low, price),
    volume: p.volume + Math.round(Math.random() * 4000),
    history,
  };
}

function setPriceTo(p: PriceState, price: number): PriceState {
  const v = clamp(price);
  return {
    ...p,
    price: v,
    high: Math.max(p.high, v),
    low: Math.min(p.low, v),
    volume: p.volume + Math.round(Math.random() * 20000),
    history: [...p.history, v].slice(-60),
  };
}

/** Try to execute a pending order against current prices. Returns updated student. */
function matchPending(student: Student, prices: Record<string, PriceState>): Student {
  let cash = student.cash;
  const holdings: Record<string, { qty: number; avg: number }> = { ...student.holdings };
  let changed = false;

  const orders = student.orders.map((o) => {
    if (o.status !== "PENDING") return o;
    const mkt = prices[o.symbol]?.price;
    if (!mkt) return o;
    const triggered =
      o.kind === "LIMIT"
        ? o.side === "BUY"
          ? mkt <= o.price
          : mkt >= o.price
        : o.side === "SELL"
          ? mkt <= o.price
          : mkt >= o.price;
    if (!triggered) return o;

    const fill = o.kind === "LIMIT" ? o.price : mkt;
    const value = fill * o.qty;
    if (o.side === "BUY") {
      if (value > cash) {
        changed = true;
        return { ...o, status: "REJECTED" as const, note: "Insufficient funds at trigger" };
      }
      cash -= value;
      const h = holdings[o.symbol] ?? { qty: 0, avg: 0 };
      const qty = h.qty + o.qty;
      holdings[o.symbol] = { qty, avg: +((h.avg * h.qty + value) / qty).toFixed(2) };
    } else {
      const h = holdings[o.symbol];
      if (!h || h.qty < o.qty) {
        changed = true;
        return { ...o, status: "REJECTED" as const, note: "Insufficient holdings at trigger" };
      }
      cash += value;
      const qty = h.qty - o.qty;
      if (qty === 0) delete holdings[o.symbol];
      else holdings[o.symbol] = { ...h, qty };
    }
    changed = true;
    return { ...o, status: "EXECUTED" as const, price: +fill.toFixed(2), note: "Triggered & executed" };
  });

  if (!changed) return student;
  return { ...student, cash: +cash.toFixed(2), holdings, orders };
}

export function SimProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SimState>(() => initialState());
  const [hydrated, setHydrated] = useState(false);
  const writing = useRef(false);

  // hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SimState;
        setState({ ...initialState(), ...parsed });
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // persist
  useEffect(() => {
    if (!hydrated) return;
    writing.current = true;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => (writing.current = false), 0);
    return () => clearTimeout(t);
  }, [state, hydrated]);

  // cross-tab sync (admin controls -> student dashboards)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue || writing.current) return;
      try {
        const parsed = JSON.parse(e.newValue) as SimState;
        setState((prev) => ({ ...parsed, currentStudentId: prev.currentStudentId }));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // market ticking
  useEffect(() => {
    if (!hydrated) return;
    const id = setInterval(() => {
      setState((prev) => {
        if (prev.phase !== "OPEN" || prev.paused) return { ...prev, clock: prev.clock + 1 };
        const prices: Record<string, PriceState> = {};
        Object.entries(prev.prices).forEach(([k, v]) => (prices[k] = tickPrice(v)));
        const commodities: Record<string, PriceState> = {};
        Object.entries(prev.commodities).forEach(([k, v]) => (commodities[k] = tickPrice(v)));
        return {
          ...prev,
          prices,
          commodities,
          clock: prev.clock + 1,
          students: prev.students.map((s) => matchPending(s, prices)),
        };
      });
    }, 3000);
    return () => clearInterval(id);
  }, [hydrated]);

  const student = useMemo(
    () => state.students.find((s) => s.id === state.currentStudentId) ?? null,
    [state.students, state.currentStudentId],
  );

  const updateStudent = useCallback((id: string, fn: (s: Student) => Student) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === id ? fn(s) : s)),
    }));
  }, []);

  const login: Ctx["login"] = useCallback((name, studentId, section) => {
    const existing = state.students.find(
      (s) => s.studentId.trim().toLowerCase() === studentId.trim().toLowerCase(),
    );
    if (existing) {
      setState((prev) => ({ ...prev, currentStudentId: existing.id }));
      return existing;
    }
    const seq = 1000 + state.students.length + Math.floor(Math.random() * 90) + 1;
    const fresh: Student = {
      id: crypto.randomUUID(),
      name: name.trim(),
      studentId: studentId.trim(),
      section: section.trim(),
      traderId: `TRD-${seq}`,
      cash: START_CAPITAL,
      holdings: {},
      orders: [],
      responses: {},
      failure: null,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      students: [...prev.students, fresh],
      currentStudentId: fresh.id,
      marks: { ...prev.marks, [fresh.id]: emptyMarks() },
    }));
    return fresh;
  }, [state.students]);

  const logout = useCallback(() => setState((prev) => ({ ...prev, currentStudentId: null })), []);

  const placeOrder: Ctx["placeOrder"] = useCallback(
    ({ symbol, side, qty, kind, price }) => {
      if (!student) return { ok: false, message: "No trader logged in." };
      if (state.phase === "CLOSED" || state.phase === "SETTLEMENT")
        return { ok: false, message: "TRADING HALTED — market is not open." };
      if (state.paused) return { ok: false, message: "TRADING HALTED — market paused by evaluator." };
      if (!Number.isInteger(qty) || qty <= 0) return { ok: false, message: "Invalid quantity." };
      const mkt = state.prices[symbol]?.price;
      if (!mkt) return { ok: false, message: "Invalid stock." };
      if (kind !== "MARKET" && (!price || price <= 0)) return { ok: false, message: "Invalid price." };

      const orderPrice = kind === "MARKET" ? mkt : price;
      const value = orderPrice * qty;
      const held = student.holdings[symbol]?.qty ?? 0;

      const base: Order = {
        id: `ORD-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`,
        time: new Date().toLocaleTimeString("en-IN", { hour12: false }),
        symbol,
        side,
        qty,
        kind,
        price: +orderPrice.toFixed(2),
        status: "PENDING",
      };

      if (side === "BUY" && value > student.cash) {
        updateStudent(student.id, (s) => ({
          ...s,
          orders: [{ ...base, status: "REJECTED", note: "Insufficient funds" }, ...s.orders],
        }));
        return { ok: false, message: "ORDER REJECTED — Insufficient funds.", status: "REJECTED" };
      }
      if (side === "SELL" && qty > held) {
        updateStudent(student.id, (s) => ({
          ...s,
          orders: [{ ...base, status: "REJECTED", note: "Cannot sell more shares than owned" }, ...s.orders],
        }));
        return { ok: false, message: "ORDER REJECTED — You do not own that many shares.", status: "REJECTED" };
      }

      // Market order: execute at once
      if (kind === "MARKET") {
        updateStudent(student.id, (s) => {
          const holdings = { ...s.holdings };
          let cash = s.cash;
          if (side === "BUY") {
            cash -= value;
            const h = holdings[symbol] ?? { qty: 0, avg: 0 };
            const nq = h.qty + qty;
            holdings[symbol] = { qty: nq, avg: +((h.avg * h.qty + value) / nq).toFixed(2) };
          } else {
            cash += value;
            const h = holdings[symbol]!;
            const nq = h.qty - qty;
            if (nq === 0) delete holdings[symbol];
            else holdings[symbol] = { ...h, qty: nq };
          }
          return {
            ...s,
            cash: +cash.toFixed(2),
            holdings,
            orders: [{ ...base, status: "EXECUTED", note: "Market order executed" }, ...s.orders],
          };
        });
        return { ok: true, message: "ORDER EXECUTED at market price.", status: "EXECUTED" };
      }

      // Limit / stop-loss: rest in the book
      updateStudent(student.id, (s) => ({
        ...s,
        orders: [
          { ...base, note: kind === "LIMIT" ? "Resting in order book" : "Awaiting trigger price" },
          ...s.orders,
        ],
      }));
      return { ok: true, message: "Order placed successfully — status PENDING.", status: "PENDING" };
    },
    [student, state.phase, state.paused, state.prices, updateStudent],
  );

  const cancelOrder = useCallback(
    (orderId: string) => {
      if (!student) return;
      updateStudent(student.id, (s) => ({
        ...s,
        orders: s.orders.map((o) =>
          o.id === orderId && o.status === "PENDING"
            ? { ...o, status: "CANCELLED", note: "Cancelled by trader" }
            : o,
        ),
      }));
    },
    [student, updateStudent],
  );

  const saveResponse: Ctx["saveResponse"] = useCallback(
    (key, value) => {
      if (!student) return;
      updateStudent(student.id, (s) => ({
        ...s,
        responses: { ...s.responses, [key]: { ...value, at: new Date().toISOString() } },
      }));
    },
    [student, updateStudent],
  );

  const setPhase = useCallback((p: MarketPhase) => setState((prev) => ({ ...prev, phase: p })), []);
  const setRound = useCallback(
    (r: SimState["round"]) => setState((prev) => ({ ...prev, round: r })),
    [],
  );
  const setPaused = useCallback((p: boolean) => setState((prev) => ({ ...prev, paused: p })), []);

  const applyShock = useCallback(() => {
    setState((prev) => {
      const prices = { ...prev.prices };
      Object.keys(prices).forEach((k) => {
        const drop = 0.055 + Math.random() * 0.045;
        prices[k] = setPriceTo(prices[k]!, prices[k]!.price * (1 - drop));
      });
      return { ...prev, prices, shockApplied: true, round: 3 };
    });
  }, []);

  const applyCommodityEvent = useCallback(() => {
    setState((prev) => {
      const commodities = { ...prev.commodities };
      commodities["CRUDE"] = setPriceTo(commodities["CRUDE"]!, commodities["CRUDE"]!.price * 1.085);
      commodities["GOLD"] = setPriceTo(commodities["GOLD"]!, commodities["GOLD"]!.price * 1.022);
      commodities["SILVER"] = setPriceTo(commodities["SILVER"]!, commodities["SILVER"]!.price * 1.014);
      return { ...prev, commodities, round: 4 };
    });
  }, []);

  const nudgePrices = useCallback(() => {
    setState((prev) => {
      const prices: Record<string, PriceState> = {};
      Object.entries(prev.prices).forEach(([k, v]) => (prices[k] = tickPrice(v, (Math.random() - 0.4) * 0.03)));
      return { ...prev, prices };
    });
  }, []);

  const resetSimulation = useCallback(() => {
    setState(initialState());
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const setFailure = useCallback(
    (studentId: string, f: FailureType) => updateStudent(studentId, (s) => ({ ...s, failure: f })),
    [updateStudent],
  );

  const saveMarks = useCallback(
    (studentId: string, marks: Marks) =>
      setState((prev) => ({
        ...prev,
        marks: { ...prev.marks, [studentId]: { ...marks, locked: true, savedAt: new Date().toISOString() } },
      })),
    [],
  );

  const unlockMarks = useCallback(
    (studentId: string) =>
      setState((prev) => ({
        ...prev,
        marks: {
          ...prev.marks,
          [studentId]: { ...(prev.marks[studentId] ?? emptyMarks()), locked: false },
        },
      })),
    [],
  );

  const value: Ctx = {
    state,
    hydrated,
    student,
    login,
    logout,
    placeOrder,
    cancelOrder,
    saveResponse,
    setPhase,
    setRound,
    setPaused,
    applyShock,
    applyCommodityEvent,
    nudgePrices,
    resetSimulation,
    setFailure,
    saveMarks,
    unlockMarks,
  };

  return <SimContext.Provider value={value}>{children}</SimContext.Provider>;
}

export function useSim() {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error("useSim must be used inside SimProvider");
  return ctx;
}
