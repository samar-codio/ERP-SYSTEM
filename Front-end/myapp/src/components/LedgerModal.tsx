import { X } from "lucide-react";
import { useState } from "react";
import { T } from "../theme";
import type { LedgerType } from "../models/Ledger";

interface LedgerModalProps {
  onClose: () => void;
  onSave: (data: {
    date: string;
    type: LedgerType;
    description: string;
    party?: string;
    debit: number;
    credit: number;
    referenceId?: string;
    notes?: string;
  }) => void;
  saving?: boolean;
}

const ALL_TYPES: LedgerType[] = ["Sale", "Production", "Expense", "Salary", "Purchase", "Payment", "Other"];

export default function LedgerModal({ onClose, onSave, saving }: LedgerModalProps) {
  const [type, setType] = useState<LedgerType>("Other");
  const [description, setDescription] = useState("");
  const [party, setParty] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [debit, setDebit] = useState(0);
  const [credit, setCredit] = useState(0);
  const [referenceId, setReferenceId] = useState("");
  const [notes, setNotes] = useState("");

  const canSubmit = description.trim().length > 0 && (debit > 0 || credit > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    onSave({
      date: new Date(date).toISOString(),
      type,
      description: description.trim(),
      party: party.trim() || undefined,
      debit,
      credit,
      referenceId: referenceId.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const labelStyle: React.CSSProperties = { color: T.textMuted, letterSpacing: "0.06em" };
  const inputStyle: React.CSSProperties = {
    background: T.lineSoft,
    border: `1px solid ${T.line}`,
    color: T.textPrimary,
  };

  const amountStyle: React.CSSProperties = {
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
        className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: T.surface, border: `1px solid ${T.line}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: T.textPrimary, fontFamily: "'Space Grotesk', sans-serif" }}>
            New Ledger Entry
          </h2>
          <button onClick={onClose} style={{ color: T.textMuted }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Date */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>

          {/* Type */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as LedgerType)}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            >
              {ALL_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 500ml Bottle × 2000 to Whale"
              required
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>

          {/* Party */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Party (Optional)</label>
            <input
              value={party}
              onChange={(e) => setParty(e.target.value)}
              placeholder="e.g. Customer, Supplier, Employee"
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>

          {/* Debit / Credit */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ ...labelStyle, color: T.red }}>Debit (Going Out)</label>
              <input
                type="number"
                value={debit}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  setDebit(val);
                  if (val > 0 && credit > 0) setCredit(0);
                }}
                min={0}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none font-mono"
                style={{ ...amountStyle, border: `1px solid ${debit > 0 ? T.red : T.line}` }}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ ...labelStyle, color: T.teal }}>Credit (Coming In)</label>
              <input
                type="number"
                value={credit}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  setCredit(val);
                  if (val > 0 && debit > 0) setDebit(0);
                }}
                min={0}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none font-mono"
                style={{ ...amountStyle, border: `1px solid ${credit > 0 ? T.teal : T.line}` }}
                placeholder="0"
              />
            </div>
          </div>

          {/* Reference ID */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Reference ID (Optional)</label>
            <input
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder="e.g. sale-123, exp-456"
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
              style={inputStyle}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              style={{ color: T.textMuted, background: T.lineSoft, border: `1px solid ${T.line}` }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || saving}
              className="text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
              style={{ color: T.ink, background: T.teal }}
            >
              {saving ? "Saving…" : "Add Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
