import {
  TrendingUp, TrendingDown, DollarSign, BarChart2, Users, ShoppingCart, Printer
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from "recharts";
import { KpiCard } from "../components/Kpi";
import LoadingState from "../components/state/LoadingState";
import ErrorState from "../components/state/ErrorState";
import { T } from "../theme";
import { money } from "../data/mockData";
import { getSales } from "../data/salesApi";
import { getExpenses } from "../data/expenseApi";
import type { Sale } from "../models/Sale";
import type { Expense } from "../models/Expense";
import type { SalaryTransaction } from "../models/Employee";
import { getTransactions } from "../data/employeeApi";

type Period = "this-month" | "last-month" | "this-year";

function getRange(period: Period): { start: Date; end: Date; label: string } {
  const now = new Date();
  if (period === "this-month") {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
      label: now.toLocaleString("en-PK", { month: "long", year: "numeric" }),
    };
  }
  if (period === "last-month") {
    const m = now.getMonth() - 1;
    const y = m < 0 ? now.getFullYear() - 1 : now.getFullYear();
    const mo = m < 0 ? 11 : m;
    return {
      start: new Date(y, mo, 1),
      end: new Date(y, mo + 1, 0, 23, 59, 59),
      label: new Date(y, mo, 1).toLocaleString("en-PK", { month: "long", year: "numeric" }),
    };
  }
  return {
    start: new Date(now.getFullYear(), 0, 1),
    end: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
    label: String(now.getFullYear()),
  };
}

function inRange(dateStr: string, start: Date, end: Date) {
  const d = new Date(dateStr);
  return d >= start && d <= end;
}

const PERIOD_LABELS: Record<Period, string> = {
  "this-month": "This Month",
  "last-month": "Last Month",
  "this-year": "This Year",
};

const CHART_COLORS = ["#2BD9C2", "#7FB2FF", "#FF9B4D", "#FF6B6B", "#A78BFA", "#34D399"];

export default function Reports() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transactions, setTransactions] = useState<SalaryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("this-month");
  const printRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([getSales(), getExpenses(), getTransactions()])
      .then(([s, e, t]) => {
        setSales(s);
        setExpenses(e);
        setTransactions(t);
      })
      .catch(() => setError("Failed to load report data"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const { start, end, label } = useMemo(() => getRange(period), [period]);

  const filtered = useMemo(() => {
    const s = sales.filter((x) => inRange(x.date, start, end));
    const e = expenses.filter((x) => inRange(x.date, start, end));
    const t = transactions.filter(
      (x) => inRange(x.date, start, end) && (x.type === "Salary" || x.type === "Payment")
    );
    return { sales: s, expenses: e, salaryTx: t };
  }, [sales, expenses, transactions, start, end]);

  const kpis = useMemo(() => {
    const revenue = filtered.sales.reduce((s, x) => s + (x.amount || 0), 0);
    const expTotal = filtered.expenses.reduce((s, x) => s + (x.amount || 0), 0);
    const salTotal = filtered.salaryTx.reduce((s, x) => s + (x.amount || 0), 0);
    const profit = revenue - expTotal - salTotal;
    const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
    return { revenue, expTotal, salTotal, profit, margin };
  }, [filtered]);

  const byBrand = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.sales.forEach((s) => {
      map[s.brandName] = (map[s.brandName] ?? 0) + s.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const byProduct = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.sales.forEach((s) => {
      map[s.productName] = (map[s.productName] ?? 0) + s.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filtered]);

  const topCustomers = useMemo(() => {
    const map: Record<string, { revenue: number; orders: number }> = {};
    filtered.sales.forEach((s) => {
      if (!map[s.customer]) map[s.customer] = { revenue: 0, orders: 0 };
      map[s.customer].revenue += s.amount;
      map[s.customer].orders += 1;
    });
    return Object.entries(map)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filtered]);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.expenses.forEach((e) => {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const cardStyle = { background: T.surface, border: `1px solid ${T.line}` };

  return (
    <div ref={printRef}>
      {/* Header */}
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: T.textMuted }}>Analytics</p>
          <h1
            className="text-[28px] font-semibold tracking-tight mt-1 flex items-center gap-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.textPrimary }}
          >
            <BarChart2 size={26} style={{ color: T.teal }} />
            Reports & Profit
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Period toggle */}
          <div
            className="flex gap-1 p-1 rounded-xl"
            style={{ background: T.surface, border: `1px solid ${T.line}` }}
          >
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  background: period === p ? T.teal : "transparent",
                  color: period === p ? T.ink : T.textMuted,
                }}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg"
            style={{ color: T.textMuted, background: T.surface, border: `1px solid ${T.line}` }}
          >
            <Printer size={15} />
            Print
          </button>
        </div>
      </div>

      {loading && <LoadingState label="Loading report data…" />}
      {!loading && error && <ErrorState label={error} onRetry={load} />}

      {!loading && !error && (
        <>
          <p
            className="text-xs mb-4 font-medium uppercase tracking-wider"
            style={{ color: T.textMuted, letterSpacing: "0.08em" }}
          >
            {label}
          </p>

          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              icon={ShoppingCart}
              label="Total Revenue"
              value={money(kpis.revenue)}
              trendUp
              accent={{ color: T.teal, bg: T.tealDim }}
            />
            <KpiCard
              icon={TrendingDown}
              label="Total Costs"
              value={money(kpis.expTotal + kpis.salTotal)}
              sub={`Ops: ${money(kpis.expTotal)} · Sal: ${money(kpis.salTotal)}`}
              trendUp={false}
              accent={{ color: T.red, bg: T.redDim }}
            />
            <KpiCard
              icon={TrendingUp}
              label={kpis.profit >= 0 ? "Net Profit" : "Net Loss"}
              value={money(Math.abs(kpis.profit))}
              sub={kpis.profit >= 0 ? "▲ Profit" : "▼ Loss"}
              trendUp={kpis.profit >= 0}
              accent={{
                color: kpis.profit >= 0 ? T.teal : T.red,
                bg: kpis.profit >= 0 ? T.tealDim : T.redDim,
              }}
            />
            <KpiCard
              icon={DollarSign}
              label="Profit Margin"
              value={`${kpis.margin}%`}
              sub={kpis.margin >= 50 ? "Healthy" : kpis.margin >= 20 ? "Moderate" : "Low"}
              trendUp={kpis.margin >= 30}
              accent={{ color: "#7FB2FF", bg: "rgba(127,178,255,0.14)" }}
            />
          </div>

          {/* Revenue vs Costs bar + Brand pie */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2 rounded-2xl p-5" style={cardStyle}>
              <h2 className="text-sm font-semibold mb-4" style={{ color: T.textPrimary }}>
                Revenue vs Costs
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={[
                    { name: "Revenue", value: kpis.revenue, color: T.teal },
                    { name: "Expenses", value: kpis.expTotal, color: T.amber },
                    { name: "Salary", value: kpis.salTotal, color: "#7FB2FF" },
                    { name: "Profit", value: Math.max(0, kpis.profit), color: kpis.profit >= 0 ? T.teal : T.red },
                  ]}
                  barSize={40}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fill: T.textMuted, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: T.surfaceRaised,
                      border: `1px solid ${T.line}`,
                      borderRadius: 10,
                      color: T.textPrimary,
                      fontSize: 12,
                    }}
formatter={(v) => [money(Number(v)), ""]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {[T.teal, T.amber, "#7FB2FF", kpis.profit >= 0 ? T.teal : T.red].map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl p-5" style={cardStyle}>
              <h2 className="text-sm font-semibold mb-4" style={{ color: T.textPrimary }}>
                Sales by Brand
              </h2>
              {byBrand.length === 0 ? (
                <p className="text-xs" style={{ color: T.textMuted }}>No sales data.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={byBrand}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={65}
                      paddingAngle={3}
                    >
                      {byBrand.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: T.surfaceRaised,
                        border: `1px solid ${T.line}`,
                        borderRadius: 10,
                        color: T.textPrimary,
                        fontSize: 12,
                      }}
formatter={(v) => [money(Number(v)), ""]}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11, color: T.textMuted }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Products bar + Expense breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2 rounded-2xl p-5" style={cardStyle}>
              <h2 className="text-sm font-semibold mb-4" style={{ color: T.textPrimary }}>
                Sales by Product
              </h2>
              {byProduct.length === 0 ? (
                <p className="text-xs" style={{ color: T.textMuted }}>No product sales.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={byProduct} layout="vertical" barSize={14}>
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={160}
                      tick={{ fill: T.textMuted, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: T.surfaceRaised,
                        border: `1px solid ${T.line}`,
                        borderRadius: 10,
                        color: T.textPrimary,
                        fontSize: 12,
                      }}
formatter={(v) => [money(Number(v)), ""]}
                    />
                    <Bar dataKey="value" fill={T.teal} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="rounded-2xl p-5" style={cardStyle}>
              <h2 className="text-sm font-semibold mb-4" style={{ color: T.textPrimary }}>
                Expense Breakdown
              </h2>
              {byCategory.length === 0 ? (
                <p className="text-xs" style={{ color: T.textMuted }}>No expenses.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {byCategory.map((c, i) => {
                    const pct = kpis.expTotal > 0
                      ? Math.round((c.value / kpis.expTotal) * 100)
                      : 0;
                    return (
                      <div key={c.name}>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span style={{ color: T.textPrimary }}>{c.name}</span>
                          <span style={{ color: T.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                            {money(c.value)}{" "}
                            <span style={{ color: T.amber }}>({pct}%)</span>
                          </span>
                        </div>
                        <div
                          className="h-1.5 w-full rounded-full overflow-hidden"
                          style={{ background: T.lineSoft }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: CHART_COLORS[i % CHART_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Top Customers table */}
          <div className="rounded-2xl overflow-hidden" style={cardStyle}>
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: `1px solid ${T.line}` }}
            >
              <h2
                className="text-sm font-semibold flex items-center gap-2"
                style={{ color: T.textPrimary }}
              >
                <Users size={15} style={{ color: T.teal }} />
                Top Customers
              </h2>
              <span className="text-xs" style={{ color: T.textMuted }}>{label}</span>
            </div>
            {topCustomers.length === 0 ? (
              <p className="px-5 py-6 text-xs" style={{ color: T.textMuted }}>
                No customer data for this period.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: T.textMuted, borderBottom: `1px solid ${T.lineSoft}` }}>
                    <th className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider" style={{ letterSpacing: "0.06em" }}>Customer</th>
                    <th className="text-right font-medium px-5 py-3 text-xs uppercase tracking-wider" style={{ letterSpacing: "0.06em" }}>Orders</th>
                    <th className="text-right font-medium px-5 py-3 text-xs uppercase tracking-wider" style={{ letterSpacing: "0.06em" }}>Revenue</th>
                    <th className="text-right font-medium px-5 py-3 text-xs uppercase tracking-wider" style={{ letterSpacing: "0.06em" }}>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((c) => {
                    const share = kpis.revenue > 0
                      ? Math.round((c.revenue / kpis.revenue) * 100)
                      : 0;
                    return (
                      <tr
                        key={c.name}
                        className="row-hover"
                        style={{ borderTop: `1px solid ${T.lineSoft}` }}
                      >
                        <td className="px-5 py-3" style={{ color: T.textPrimary }}>{c.name}</td>
                        <td className="px-5 py-3 text-right" style={{ color: T.textMuted }}>{c.orders}</td>
                        <td
                          className="px-5 py-3 text-right font-medium"
                          style={{ color: T.teal, fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {money(c.revenue)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ color: T.teal, background: T.tealDim }}
                          >
                            {share}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}