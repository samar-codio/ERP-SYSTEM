import { Receipt, Plus, TrendingDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { KpiCard } from "../components/Kpi";
import LoadingState from "../components/state/LoadingState";
import ErrorState from "../components/state/ErrorState";
import EmptyState from "../components/state/EmptyState";
import ExpenseModal from "../components/ExpenseModal";
import { T } from "../theme";
import { money } from "../data/mockData";
import type { Expense } from "../models/Expense";
import { getExpenses, createExpense, deleteExpense } from "../data/expenseApi";

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getExpenses()
      .then(setExpenses)
      .catch(() => setError("Failed to load expenses"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Avoid react-hooks/set-state-in-effect
    void Promise.resolve().then(load);
  }, [load]);




  const handleSaveExpense = async (data: Omit<Expense, "id">) => {
    setSaving(true);
    try {
      await createExpense(data);
      setShowModal(false);
      // Reload all data to ensure synchronization
      await load();
    } catch {
      setError("Failed to record expense");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const prev = expenses;
    setExpenses(s => s.filter(e => e.id !== id));
    try {
      await deleteExpense(id);
    } catch {
      setExpenses(prev);
      setError("Failed to delete expense");
    }
  };

  const totalThisMonth = useMemo(() => {
    const now = new Date();
    return expenses
      .filter(exp => {
        const d = new Date(exp.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);



  return (
    <>
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: T.textMuted }}>Cash Flow</p>
          <h1 className="text-[28px] font-semibold tracking-tight mt-1 flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.textPrimary }}>
            <Receipt size={26} style={{ color: T.red }} />
            Expenses
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          style={{ color: T.ink, background: T.teal }}
        >
          <Plus size={16} />
          New Expense
        </button>
      </div>

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <KpiCard
            icon={Receipt}
            label="This Month"
            value={money(totalThisMonth)}
            accent={{ color: T.red, bg: T.redDim }}
          />
          <KpiCard
            icon={TrendingDown}
            label="Total Recorded"
            value={money(expenses.reduce((sum, e) => sum + e.amount, 0))}
            accent={{ color: T.red, bg: T.redDim }}
          />
        </div>
      )}

      {loading && <LoadingState label="Loading expenses…" />}
      {!loading && error && <ErrorState label={error} onRetry={load} />}

      {!loading && !error && expenses.length === 0 && (
        <EmptyState
          label="No expenses recorded yet"
          icon={Receipt}
          action={{ text: "Add first expense", onClick: () => setShowModal(true) }}
        />
      )}

      {!loading && !error && expenses.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: T.textMuted, borderBottom: `1px solid ${T.line}` }}>
                <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider">Date</th>
                <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider">Category</th>
                <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider">Description</th>
                <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider">Paid To</th>
                <th className="text-right font-medium px-5 py-3 text-xs uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id} className="row-hover" style={{ borderTop: `1px solid ${T.lineSoft}` }}>
                  <td className="px-5 py-4" style={{ color: T.textMuted }}>
                    {new Date(exp.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: T.redDim, color: T.red }}>
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-5 py-4" style={{ color: T.textPrimary }}>{exp.description}</td>
                  <td className="px-5 py-4" style={{ color: T.textMuted }}>{exp.paidTo || "—"}</td>
                  <td className="px-5 py-4 text-right font-medium" style={{ color: T.red, fontFamily: "'JetBrains Mono', monospace" }}>
                    {money(exp.amount)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="text-xs font-medium"
                      style={{ color: T.red }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ExpenseModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveExpense}
          saving={saving}
        />
      )}
    </>
  );
}