import type { LedgerEntry } from "../models/Ledger";

export async function getLedgerEntries(): Promise<LedgerEntry[]> {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/ledger/");
    if (!res.ok) throw new Error("Failed to fetch ledger entries");
    const data = await res.json();
    console.log("Raw ledger data from API:", data);
    const transformed = data.map((item: any) => ({
      id: String(item.id),
      date: item.date,
      type: item.type,
      description: item.description,
      party: item.party,
      debit: Number(item.debit),
      credit: Number(item.credit),
      runningBalance: Number(item.running_balance || item.runningBalance || 0),
    }));
    console.log("Transformed ledger entries:", transformed);
    return transformed;
  } catch (error) {
    console.error("Error fetching ledger entries:", error);
    return [];
  }
}
