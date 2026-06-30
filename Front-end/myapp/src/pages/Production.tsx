import { Factory, Plus, Calendar, PackageCheck, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { KpiCard } from "../components/Kpi";
import LoadingState from "../components/state/LoadingState";
import ErrorState from "../components/state/ErrorState";
import EmptyState from "../components/state/EmptyState";
import ProductionModal from "../components/ProductionModal";
import { T } from "../theme";
import { money } from "../data/mockData";
import type { ProductionBatch } from "../models/Production";
import { getProductionBatches, createProductionBatch } from "../data/productionApi";

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}

function isThisMonth(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export default function Production() {
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getProductionBatches()
      .then(setBatches)
      .catch(() => setError("Failed to load production batches"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Avoid react-hooks/set-state-in-effect
    void Promise.resolve().then(load);
  }, [load]);




  const handleSaveBatch = async (batch: any) => {
    setSaving(true);
    try {
      await createProductionBatch({
        // Grab the date from the modal, or default to today (YYYY-MM-DD)
        date: batch.date || new Date().toISOString().split('T')[0],
        brandId: batch.brandId,
        brandName: batch.brandName,
        productId: batch.productId,
        productName: batch.productName,
        qty: batch.qty
      });
      setShowModal(false);
      // Reload all data to ensure synchronization
      await load();
    } catch {
      setError("Failed to record production");
    } finally {
      setSaving(false);
    }
  };

  const kpis = useMemo(() => {
    const today = batches.filter(b => isToday(b.date));
    const month = batches.filter(b => isThisMonth(b.date));

    return {
      todayBatches: today.length,
      monthUnits: month.reduce((sum, b) => sum + b.qty, 0),
      monthValue: month.reduce((sum, b) => sum + (b.qty * 25), 0), // rough estimate
    };
  }, [batches]);

  const tableRows = useMemo(() => batches.map(batch => ({
    ...batch,
    dateDisplay: new Date(batch.date).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric"
    }),
    amountDisplay: money(batch.qty * 25) // rough estimate
  })), [batches]);

  return (
    <>
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: T.textMuted }}>Manufacturing</p>
          <h1 className="text-[28px] font-semibold tracking-tight mt-1 flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.textPrimary }}>
            <Factory size={26} style={{ color: T.teal }} />
            Production
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          style={{ color: T.ink, background: T.teal }}
        >
          <Plus size={16} />
          New Batch
        </button>
      </div>

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            icon={Calendar}
            label="Batches Today"
            value={kpis.todayBatches.toString()}
            accent={{ color: T.teal, bg: T.tealDim }}
          />
          <KpiCard
            icon={PackageCheck}
            label="Units Produced"
            value={kpis.monthUnits.toLocaleString()}
            sub="This Month"
            accent={{ color: "#7FB2FF", bg: "rgba(127,178,255,0.14)" }}
          />
          <KpiCard
            icon={TrendingUp}
            label="Est. Value"
            value={money(kpis.monthValue)}
            sub="This Month"
            accent={{ color: T.teal, bg: T.tealDim }}
          />
        </div>
      )}

      {loading && <LoadingState label="Loading production history…" />}
      {!loading && error && <ErrorState label={error} onRetry={load} />}

      {!loading && !error && batches.length === 0 && (
        <EmptyState
          label="No production batches yet"
          icon={Factory}
          action={{ text: "Record first batch", onClick: () => setShowModal(true) }}
        />
      )}

      {!loading && !error && batches.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: T.textMuted, borderBottom: `1px solid ${T.line}` }}>
                <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider">Product</th>
                <th className="text-right font-medium px-5 py-3 text-xs uppercase tracking-wider">Qty</th>
                <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider">Date</th>
                <th className="text-right font-medium px-5 py-3 text-xs uppercase tracking-wider">Est. Value</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.id} className="row-hover" style={{ borderTop: `1px solid ${T.lineSoft}` }}>
                  <td className="px-5 py-3" style={{ color: T.textPrimary }}>
                    {row.brandName} · {row.productName}
                  </td>
                  <td className="px-5 py-3 text-right font-mono" style={{ color: T.textMuted }}>
                    {row.qty.toLocaleString()}
                  </td>
                  <td className="px-5 py-3" style={{ color: T.textMuted }}>{row.dateDisplay}</td>
                  <td className="px-5 py-3 text-right font-medium" style={{ color: T.teal }}>
                    {row.amountDisplay}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ProductionModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveBatch}
          saving={saving}
        />
      )}
    </>
  );
}