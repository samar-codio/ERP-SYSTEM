import { Package, AlertTriangle, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { KpiCard, FillBar } from "../components/Kpi";
import LoadingState from "../components/state/LoadingState";
import ErrorState from "../components/state/ErrorState";
import EmptyState from "../components/state/EmptyState";
import { T } from "../theme";
import type { FinishedGood } from "../models/FinishedGood";
import { getFinishedGoods } from "../data/finishedGoodApi";

export default function FinishedGoods() {
  const [goods, setGoods] = useState<FinishedGood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFinishedGoods();
      setGoods(data);
    } catch {
      setError("Failed to load finished goods");
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    // Avoid react-hooks/set-state-in-effect
    void Promise.resolve().then(load);
  }, [load]);



  const kpis = useMemo(() => {
    const totalUnits = goods.reduce((sum, g) => sum + g.stock, 0);
    const lowStock = goods.filter(g => g.stock < g.reorderLevel);
    return {
      totalSkus: goods.length,
      totalUnits,
      lowCount: lowStock.length,
      lowNames: lowStock.slice(0, 2).map(g => g.productName).join(", ")
    };
  }, [goods]);

  const tableRows = useMemo(() => goods.map(g => ({
    ...g,
    stockPct: Math.round((g.stock / Math.max(g.stock + 1000, 2000)) * 100)
  })), [goods]);

  return (
    <>
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: T.textMuted }}>Inventory</p>
          <h1
            className="text-[28px] font-semibold tracking-tight mt-1 flex items-center gap-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.textPrimary }}
          >
            <Package size={26} style={{ color: T.teal }} />
            Finished Goods
          </h1>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          style={{ color: T.ink, background: T.teal }}
        >
          🔄 Refresh Stock
        </button>
      </div>

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            icon={Package}
            label="Total SKUs"
            value={kpis.totalSkus.toString()}
            accent={{ color: T.teal, bg: T.tealDim }}
          />
          <KpiCard
            icon={TrendingUp}
            label="Total Units"
            value={kpis.totalUnits.toLocaleString()}
            accent={{ color: "#7FB2FF", bg: "rgba(127,178,255,0.14)" }}
          />
          <KpiCard
            icon={AlertTriangle}
            label="Low Stock"
            value={kpis.lowCount.toString()}
            sub={kpis.lowCount ? kpis.lowNames : "All good"}
            trendUp={false}
            accent={{ color: T.amber, bg: T.amberDim }}
          />
        </div>
      )}

      {loading && <LoadingState label="Loading finished goods…" />}
      {!loading && error && <ErrorState label={error} onRetry={load} />}

      {!loading && !error && goods.length === 0 && (
        <EmptyState
          label="No finished goods tracked yet"
          icon={Package}
          action={{ text: "Record Production first", onClick: () => window.location.href = "/production" }}
        />
      )}

      {!loading && !error && goods.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: T.textMuted, borderBottom: `1px solid ${T.line}` }}>
                <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider">Product</th>
                <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider w-80">Stock Level</th>
                <th className="text-right font-medium px-5 py-3 text-xs uppercase tracking-wider">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((g) => {
                const isLow = g.stock < g.reorderLevel;
                return (
                  <tr key={g.id} className="row-hover" style={{ borderTop: `1px solid ${T.lineSoft}` }}>
                    <td className="px-5 py-4" style={{ color: T.textPrimary }}>
                      <div>{g.brandName} · {g.productName}</div>
                      {isLow && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: T.amber, background: T.amberDim }}>
                          LOW STOCK
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <FillBar pct={g.stockPct} color={isLow ? T.amber : T.teal} />
                        </div>
                        <span className="font-mono text-sm shrink-0" style={{ color: isLow ? T.amber : T.textPrimary }}>
                          {g.stock.toLocaleString()} {g.unit}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right text-xs" style={{ color: T.textMuted }}>
                      {new Date(g.lastUpdated).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}