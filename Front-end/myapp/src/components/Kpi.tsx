import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { T } from "../theme";

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  trendUp?: boolean;
  accent: { color: string; bg: string };
  children?: ReactNode;
}

export function KpiCard({ icon: Icon, label, value, sub, trendUp, accent, children }: KpiCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: T.surface, border: `1px solid ${T.line}` }}
    >
      <div className="flex items-center justify-between">
        <div
          className="flex items-center justify-center rounded-xl"
          style={{ width: 38, height: 38, background: accent.bg, color: accent.color }}
        >
          <Icon size={18} strokeWidth={2} />
        </div>
        {sub && (
          <div
            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
            style={{ color: trendUp ? T.teal : T.red, background: trendUp ? T.tealDim : T.redDim }}
          >
            {sub}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm mb-1" style={{ color: T.textMuted }}>{label}</p>
        <p
          className="text-2xl font-semibold tracking-tight"
          style={{ color: T.textPrimary, fontFamily: "'JetBrains Mono', monospace" }}
        >
          {value}
        </p>
      </div>
      {children}
    </div>
  );
}

interface FillBarProps {
  pct: number;
  color: string;
}

export function FillBar({ pct, color }: FillBarProps) {
  return (
    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: T.lineSoft }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(pct, 100)}%`, background: color }}
      />
    </div>
  );
}
