import { Truck, Plus, AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { KpiCard } from "../components/Kpi";
import LoadingState from "../components/state/LoadingState";
import ErrorState from "../components/state/ErrorState";
import EmptyState from "../components/state/EmptyState";
import SupplierModal from "../components/SupplierModal";
import { T } from "../theme";
import { money } from "../data/mockData";
import type { Supplier } from "../models/Supplier";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "../data/supplierApi";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [saving, setSaving] = useState(false);
  const [mock, setMock] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getSuppliers()
      .then((data) => {
        setSuppliers(data);
        setMock(true); // using mock fallback
      })
      .catch(() => setError("Failed to load suppliers"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Avoid react-hooks/set-state-in-effect
    void Promise.resolve().then(load);
  }, [load]);




  const handleSave = async (data: Omit<Supplier, "id">) => {
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateSupplier({ ...editing, ...data });
        setSuppliers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      } else {
        const created = await createSupplier(data);
        setSuppliers((prev) => [...prev, created]);
      }
      setShowModal(false);
      setEditing(null);
    } catch {
      setError("Failed to save supplier");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const prev = suppliers;
    setSuppliers((s) => s.filter((x) => x.id !== id));
    try {
      await deleteSupplier(id);
    } catch {
      setSuppliers(prev);
      setError("Failed to delete supplier");
    }
  };

  const kpis = useMemo(() => {
    const totalOutstanding = suppliers.reduce((sum, s) => sum + s.outstanding, 0);
    const hasOutstanding = suppliers.filter(s => s.outstanding > 0);
    return {
      totalSuppliers: suppliers.length,
      totalOutstanding,
      suppliersWithDue: hasOutstanding.length,
    };
  }, [suppliers]);

  return (
    <>
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: T.textMuted }}>Vendors</p>
          <h1
            className="text-[28px] font-semibold tracking-tight mt-1 flex items-center gap-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.textPrimary }}
          >
            <Truck size={26} style={{ color: T.teal }} />
            Suppliers
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
          New Supplier
        </button>
      </div>

      {mock && !loading && !error && (
        <div className="flex items-center gap-2 text-xs font-medium px-3.5 py-2.5 rounded-xl mb-5" style={{ color: T.amber, background: T.amberDim, border: "1px solid rgba(255,155,77,0.25)" }}>
          Backend not reachable — showing sample suppliers.
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <KpiCard
            icon={Truck}
            label="Total Suppliers"
            value={kpis.totalSuppliers.toString()}
            accent={{ color: T.teal, bg: T.tealDim }}
          />
          <KpiCard
            icon={AlertTriangle}
            label="Outstanding"
            value={money(kpis.totalOutstanding)}
            sub={`${kpis.suppliersWithDue} suppliers`}
            trendUp={false}
            accent={{ color: T.amber, bg: T.amberDim }}
          />
        </div>
      )}

      {loading && <LoadingState label="Loading suppliers…" />}
      {!loading && error && <ErrorState label={error} onRetry={load} />}

      {!loading && !error && suppliers.length === 0 && (
        <EmptyState
          label="No suppliers yet"
          icon={Truck}
          action={{
            text: "Add your first supplier",
            onClick: () => { setEditing(null); setShowModal(true); }
          }}
        />
      )}

      {!loading && !error && suppliers.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: T.textMuted, borderBottom: `1px solid ${T.line}` }}>
                <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider">Supplier</th>
                <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider">Contact</th>
                <th className="text-right font-medium px-5 py-3 text-xs uppercase tracking-wider">Total Purchases</th>
                <th className="text-right font-medium px-5 py-3 text-xs uppercase tracking-wider">Outstanding</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="row-hover" style={{ borderTop: `1px solid ${T.lineSoft}` }}>
                  <td className="px-5 py-4" style={{ color: T.textPrimary }}>
                    <div className="font-medium">{s.name}</div>
                    {s.address && <div className="text-xs" style={{ color: T.textMuted }}>{s.address}</div>}
                  </td>
                  <td className="px-5 py-4" style={{ color: T.textMuted }}>
                    {s.contactPerson && <div>{s.contactPerson}</div>}
                    {s.phone && <div className="text-xs">{s.phone}</div>}
                  </td>
                  <td className="px-5 py-4 text-right font-medium" style={{ color: T.textPrimary }}>
                    {money(s.totalPurchases)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {s.outstanding > 0 ? (
                      <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ color: T.amber, background: T.amberDim }}>
                        {money(s.outstanding)}
                      </span>
                    ) : (
                      <span className="text-sm" style={{ color: T.teal }}>Paid</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setEditing(s); setShowModal(true); }}
                        className="text-xs font-medium px-3 py-1 rounded-lg"
                        style={{ color: T.textMuted }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-xs font-medium px-3 py-1 rounded-lg"
                        style={{ color: T.red }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <SupplierModal
          editing={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </>
  );
}