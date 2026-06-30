import type { LucideIcon } from "lucide-react";
import { T } from "../theme";

interface ComingSoonProps {
  label: string;
  icon: LucideIcon;
}

export default function ComingSoon({ label, icon: Icon }: ComingSoonProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center gap-4 rounded-2xl py-24 px-8"
      style={{ background: T.surface, border: `1px solid ${T.line}` }}
    >
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ width: 56, height: 56, background: T.tealDim, color: T.teal }}
      >
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-lg font-semibold" style={{ color: T.textPrimary }}>{label}</h3>
        <p className="text-sm mt-1 max-w-sm" style={{ color: T.textMuted }}>
          This module isn't built yet. It'll live here once it's wired up to real data.
        </p>
      </div>
      <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ color: T.amber, background: T.amberDim }}>
        Coming soon
      </span>
    </div>
  );
}
