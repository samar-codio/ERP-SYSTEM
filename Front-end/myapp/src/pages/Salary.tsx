import { Users, Plus, Calendar } from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";
import { KpiCard } from "../components/Kpi";
import LoadingState from "../components/state/LoadingState";
import ErrorState from "../components/state/ErrorState";
import EmptyState from "../components/state/EmptyState";
import SalaryModal from "../components/SalaryModal";
import EmployeeModal from "../components/EmployeeModal";
import { T } from "../theme";
import { money } from "../data/mockData";
import type { Employee, SalaryTransaction } from "../models/Employee";
import { 
  getEmployees, 
  getTransactions, 
  addTransaction, 
  settleMonthly,
  createEmployee   // ← New
} from "../data/employeeApi";

export default function Salary() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [transactions, setTransactions] = useState<SalaryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [emps, txs] = await Promise.all([
        getEmployees(),
        getTransactions()
      ]);
      setEmployees(emps);
      setTransactions(txs);
    } catch {
      setError("Failed to load salary data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Avoid react-hooks/set-state-in-effect
    void Promise.resolve().then(load);
  }, [load]);



  const handleAddEmployee = async (data: Parameters<typeof createEmployee>[0]) => {
    setSaving(true);
    try {
      const newEmp = await createEmployee(data);
      setEmployees(prev => [...prev, newEmp]);
      setShowEmployeeModal(false);
      setEditingEmployee(null);
    } catch {
      setError("Failed to add employee");
    } finally {
      setSaving(false);
    }
  };

  const handleAddTransaction = async (data: {
    employeeId: string;
    type: "Advance" | "Payment" | "Salary";
    amount: number;
    notes?: string;
  }) => {
    setSaving(true);
    try {
      const employee = employees.find(e => e.id === data.employeeId);
      const newTx = await addTransaction({
        ...data,
        employeeName: employee?.name ?? "",
        date: new Date().toISOString(),
      });
      setTransactions(prev => [newTx, ...prev]);
      
      const updatedEmps = await getEmployees();
      setEmployees(updatedEmps);
      
      setShowTransactionModal(false);
    } catch {
      setError("Failed to add transaction");
    } finally {
      setSaving(false);
    }
  };

  const handleSettle = async (employeeId: string) => {
    if (!confirm("Monthly salary clear kar dein? Current balance zero ho jayega.")) return;
    
    try {
      await settleMonthly(employeeId);
      await load();
    } catch {
      setError("Failed to settle monthly");
    }
  };

  const employeeTransactions = useMemo(() => {
    if (!selectedEmployeeId) return [];
    return transactions
      .filter(t => String(t.employeeId) === String(selectedEmployeeId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedEmployeeId]);

  const kpis = useMemo(() => {
    const totalBalance = employees.reduce((sum, e) => sum + e.currentBalance, 0);
    return {
      totalEmployees: employees.length,
      totalOutstanding: Math.max(0, totalBalance),
      totalDue: employees.filter(e => e.currentBalance < 0).length
    };
  }, [employees]);

  return (
    <>
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: T.textMuted }}>HR &amp; Payroll</p>
          <h1 className="text-[28px] font-semibold tracking-tight mt-1 flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.textPrimary }}>
            <Users size={26} style={{ color: T.teal }} />
            Salary &amp; Khata
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setEditingEmployee(null);
              setShowEmployeeModal(true);
            }}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            style={{ color: T.ink, background: T.teal }}
          >
            <Plus size={16} />
            New Employee
          </button>
          <button
            onClick={() => setShowTransactionModal(true)}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            style={{ color: T.ink, background: T.teal }}
          >
            <Plus size={16} />
            New Transaction
          </button>
        </div>
      </div>

      {/* KPIs */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <KpiCard
            icon={Users}
            label="Total Employees"
            value={kpis.totalEmployees.toString()}
            accent={{ color: T.teal, bg: T.tealDim }}
          />
          <KpiCard
            icon={Calendar}
            label="Total Balance"
            value={money(Math.abs(kpis.totalOutstanding))}
            sub={kpis.totalOutstanding > 0 ? "Recoverable" : "Payable"}
            accent={{ color: kpis.totalOutstanding > 0 ? T.amber : T.teal, bg: kpis.totalOutstanding > 0 ? T.amberDim : T.tealDim }}
          />
        </div>
      )}

      {loading && <LoadingState label="Loading salary records…" />}
      {!loading && error && <ErrorState label={error} onRetry={load} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Employees List */}
          <div className="lg:col-span-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-medium" style={{ color: T.textPrimary }}>Employees</h2>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
              {employees.map((emp) => {
                const isSelected = selectedEmployeeId === emp.id;
                const isPositive = emp.currentBalance > 0;
                return (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className={`px-5 py-4 border-b border-gray-800 cursor-pointer hover:bg-gray-900 transition-colors ${isSelected ? 'bg-gray-900' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium" style={{ color: T.textPrimary }}>{emp.name}</div>
                        {emp.role && <div className="text-xs" style={{ color: T.textMuted }}>{emp.role}</div>}
                      </div>
                      <div className="text-right">
                        <div className={`font-mono text-sm ${isPositive ? 'text-amber-400' : 'text-teal-400'}`}>
                          {isPositive ? '+' : ''}{emp.currentBalance}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSettle(emp.id); }}
                          className="text-[10px] mt-1 px-2 py-0.5 rounded border border-teal-500 text-teal-400 hover:bg-teal-950"
                        >
                          Clear Monthly
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Khata Detail */}
          <div className="lg:col-span-7">
            {selectedEmployeeId ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium" style={{ color: T.textPrimary }}>
                    Khata — {employees.find(e => e.id === selectedEmployeeId)?.name}
                  </h2>
                </div>

                <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ color: T.textMuted, borderBottom: `1px solid ${T.line}` }}>
                        <th className="text-left px-5 py-3">Date</th>
                        <th className="text-left px-5 py-3">Type</th>
                        <th className="text-left px-5 py-3">Notes</th>
                        <th className="text-right px-5 py-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeTransactions.length > 0 ? employeeTransactions.map((tx) => (
                        <tr key={tx.id} style={{ borderTop: `1px solid ${T.lineSoft}` }}>
                          <td className="px-5 py-3" style={{ color: T.textMuted }}>
                            {new Date(tx.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-xs px-2.5 py-1 rounded-full" style={{
                              background: tx.type === "Advance" ? T.amberDim : T.tealDim,
                              color: tx.type === "Advance" ? T.amber : T.teal
                            }}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-sm" style={{ color: T.textMuted }}>{tx.notes || "—"}</td>
                          <td className="px-5 py-3 text-right font-medium font-mono" style={{ color: tx.type === "Advance" ? T.amber : T.teal }}>
                            {tx.type === "Advance" ? "+" : "-"}{tx.amount}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-5 py-12 text-center" style={{ color: T.textMuted }}>
                            No transactions yet for this employee
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <EmptyState
                label="Select an employee to view khata"
                icon={Users}
              />
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showTransactionModal && (
        <SalaryModal
          employees={employees}
          onClose={() => setShowTransactionModal(false)}
          onSave={handleAddTransaction}
          saving={saving}
        />
      )}

      {showEmployeeModal && (
        <EmployeeModal
          editing={editingEmployee}
          onClose={() => {
            setShowEmployeeModal(false);
            setEditingEmployee(null);
          }}
          onSave={handleAddEmployee}
          saving={saving}
        />
      )}
    </>
  );
}

