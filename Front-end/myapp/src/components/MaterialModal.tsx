import { X } from "lucide-react";
import { useState } from "react";
import { T } from "../theme";
import type { RawMaterial, MaterialUnit } from "../models/rawmaterial";

interface MaterialModalProps {
  editing: RawMaterial | null;
  onClose: () => void;
  onSave: (data: Omit<RawMaterial, "id">) => void;
  saving?: boolean;
}

const UNITS: MaterialUnit[] = ["pcs", "kg", "g", "L", "ml"];

export default function MaterialModal({ editing, onClose, onSave, saving }: MaterialModalProps) {
  const [name, setName] = useState(editing?.name ?? "");
  const [stock, setStock] = useState(editing?.stock ?? 0);
  const [unit, setUnit] = useState<MaterialUnit>(editing?.unit ?? "pcs");
  const [reorder, setReorder] = useState(editing?.reorder ?? 0);

  const canSubmit = name.trim().length > 0 && stock >= 0 && reorder >= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSave({ name: name.trim(), stock, unit, reorder });
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
            {editing ? "Edit Raw Material" : "New Raw Material"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center rounded-lg"
            style={{ width: 28, height: 28, color: T.textMuted }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>
              Material Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Preform 500ml"
              required
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>
                Current Stock
              </label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
                required
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as MaterialUnit)}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>
              Reorder Level
            </label>
            <input
              type="number"
              min={0}
              value={reorder}
              onChange={(e) => setReorder(Math.max(0, Number(e.target.value)))}
              required
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
            <p className="text-xs mt-1.5" style={{ color: T.textMuted }}>
              You'll get a low-stock alert when stock falls below this level.
            </p>
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
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
