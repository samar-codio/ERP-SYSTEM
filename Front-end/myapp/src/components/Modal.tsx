import { X } from "lucide-react";
import { T } from "../theme";

interface ModalProps {
  title: string;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (formData: Record<string, any>) => void;
  children: React.ReactNode;
  saving?: boolean;
}

export default function Modal({ title, onClose, onSave, children, saving }: ModalProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.currentTarget));
    onSave(formData);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(7,12,22,0.72)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: T.surface, border: `1px solid ${T.line}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: T.textPrimary, fontFamily: "'Space Grotesk', sans-serif" }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{ width: 28, height: 28, color: T.textMuted }}
          >
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {children}
          <div className="flex justify-end gap-2 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              style={{ color: T.textMuted, background: T.lineSoft, border: `1px solid ${T.line}` }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
              style={{ color: T.ink, background: T.teal }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
