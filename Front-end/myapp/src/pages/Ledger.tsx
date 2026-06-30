import { BookOpen, Search } from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";
import { KpiCard } from "../components/Kpi";
import LoadingState from "../components/state/LoadingState";
import ErrorState from "../components/state/ErrorState";
import { T } from "../theme";
import { money } from "../data/mockData";
import type { LedgerEntry, LedgerType } from "../models/Ledger";
import { getLedgerEntries } from "../data/ledgerApi";

const ALL_TYPES: LedgerType[] = ["Sale", "Production", "Expense", "Salary", "Purchase", "Payment", "Other"];

export default function Ledger() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<LedgerType | "All">("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    getLedgerEntries()
      .then(setEntries)
      .catch(() => setError("Failed to load ledger"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Avoid react-hooks/set-state-in-effect
    void Promise.resolve().then(load);
  }, [load]);




  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = 
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.party && entry.party.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = selectedType === "All" || entry.type === selectedType;

      const entryDate = new Date(entry.date);
      const matchesDateFrom = !dateFrom || entryDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || entryDate <= new Date(dateTo);

      return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
    });
  }, [entries, searchTerm, selectedType, dateFrom, dateTo]);

  const summary = useMemo(() => {

    const totalCredit = filteredEntries.reduce((sum, e) => sum + e.credit, 0);
    const totalDebit = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
    const currentBalance = totalCredit - totalDebit;

    return { totalCredit, totalDebit, currentBalance };
  }, [filteredEntries]);

  return (
    <>
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: T.textMuted }}>Accounting</p>
          <h1 className="text-[28px] font-semibold tracking-tight mt-1 flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.textPrimary }}>
            <BookOpen size={26} style={{ color: T.teal }} />
            General Ledger
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3 bg-surface p-4 rounded-2xl border border-line">
        <div className="flex-1 min-w-[280px]">
          <div className="relative">
            <Search className="absolute left-3 top-3" size={18} style={{ color: T.textMuted }} />
            <input
              type="text"
              placeholder="Search by description or party..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg text-sm"
              style={{ background: T.lineSoft, border: `1px solid ${T.line}`, color: T.textPrimary }}
            />
          </div>
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as LedgerType)}

          className="px-4 py-3 rounded-lg text-sm"
          style={{ background: T.lineSoft, border: `1px solid ${T.line}`, color: T.textPrimary }}
        >
          <option value="All">All Types</option>
          {ALL_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-4 py-3 rounded-lg text-sm"
          style={{ background: T.lineSoft, border: `1px solid ${T.line}`, color: T.textPrimary }}
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="px-4 py-3 rounded-lg text-sm"
          style={{ background: T.lineSoft, border: `1px solid ${T.line}`, color: T.textPrimary }}
        />

        <button
          onClick={() => { setSearchTerm(""); setSelectedType("All"); setDateFrom(""); setDateTo(""); }}
          className="px-5 py-3 text-sm font-medium rounded-lg"
          style={{ background: T.lineSoft, color: T.textMuted }}
        >
          Clear Filters
        </button>
      </div>

      {/* Summary Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <KpiCard
            icon={BookOpen}
            label="Current Balance"
            value={money(Math.abs(summary.currentBalance))}
            sub={summary.currentBalance >= 0 ? "Positive" : "Negative"}
            accent={{ color: summary.currentBalance >= 0 ? T.teal : T.red, bg: summary.currentBalance >= 0 ? T.tealDim : T.redDim }}
          />
          <KpiCard
            icon={BookOpen}
            label="Total Credit"
            value={money(summary.totalCredit)}
            accent={{ color: T.teal, bg: T.tealDim }}
          />
          <KpiCard
            icon={BookOpen}
            label="Total Debit"
            value={money(summary.totalDebit)}
            accent={{ color: T.red, bg: T.redDim }}
          />

        </div>
      )}

      {loading && <LoadingState label="Loading ledger..." />}
      {!loading && error && <ErrorState label={error} onRetry={load} />}

      {!loading && !error && (
        <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: T.textMuted, borderBottom: `1px solid ${T.line}` }}>
                <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider">Date</th>
                <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider">Type</th>
                <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider">Description</th>
                <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider">Party</th>
                <th className="text-right font-medium px-5 py-3 text-xs uppercase tracking-wider">Debit</th>
                <th className="text-right font-medium px-5 py-3 text-xs uppercase tracking-wider">Credit</th>
                <th className="text-right font-medium px-5 py-3 text-xs uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (

                <tr key={entry.id} style={{ borderTop: `1px solid ${T.lineSoft}` }} className="row-hover">
                  <td className="px-5 py-4" style={{ color: T.textMuted }}>
                    {new Date(entry.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-3 py-1 rounded-full font-medium" style={{
                      background: entry.type === "Sale" || entry.type === "Payment" ? T.tealDim : T.redDim,
                      color: entry.type === "Sale" || entry.type === "Payment" ? T.teal : T.red
                    }}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-5 py-4" style={{ color: T.textPrimary }}>{entry.description}</td>
                  <td className="px-5 py-4" style={{ color: T.textMuted }}>{entry.party || "—"}</td>
                  <td className="px-5 py-4 text-right font-mono" style={{ color: T.red }}>
                    {entry.debit > 0 ? money(entry.debit) : "—"}
                  </td>
                  <td className="px-5 py-4 text-right font-mono" style={{ color: T.teal }}>
                    {entry.credit > 0 ? money(entry.credit) : "—"}
                  </td>
                  <td className="px-5 py-4 text-right font-medium font-mono" style={{ 
                    color: entry.runningBalance >= 0 ? T.teal : T.red 
                  }}>
                    {money(Math.abs(entry.runningBalance))}
                    {entry.runningBalance < 0 && " (Dr)"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}