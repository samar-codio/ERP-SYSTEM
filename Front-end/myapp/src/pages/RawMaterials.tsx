import { Boxes, AlertTriangle, Layers, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { KpiCard, FillBar } from "../components/Kpi";
import LoadingState from "../components/state/LoadingState";
import ErrorState from "../components/state/ErrorState";
import EmptyState from "../components/state/EmptyState";
import MaterialModal from "../components/MaterialModal";
import { T } from "../theme";
import type { RawMaterial } from "../models/rawmaterial";
import {
  getRawMaterials,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
} from "../data/rawMaterialApi";

export default function RawMaterials() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RawMaterial | null>(null);
  const [saving, setSaving] = useState(false);


  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getRawMaterials()
      .then((data) => {
        setMaterials(data);
      })
      .catch(() => setError("Failed to load raw materials"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Avoid react-hooks/set-state-in-effect
    void Promise.resolve().then(load);
  }, [load]);




  const handleSave = async (data: Omit<RawMaterial, "id">) => {
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateRawMaterial({ ...editing, ...data });
        setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      } else {
        const created = await createRawMaterial(data);
        setMaterials((prev) => [...prev, created]);
      }
      setShowModal(false);
      setEditing(null);
    } catch {
      setError("Failed to save raw material");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const prev = materials;
    setMaterials((m) => m.filter((x) => x.id !== id));
    try {
      await deleteRawMaterial(id);
    } catch {
      setMaterials(prev);
      setError("Failed to delete raw material");
    }
  };

  const kpis = useMemo(() => {
    const low = materials.filter((m) => m.stock < m.reorder);
    return {
      total: materials.length,
      lowCount: low.length,
      lowNames: low.map((m) => m.name).slice(0, 2).join(", "),
    };
  }, [materials]);

  return (
    <>
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: T.textMuted }}>Inventory</p>
          <h1
            className="text-[28px] font-semibold tracking-tight mt-1 flex items-center gap-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.textPrimary }}
          >
            <Boxes size={26} style={{ color: T.teal }} />
            Raw Materials
          </h1>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          style={{ color: T.ink, background: T.teal }}
        >
          <Plus size={16} />
          New Material
        </button>
      </div>



      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <KpiCard
            icon={Layers}
            label="Total Materials"
            value={String(kpis.total)}
            accent={{ color: T.teal, bg: T.tealDim }}
          />
          <KpiCard
            icon={AlertTriangle}
            label="Low Stock Alerts"
            value={String(kpis.lowCount)}
            sub={kpis.lowCount ? kpis.lowNames : undefined}
            trendUp={false}
            accent={{ color: T.amber, bg: T.amberDim }}
          />
          <KpiCard
            icon={Boxes}
            label="Stock Health"
            value={kpis.total ? `${Math.round(((kpis.total - kpis.lowCount) / kpis.total) * 100)}%` : "—"}
            sub="above reorder level"
            trendUp
            accent={{ color: "#7FB2FF", bg: "rgba(127,178,255,0.14)" }}
          />
        </div>
      )}

      {loading && <LoadingState label="Loading raw materials…" />}
      {!loading && error && <ErrorState label={error} onRetry={load} />}
      {!loading && !error && !materials.length && (
        <EmptyState
          label="No raw materials yet"
          icon={Boxes}
          action={{
            text: "Add your first material",
            onClick: () => {
              setEditing(null);
              setShowModal(true);
            },
          }}
        />
      )}
      {!loading && !error && materials.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: T.textMuted, borderBottom: `1px solid ${T.line}` }}>
                <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider" style={{ letterSpacing: "0.06em" }}>Material</th>
                <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider w-64" style={{ letterSpacing: "0.06em" }}>Stock Level</th>
                <th className="text-right font-medium px-5 py-3 text-xs uppercase tracking-wider" style={{ letterSpacing: "0.06em" }}>Reorder At</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => {
                const low = m.stock < m.reorder;
                const pct = Math.round((m.stock / Math.max(m.reorder * 2, 1)) * 100);
                return (
                  <tr key={m.id} className="row-hover" style={{ borderTop: `1px solid ${T.lineSoft}` }}>
                    <td className="px-5 py-3" style={{ color: T.textPrimary }}>
                      <div className="flex items-center gap-2">
                        {m.name}
                        {low && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ color: T.amber, background: T.amberDim }}
                          >
                            LOW
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <FillBar pct={pct} color={low ? T.amber : T.teal} />
                        </div>
                        <span
                          className="text-xs shrink-0"
                          style={{ color: low ? T.amber : T.textMuted, fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {m.stock.toLocaleString()} {m.unit}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right" style={{ color: T.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                      {m.reorder.toLocaleString()} {m.unit}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditing(m);
                            setShowModal(true);
                          }}
                          className="text-xs font-medium px-2 py-1 rounded-lg"
                          style={{ color: T.textMuted }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="text-xs font-medium px-2 py-1 rounded-lg"
                          style={{ color: T.red }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <MaterialModal
          editing={editing}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </>
  );
}
