export type LedgerType = "Sale" | "Production" | "Expense" | "Salary" | "Purchase" | "Payment" | "Other";

export interface LedgerEntry {
  id: string;
  date: string;
  type: LedgerType;
  description: string;
  party?: string;           // Customer, Supplier, Employee, etc.
  debit: number;            // Amount going out
  credit: number;           // Amount coming in
  runningBalance: number;
  referenceId?: string;     // Original record id (saleId, expenseId, etc.)
  notes?: string;
}