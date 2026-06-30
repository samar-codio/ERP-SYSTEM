import { T } from "../../theme";

export default function LoadingState({ label }: { label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl py-20"
      style={{ background: T.surface, border: `1px solid ${T.line}` }}
    >
      <span
        className="w-2.5 h-2.5 rounded-full gauge-wave"
        style={{ background: T.teal }}
      />
      <p className="text-sm" style={{ color: T.textMuted }}>{label}</p>
    </div>
  );
}