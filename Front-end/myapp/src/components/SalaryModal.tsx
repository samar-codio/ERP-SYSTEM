import { X } from "lucide-react";
import { useState } from "react";
import { T } from "../theme";
import type { Employee } from "../models/Employee";

interface SalaryModalProps {
  employees: Employee[];
  onClose: () => void;
  onSave: (data: {
    employeeId: string;
    type: "Advance" | "Payment" | "Salary";
    amount: number;
    notes?: string;
  }) => void;
  saving?: boolean;
}

export default function SalaryModal({ employees, onClose, onSave, saving }: SalaryModalProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [type, setType] = useState<"Advance" | "Payment" | "Salary">("Advance");
  const [amount, setAmount] = useState(1000);
  const [notes, setNotes] = useState("");

  const selectedEmployee = employees.find(e => e.id === employeeId);

  const canSubmit = employeeId && amount > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    onSave({
      employeeId,
      type,
      amount,
      notes: notes.trim() || undefined
    });
  };

  const labelStyle: React.CSSProperties = { color: T.textMuted, letterSpacing: "0.06em" };
  const inputStyle: React.CSSProperties = {
    background: T.lineSoft,
    border: `1px solid ${T.line}`,
    color: T.textPrimary,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(7,12,22,0.72)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: T.surface, border: `1px solid ${T.line}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: T.textPrimary, fontFamily: "'Space Grotesk', sans-serif" }}>
            Add Salary Transaction
          </h2>
          <button onClick={onClose} style={{ color: T.textMuted }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Employee</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} {emp.role ? `(${emp.role})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Type</label>
            <div className="flex gap-2">
              {["Advance", "Payment", "Salary"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t as "Advance" | "Payment" | "Salary")}
                  className="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all"
                  style={{
                    background: type === t ? T.teal : T.lineSoft,
                    color: type === t ? T.ink : T.textMuted,
                    border: `1px solid ${type === t ? T.teal : T.line}`
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Amount (Rs)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              required
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none font-mono"
              style={inputStyle}
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Notes (Optional)</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Eid advance, Medical, etc."
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>

          {selectedEmployee && (
            <div className="mb-5 p-3 rounded-xl text-sm" style={{ background: T.tealDim }}>
              Current Balance: <span className="font-mono font-medium" style={{ color: selectedEmployee.currentBalance > 0 ? T.amber : T.teal }}>
                {selectedEmployee.currentBalance > 0 ? "+" : ""}{selectedEmployee.currentBalance}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium px-4 py-2 rounded-lg"
              style={{ color: T.textMuted, background: T.lineSoft, border: `1px solid ${T.line}` }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || saving}
              className="text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
              style={{ color: T.ink, background: T.teal }}
            >
              {saving ? "Saving…" : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
