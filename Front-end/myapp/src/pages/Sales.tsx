import { ShoppingCart, TrendingUp, PackageCheck, Clock, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { KpiCard } from "../components/Kpi";
import LoadingState from "../components/state/LoadingState";
import ErrorState from "../components/state/ErrorState";
import EmptyState from "../components/state/EmptyState";
import SaleModal from "../components/SaleModal";
import { T } from "../theme";
import { money } from "../data/mockData";
import type { Sale } from "../models/Sale";
import type { Product } from "../models/Product";
import type { Brand } from "../models/Brand";
import { getSales, getProducts, createSale, deleteSale } from "../data/salesApi";
import { getBrands } from "../data/brandApi";

const paymentStyle: Record<Sale["payment"], { color: string; bg: string }> = {
  Cash: { color: T.teal, bg: T.tealDim },
  Credit: { color: T.amber, bg: T.amberDim },
  "Bank Transfer": { color: "#7FB2FF", bg: "rgba(127,178,255,0.14)" },
};

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isThisMonth(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([getSales(), getBrands(), getProducts()])
      .then(([salesData, brandsData, productsData]) => {
        setSales(salesData);
        setBrands(brandsData);
        setProducts(productsData);
      })
      .catch(() => setError("Failed to load sales"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Avoid react-hooks/set-state-in-effect
    void Promise.resolve().then(load);
  }, [load]);




  const handleCreateSale = async (input: Parameters<typeof createSale>[0]) => {
    setSaving(true);
    try {
      const created = await createSale(input);
      setShowModal(false);
      // Reload all data to ensure synchronization
      await load();
    } catch {
      setError("Failed to record sale");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const prev = sales;
    setSales((s) => s.filter((x) => x.id !== id));
    try {
      await deleteSale(id);
    } catch {
      setSales(prev);
      setError("Failed to delete sale");
    }
  };

  const kpis = useMemo(() => {
    const todaySales = sales.filter((s) => isToday(s.date));
    const monthSales = sales.filter((s) => isThisMonth(s.date));
    const pending = sales.filter((s) => s.payment === "Credit");
    return {
      todayTotal: todaySales.reduce((sum, s) => sum + s.amount, 0),
      monthRevenue: monthSales.reduce((sum, s) => sum + s.amount, 0),
      unitsSold: monthSales.reduce((sum, s) => sum + s.qty, 0),
      pendingAmount: pending.reduce((sum, s) => sum + s.amount, 0),
      pendingCount: pending.length,
    };
  }, [sales]);

  const tableRows = useMemo(
    () =>
      sales.map((s) => ({
        ...s,
        productDisplay: `${s.brandName} · ${s.productName}`,
        amountDisplay: money(s.amount),
        dateDisplay: new Date(s.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      })),
    [sales]
  );

  return (
    <>
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: T.textMuted }}>Revenue</p>
          <h1
            className="text-[28px] font-semibold tracking-tight mt-1 flex items-center gap-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.textPrimary }}
          >
            <ShoppingCart size={26} style={{ color: T.teal }} />
            Sales
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          style={{ color: T.ink, background: T.teal }}
        >
          <Plus size={16} />
          New Sale
        </button>
      </div>

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            icon={ShoppingCart}
            label="Today's Sales"
            value={money(kpis.todayTotal)}
            accent={{ color: T.teal, bg: T.tealDim }}
          />
          <KpiCard
            icon={TrendingUp}
            label="Revenue · This Month"
            value={money(kpis.monthRevenue)}
            accent={{ color: T.teal, bg: T.tealDim }}
          />
          <KpiCard
            icon={PackageCheck}
            label="Units Sold · This Month"
            value={kpis.unitsSold.toLocaleString()}
            accent={{ color: "#7FB2FF", bg: "rgba(127,178,255,0.14)" }}
          />
          <KpiCard
            icon={Clock}
            label="Pending Payments"
            value={money(kpis.pendingAmount)}
            sub={`${kpis.pendingCount} orders`}
            trendUp={false}
            accent={{ color: T.amber, bg: T.amberDim }}
          />
        </div>
      )}

      {loading && <LoadingState label="Loading sales…" />}
      {!loading && error && <ErrorState label={error} onRetry={load} />}
      {!loading && !error && !sales.length && (
        <EmptyState
          label="No sales recorded yet"
          icon={ShoppingCart}
          action={{ text: "Record your first sale", onClick: () => setShowModal(true) }}
        />
      )}
      {!loading && !error && sales.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: T.textMuted, borderBottom: `1px solid ${T.line}` }}>
                <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider" style={{ letterSpacing: "0.06em" }}>Customer</th>
                <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider" style={{ letterSpacing: "0.06em" }}>Product</th>
                <th className="text-right font-medium px-5 py-3 text-xs uppercase tracking-wider" style={{ letterSpacing: "0.06em" }}>Qty</th>
                <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider" style={{ letterSpacing: "0.06em" }}>Payment</th>
                <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider" style={{ letterSpacing: "0.06em" }}>Date</th>
                <th className="text-right font-medium px-5 py-3 text-xs uppercase tracking-wider" style={{ letterSpacing: "0.06em" }}>Amount</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => {
                // ADD a safe fallback so the app never crashes if the text doesn't match perfectly
                       const pStyle = paymentStyle[row.payment] || { color: '#6b7280', bg: '#f3f4f6' };
                return (
                  <tr key={row.id} className="row-hover" style={{ borderTop: `1px solid ${T.lineSoft}` }}>
                    <td className="px-5 py-3" style={{ color: T.textPrimary }}>{row.customer}</td>
                    <td className="px-5 py-3" style={{ color: T.textPrimary }}>{row.productDisplay}</td>
                    <td className="px-5 py-3 text-right" style={{ color: T.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>{row.qty}</td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ color: pStyle.color, background: pStyle.bg }}
                      >
                        {row.payment}
                      </span>
                    </td>
                    <td className="px-5 py-3" style={{ color: T.textMuted }}>{row.dateDisplay}</td>
                    <td className="px-5 py-3 text-right font-medium" style={{ color: T.teal, fontFamily: "'JetBrains Mono', monospace" }}>
                      {row.amountDisplay}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="text-xs font-medium"
                        style={{ color: T.red }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <SaleModal
          brands={brands}
          products={products}
          onClose={() => setShowModal(false)}
          // CHANGE THIS LINE:
          onSave={(data: any) => handleCreateSale(data)}
          saving={saving}
        />
      )}
    </>
  );
}