import { AlertTriangle, RotateCw } from "lucide-react";
import { T } from "../../theme";

interface ErrorStateProps {
  label: string;
  onRetry?: () => void;
}

export default function ErrorState({ label, onRetry }: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center gap-4 rounded-2xl py-20 px-8"
      style={{ background: T.surface, border: `1px solid ${T.line}` }}
    >
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ width: 48, height: 48, background: T.redDim, color: T.red }}
      >
        <AlertTriangle size={20} />
      </div>
      <div>
        <h3 className="text-sm font-semibold" style={{ color: T.textPrimary }}>{label}</h3>
        <p className="text-xs mt-1 max-w-sm" style={{ color: T.textMuted }}>
          Couldn't reach the server. Check your connection and try again.
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
          style={{ color: T.teal, background: T.tealDim }}
        >
          <RotateCw size={13} />
          Try again
        </button>
      )}
    </div>
  );
}