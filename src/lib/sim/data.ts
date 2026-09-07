export interface StockMeta {
  symbol: string;
  name: string;
  sector: string;
  start: number;
  fundamentals: {
    revenueGrowth: string;
    profitGrowth: string;
    eps: string;
    debt: string;
    pe: string;
    dividend: string;
    outlook: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  };
  technicals: {
    ma: string;
    support: number;
    resistance: number;
    momentum: string;
    outlook: "BULLISH" | "NEUTRAL" | "BEARISH";
  };
}

export const STOCKS: StockMeta[] = [
  {
    symbol: "ALPHAM",
    name: "Alpha Motors Ltd.",
    sector: "Automobile",
    start: 500,
    fundamentals: {
      revenueGrowth: "+18% YoY",
      profitGrowth: "+25% YoY",
      eps: "₹32.40",
      debt: "Low (D/E 0.4)",
      pe: "18.2",
      dividend: "₹6.00 / share",
      outlook: "POSITIVE",
    },
    technicals: {
      ma: "50-DMA ₹492 (price above)",
      support: 480,
      resistance: 520,
      momentum: "Rising",
      outlook: "BULLISH",
    },
  },
  {
    symbol: "BHTECH",
    name: "Bharat Technologies Ltd.",
    sector: "Information Technology",
    start: 800,
    fundamentals: {
      revenueGrowth: "+12% YoY",
      profitGrowth: "+9% YoY",
      eps: "₹44.10",
      debt: "Nil",
      pe: "24.6",
      dividend: "₹12.00 / share",
      outlook: "POSITIVE",
    },
    technicals: {
      ma: "50-DMA ₹805 (price near)",
      support: 770,
      resistance: 840,
      momentum: "Flat",
      outlook: "NEUTRAL",
    },
  },
  {
    symbol: "GRNPWR",
    name: "GreenPower Energy Ltd.",
    sector: "Renewable Energy",
    start: 350,
    fundamentals: {
      revenueGrowth: "+30% YoY",
      profitGrowth: "-4% YoY",
      eps: "₹8.90",
      debt: "High (D/E 1.8)",
      pe: "38.4",
      dividend: "Nil",
      outlook: "NEUTRAL",
    },
    technicals: {
      ma: "50-DMA ₹356 (price below)",
      support: 330,
      resistance: 372,
      momentum: "Weak",
      outlook: "BEARISH",
    },
  },
  {
    symbol: "FINSRV",
    name: "FinServe Bank Ltd.",
    sector: "Banking",
    start: 600,
    fundamentals: {
      revenueGrowth: "+15% YoY",
      profitGrowth: "+20% YoY",
      eps: "₹41.20",
      debt: "Regulated capital adequacy 16.2%",
      pe: "14.5",
      dividend: "₹9.00 / share",
      outlook: "POSITIVE",
    },
    technicals: {
      ma: "50-DMA ₹588 (price above)",
      support: 575,
      resistance: 625,
      momentum: "Rising",
      outlook: "BULLISH",
    },
  },
  {
    symbol: "MEDCRE",
    name: "MediCare Industries Ltd.",
    sector: "Healthcare",
    start: 450,
    fundamentals: {
      revenueGrowth: "+8% YoY",
      profitGrowth: "+6% YoY",
      eps: "₹22.70",
      debt: "Moderate (D/E 0.8)",
      pe: "19.8",
      dividend: "₹4.50 / share",
      outlook: "NEUTRAL",
    },
    technicals: {
      ma: "50-DMA ₹452 (price near)",
      support: 432,
      resistance: 468,
      momentum: "Flat",
      outlook: "NEUTRAL",
    },
  },
  {
    symbol: "RTLMAX",
    name: "RetailMax Ltd.",
    sector: "Retail",
    start: 700,
    fundamentals: {
      revenueGrowth: "+5% YoY",
      profitGrowth: "-8% YoY",
      eps: "₹18.30",
      debt: "High (D/E 1.5)",
      pe: "32.1",
      dividend: "Nil",
      outlook: "NEGATIVE",
    },
    technicals: {
      ma: "50-DMA ₹722 (price below)",
      support: 668,
      resistance: 735,
      momentum: "Falling",
      outlook: "BEARISH",
    },
  },
];

export interface CommodityMeta {
  symbol: string;
  name: string;
  unit: string;
  lot: string;
  start: number;
}

export const COMMODITIES: CommodityMeta[] = [
  { symbol: "GOLD", name: "Gold (Simulated Futures)", unit: "per 10 g", lot: "1 lot = 100 g", start: 62400 },
  { symbol: "SILVER", name: "Silver (Simulated Futures)", unit: "per kg", lot: "1 lot = 5 kg", start: 74800 },
  { symbol: "CRUDE", name: "Crude Oil (Simulated Futures)", unit: "per barrel", lot: "1 lot = 100 barrels", start: 6420 },
];

export const START_CAPITAL = 100000;

export const ECOSYSTEM = [
  {
    code: "BSE",
    full: "Bombay Stock Exchange",
    role: "Stock exchange — provides the platform where listed company shares are bought and sold.",
    history: "Established in 1875, Asia's oldest stock exchange. Began under a banyan tree in Mumbai and was recognised under the Securities Contracts (Regulation) Act in 1957.",
    does: "Lists companies, matches buy and sell orders electronically, publishes the SENSEX and passes executed trades to clearing and settlement.",
  },
  {
    code: "NSE",
    full: "National Stock Exchange of India",
    role: "Stock exchange — introduced fully screen-based, nationwide electronic trading.",
    history: "Incorporated in 1992 and began trading in 1994, following the Pherwani Committee recommendation for a transparent, technology-driven exchange.",
    does: "Runs India's largest equity and equity-derivatives trading platform, publishes the NIFTY 50 and enforces trading and margin rules.",
  },
  {
    code: "MCX",
    full: "Multi Commodity Exchange of India",
    role: "Commodity derivatives exchange — trading in metals, energy and agri commodities.",
    history: "Started operations in 2003. Commodity derivatives came under SEBI's regulation in 2015 when FMC merged into SEBI.",
    does: "Provides futures and options contracts on commodities such as gold, silver and crude oil, with lot sizes, margins and delivery/cash settlement rules.",
  },
  {
    code: "SEBI",
    full: "Securities and Exchange Board of India",
    role: "Regulator — protects investors and regulates the securities market.",
    history: "Set up in 1988 and given statutory powers by the SEBI Act, 1992 after market malpractices exposed the need for a strong regulator.",
    does: "Registers brokers and depositories, frames disclosure, margin and settlement rules, prohibits insider trading and market manipulation, and handles investor grievances.",
  },
];

export const MECHANISM_STAGES = [
  { title: "Investor", detail: "The student/trader decides to buy or sell based on analysis." },
  { title: "Demat / Trading Account", detail: "Order is entered through the broker's trading account; securities sit in the demat account." },
  { title: "Order Placed", detail: "Order details — stock, quantity, order type and price — travel to the exchange." },
  { title: "Exchange", detail: "The exchange (BSE/NSE) receives the order into its electronic order book." },
  { title: "Order Matching", detail: "Price–time priority matching pairs the buy order with a matching sell order." },
  { title: "Trade Executed", detail: "A trade is confirmed; a contract note is generated for the trader." },
  { title: "Clearing", detail: "The clearing corporation calculates the net funds and securities obligations of each party." },
  { title: "Settlement", detail: "On the settlement day funds move from buyer and securities move from seller (T+1 in India)." },
];

export const ORDER_TYPE_HELP: Record<string, string> = {
  MARKET: "Market Order — executes immediately at the best available simulated market price. Certainty of execution, not of price.",
  LIMIT: "Limit Order — executes only at your specified price or better. Certainty of price, not of execution.",
  STOPLOSS: "Stop-Loss Order — stays inactive until the price reaches your trigger, then it is sent to the market. Used to limit potential losses.",
};

export const RISK_TYPES = [
  { name: "Margin", detail: "Upfront money/collateral collected so that a trader can honour obligations. Poor margining magnifies every other risk." },
  { name: "Liquidity risk", detail: "Not being able to buy or sell in required quantity without moving the price sharply." },
  { name: "Counterparty risk", detail: "The other side of the trade fails to pay funds or deliver securities." },
  { name: "Operational risk", detail: "Losses from system failures, human error or process breakdowns." },
  { name: "Market risk", detail: "Loss from adverse price movement of the security or commodity." },
  { name: "Settlement risk", detail: "Obligations are not honoured on the settlement date — including short delivery of securities." },
];

export const RISK_SCENARIOS = [
  { id: "riskA", text: "A trader cannot deliver securities on the settlement date.", answer: "Settlement risk", options: ["Market risk", "Settlement risk", "Liquidity risk", "Margin"] },
  { id: "riskB", text: "The trading system becomes unavailable in the middle of the session.", answer: "Operational risk", options: ["Operational risk", "Counterparty risk", "Market risk", "Settlement risk"] },
  { id: "riskC", text: "A stock falls 12% after a poor earnings announcement.", answer: "Market risk", options: ["Market risk", "Operational risk", "Margin", "Settlement risk"] },
  { id: "riskD", text: "A large order cannot be sold without pushing the price down sharply.", answer: "Liquidity risk", options: ["Liquidity risk", "Counterparty risk", "Margin", "Market risk" ] },
  { id: "riskE", text: "The opposite party in a trade defaults on payment obligations.", answer: "Counterparty risk", options: ["Counterparty risk", "Liquidity risk", "Operational risk", "Market risk"] },
  { id: "riskF", text: "The exchange collects upfront collateral before allowing a position.", answer: "Margin", options: ["Margin", "Settlement risk", "Market risk", "Liquidity risk"] },
];

export const SETTLEMENT_SCENARIOS = [
  {
    id: "setA",
    title: "Scenario A – Insufficient Funds",
    text: "A trader buys securities worth ₹50,000 but has only ₹30,000 available on the settlement date.",
    question: "What happens?",
    options: ["Successful settlement", "Settlement failure", "Automatic profit", "No effect"],
    answer: "Settlement failure",
  },
  {
    id: "setB",
    title: "Scenario B – Short Delivery",
    text: "A trader sells 100 shares but does not have the required shares in the demat account on settlement day.",
    question: "What type of problem has occurred?",
    options: ["Short delivery / settlement failure", "Insider trading", "Price manipulation", "Margin surplus"],
    answer: "Short delivery / settlement failure",
  },
  {
    id: "setC",
    title: "Scenario C – Operational Failure",
    text: "A technical/system issue at the intermediary prevents the settlement instruction from being processed.",
    question: "What type of risk is involved?",
    options: ["Operational risk", "Market risk", "Liquidity risk", "Currency risk"],
    answer: "Operational risk",
  },
];

export const SESSION_TIMELINE = [
  { time: "09:00", label: "Pre-open", detail: "Order collection, matching and price discovery for the opening price." },
  { time: "09:15", label: "Market opens", detail: "Normal trading session begins at the discovered opening price." },
  { time: "09:15 – 15:30", label: "Continuous trading", detail: "Orders match continuously on price–time priority." },
  { time: "15:30", label: "Market closes", detail: "Closing price is computed from the last half-hour weighted average." },
  { time: "After close", label: "Settlement", detail: "Clearing corporation nets obligations; funds and securities settle (T+1)." },
];

export const EQ_VS_COMM = [
  { feature: "Underlying", equity: "Company / security", commodity: "Physical commodity" },
  { feature: "Example", equity: "Company shares", commodity: "Gold / Crude Oil" },
  { feature: "Market", equity: "Stock exchange (BSE / NSE)", commodity: "Commodity exchange (MCX)" },
  { feature: "Regulator", equity: "SEBI", commodity: "SEBI (after FMC merger, 2015)" },
  { feature: "Instrument", equity: "Delivery-based shares, derivatives", commodity: "Mostly futures & options contracts" },
  { feature: "Risk", equity: "Market / company-specific risk", commodity: "Price / commodity & delivery risk" },
];
