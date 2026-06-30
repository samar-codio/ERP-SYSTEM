import { X } from "lucide-react";
import { useState } from "react";
import { T } from "../theme";
import type { Expense, ExpenseCategory } from "../models/Expense";

interface ExpenseModalProps {
  onClose: () => void;
  onSave: (expense: Omit<Expense, "id">) => void;
  saving?: boolean;
}

const CATEGORIES: ExpenseCategory[] = [
  "Electricity", "Rent", "Gas", "Vehicle", 
  "Truck Payment", "Salary", "Maintenance", 
  "Raw Material", "Other"
];

export default function ExpenseModal({ onClose, onSave, saving }: ExpenseModalProps) {
  const [category, setCategory] = useState<ExpenseCategory>("Electricity");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [paidTo, setPaidTo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Bank Transfer" | "Credit">("Cash");

  const canSubmit = description.trim().length > 0 && amount > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    onSave({
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      category,
      description: description.trim(),
      amount,
      paidTo: paidTo.trim() || undefined,
      paymentMethod,
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
            New Expense
          </h2>
          <button onClick={onClose} style={{ color: T.textMuted }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. K-Electric June Bill"
              required
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Amount (Rs)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={1}
                required
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none font-mono"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as "Cash" | "Bank Transfer" | "Credit")}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit">Credit</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Paid To (Optional)</label>
            <input
              value={paidTo}
              onChange={(e) => setPaidTo(e.target.value)}
              placeholder="e.g. K-Electric, Landlord, Rizwan Truck"
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>

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
              {saving ? "Saving…" : "Record Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
