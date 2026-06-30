import { X } from "lucide-react";
import { useState } from "react";
import { T } from "../theme";
import type { Supplier } from "../models/Supplier";

interface SupplierModalProps {
  editing: Supplier | null;
  onClose: () => void;
  onSave: (data: Omit<Supplier, "id">) => void;
  saving?: boolean;
}

export default function SupplierModal({ editing, onClose, onSave, saving }: SupplierModalProps) {
  const [name, setName] = useState(editing?.name ?? "");
  const [contactPerson, setContactPerson] = useState(editing?.contactPerson ?? "");
  const [phone, setPhone] = useState(editing?.phone ?? "");
  const [email, setEmail] = useState(editing?.email ?? "");
  const [address, setAddress] = useState(editing?.address ?? "");
  const [totalPurchases, setTotalPurchases] = useState(editing?.totalPurchases ?? 0);
  const [outstanding, setOutstanding] = useState(editing?.outstanding ?? 0);

  const canSubmit = name.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    onSave({
      name: name.trim(),
      contactPerson: contactPerson.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      totalPurchases,
      outstanding,
      lastPurchaseDate: editing?.lastPurchaseDate || new Date().toISOString()
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
        className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: T.surface, border: `1px solid ${T.line}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: T.textPrimary, fontFamily: "'Space Grotesk', sans-serif" }}>
            {editing ? "Edit Supplier" : "New Supplier"}
          </h2>
          <button onClick={onClose} style={{ color: T.textMuted }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Supplier Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Anwar Plastics"
              required
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Contact Person</label>
              <input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Mr. Anwar"
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="supplier@example.com"
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Lahore Industrial Area"
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Total Purchases</label>
              <input
                type="number"
                value={totalPurchases}
                onChange={(e) => setTotalPurchases(Number(e.target.value))}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Outstanding</label>
              <input
                type="number"
                value={outstanding}
                onChange={(e) => setOutstanding(Number(e.target.value))}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
              />
            </div>
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
              {saving ? "Saving…" : editing ? "Update" : "Add Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}