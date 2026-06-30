import { ShoppingCart, TrendingUp, PackageSearch, AlertTriangle } from "lucide-react";
import { T } from "../theme";
import { KpiCard, FillBar } from "../components/Kpi";
import { typeStyle, money } from "../data/mockData"; // Removed static metrics, kept style helpers
import type { NavKey } from "../nav";
import { useEffect, useState } from "react";
import { getDashboardSummary } from "../data/dashboardApi";

interface DashboardProps {
  onNavigate?: (key: NavKey) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then((summary) => {
        setData(summary);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Display a clean loading indicator while backend responds
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm" style={{ color: T.textMuted }}>
        Loading real-time ERP summary metrics...
      </div>
    );
  }

  // Fallback default state if data fetch fails completely
  const metrics = data || {
    todaysSales: 0,
    salesChange: 0,
    netProfit: 0,
    profitMargin: 0,
    finishedGoodsStock: 0,
    lowStockAlertsCount: 0,
    finishedGoodsFillLevels: [],
    rawMaterialAlerts: [],
    finishedGoodsAlerts: [],
    recentActivity: []
  };

  return (
    <>
      <div className="mb-7">
        <p className="text-sm" style={{ color: T.textMuted }}>Saturday, 21 June 2026</p>
        <h1 className="text-[28px] font-semibold tracking-tight mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Hello, AbuBakar! <span className="text-sm font-normal" style={{ color: T.textMuted }}>Here's your dashboard overview.</span>
        </h1>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={ShoppingCart}
          label="Today's Sales"
          value={money(metrics.todaysSales)}
          sub={`${metrics.salesChange >= 0 ? "+" : ""}${metrics.salesChange}%`}
          trendUp={metrics.salesChange >= 0}
          accent={{ color: T.teal, bg: T.tealDim }}
        />
        <KpiCard
          icon={TrendingUp}
          label="Net Profit · June"
          value={money(metrics.netProfit)}
          sub={`${metrics.profitMargin}% margin`}
          trendUp
          accent={{ color: T.teal, bg: T.tealDim }}
        >
          <div className="flex items-end gap-2 h-10 mt-1">
            <div
              className="relative w-6 rounded-full overflow-hidden shrink-0"
              style={{ height: 36, background: T.lineSoft, border: `1px solid ${T.line}` }}
              title="Profit margin"
            >
              <div
                className="absolute bottom-0 left-0 w-full gauge-wave"
                style={{ height: `${metrics.profitMargin}%`, background: T.teal, borderRadius: "0 0 999px 999px" }}
              />
            </div>
            <p className="text-xs" style={{ color: T.textMuted }}>
              Margin level vs. revenue, like a fill gauge on the line.
            </p>
          </div>
        </KpiCard>
        <KpiCard
          icon={PackageSearch}
          label="Finished Goods in Stock"
          value={`${metrics.finishedGoodsStock.toLocaleString()} btl`}
          sub={`${metrics.finishedGoodsFillLevels?.length || 0} SKUs`}
          trendUp
          accent={{ color: "#7FB2FF", bg: "rgba(127,178,255,0.14)" }}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Low Stock Alerts"
          value={String(metrics.lowStockAlertsCount)}
          sub="below reorder"
          trendUp={false}
          accent={{ color: T.amber, bg: T.amberDim }}
        />
      </div>

      {/* Snapshot row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: T.textPrimary }}>Finished Goods Fill Levels</h2>
            <span className="text-xs" style={{ color: T.textMuted }}>Stock vs. warehouse capacity</span>
          </div>
          <div className="flex flex-col gap-4">
            {metrics.finishedGoodsFillLevels.map((p: any) => {
              const pct = p.capacity > 0 ? Math.round((p.stock / p.capacity) * 100) : 0;
              const low = pct < 25;
              return (
                <div key={p.sku || p.name}>
                  <div className="flex items-center justify-between mb-1.5 text-sm">
                    <span style={{ color: T.textPrimary }}>{p.name}</span>
                    <span style={{ color: low ? T.amber : T.textMuted, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                      {p.stock.toLocaleString()} / {p.capacity.toLocaleString()}
                    </span>
                  </div>
                  <FillBar pct={pct} color={low ? T.amber : T.teal} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: T.textPrimary }}>Low Stock Alerts</h2>
            <AlertTriangle size={14} style={{ color: T.amber }} />
          </div>
          <div className="flex flex-col gap-3">
            {metrics.rawMaterialAlerts.length > 0 && (
              <div className="text-xs font-semibold mb-1" style={{ color: T.textMuted }}>RAW MATERIALS</div>
            )}
            {metrics.rawMaterialAlerts.map((m: any, index: number) => (
              <div key={`material-${index}`} className="rounded-xl p-3" style={{ background: T.amberDim, border: `1px solid rgba(255,155,77,0.25)` }}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span style={{ color: T.textPrimary }}>{m.name}</span>
                  <span style={{ color: T.amber, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                    {m.stock} {m.unit}
                  </span>
                </div>
                <p className="text-xs" style={{ color: T.textMuted }}>Reorder level: {m.reorderLevel || m.reorder} {m.unit}</p>
              </div>
            ))}
            {metrics.finishedGoodsAlerts.length > 0 && (
              <div className="text-xs font-semibold mb-1 mt-2" style={{ color: T.textMuted }}>FINISHED GOODS</div>
            )}
            {metrics.finishedGoodsAlerts.map((fg: any, index: number) => (
              <div key={`fg-${index}`} className="rounded-xl p-3" style={{ background: T.amberDim, border: `1px solid rgba(255,155,77,0.25)` }}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span style={{ color: T.textPrimary }}>{fg.name}</span>
                  <span style={{ color: T.amber, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                    {fg.stock} {fg.unit}
                  </span>
                </div>
                <p className="text-xs" style={{ color: T.textMuted }}>Reorder level: {fg.reorderLevel} {fg.unit}</p>
              </div>
            ))}
            {metrics.rawMaterialAlerts.length === 0 && metrics.finishedGoodsAlerts.length === 0 && (
              <div className="text-xs text-center py-4" style={{ color: T.textMuted }}>
                All stock levels healthy
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ledger / activity */}
      <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${T.line}` }}>
          <h2 className="text-sm font-semibold" style={{ color: T.textPrimary }}>Recent Ledger Activity</h2>
          <button className="text-xs font-medium" style={{ color: T.teal }} onClick={() => onNavigate?.("ledger")}>
            View full ledger →
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: T.textMuted }}>
              <th className="text-left font-medium px-5 py-2.5 text-xs uppercase tracking-wider" style={{ letterSpacing: "0.06em" }}>Type</th>
              <th className="text-left font-medium px-5 py-2.5 text-xs uppercase tracking-wider" style={{ letterSpacing: "0.06em" }}>Detail</th>
              <th className="text-left font-medium px-5 py-2.5 text-xs uppercase tracking-wider" style={{ letterSpacing: "0.06em" }}>Date</th>
              <th className="text-right font-medium px-5 py-2.5 text-xs uppercase tracking-wider" style={{ letterSpacing: "0.06em" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(metrics.recentActivity || []).map((row: any, i: number) => {
             const style = (typeStyle as Record<string, any>)[row.type] || { color: T.textPrimary, bg: T.lineSoft };
              const positive = row.amount > 0;
              return (
                <tr key={i} className="row-hover" style={{ borderTop: `1px solid ${T.lineSoft}` }}>
                  <td className="px-5 py-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: style.color, background: style.bg }}>
                      {row.type}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <p style={{ color: T.textPrimary }}>{row.party}</p>
                    <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>{row.desc}</p>
                  </td>
                  <td className="px-5 py-3" style={{ color: T.textMuted }}>{row.date}</td>
                  <td className="px-5 py-3 text-right font-medium" style={{ color: positive ? T.teal : T.red, fontFamily: "'JetBrains Mono', monospace" }}>
                    {positive ? "+" : "−"}{money(row.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}