import type { LucideIcon } from "lucide-react";
import { T } from "../../theme";

interface EmptyStateProps {
  label: string;
  icon: LucideIcon;
  action?: { text: string; onClick: () => void };
}

export default function EmptyState({ label, icon: Icon, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center gap-4 rounded-2xl py-20 px-8"
      style={{ background: T.surface, border: `1px solid ${T.line}` }}
    >
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ width: 48, height: 48, background: T.tealDim, color: T.teal }}
      >
        <Icon size={20} />
      </div>
      <p className="text-sm" style={{ color: T.textMuted }}>{label}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
          style={{ color: T.ink, background: T.teal }}
        >
          {action.text}
        </button>
      )}
    </div>
  );
}