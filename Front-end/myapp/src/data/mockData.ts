import { T } from "../theme";

export const finishedGoods = [
  { name: "500ml Bottle", sku: "FG-500", stock: 8200, capacity: 12000 },
  { name: "1L Bottle", sku: "FG-1000", stock: 3400, capacity: 6000 },
  { name: "1.5L Bottle", sku: "FG-1500", stock: 1100, capacity: 6000 },
];

export const stockAlerts = [
  { name: "Preform 1500ml", stock: 420, reorder: 1000, unit: "pcs" },
  { name: "Cap", stock: 950, reorder: 2000, unit: "pcs" },
];

export interface ActivityRow {
  type: "Sale" | "Production" | "Purchase" | "Payment" | "Salary" | "Expense";
  party: string;
  desc: string;
  date: string;
  amount: number;
}

export const activity: ActivityRow[] = [
  { type: "Sale", party: "Whale", desc: "INV-2026-00041 · 500ml Bottle × 2,000", date: "21 Jun", amount: 46000 },
  { type: "Production", party: "Batch PRD-1042", desc: "1.5L Bottle × 1,200 produced from BOM", date: "21 Jun", amount: -18400 },
  { type: "Purchase", party: "Anwar Plastics", desc: "Preform 500ml × 5,000 received", date: "20 Jun", amount: -32500 },
  { type: "Payment", party: "Usman", desc: "Receivable payment received", date: "20 Jun", amount: 18000 },
  { type: "Salary", party: "Imran · Line Operator", desc: "June salary paid", date: "19 Jun", amount: -28000 },
  { type: "Expense", party: "K-Electric", desc: "Electricity bill", date: "19 Jun", amount: -14200 },
];

export const typeStyle: Record<ActivityRow["type"], { color: string; bg: string }> = {
  Sale: { color: T.teal, bg: T.tealDim },
  Production: { color: "#7FB2FF", bg: "rgba(127,178,255,0.14)" },
  Purchase: { color: T.amber, bg: T.amberDim },
  Payment: { color: T.teal, bg: T.tealDim },
  Salary: { color: T.red, bg: T.redDim },
  Expense: { color: T.red, bg: T.redDim },
};

export function money(n: number) {
  const abs = Math.abs(n);
  return `Rs ${abs.toLocaleString("en-PK")}`;
}
