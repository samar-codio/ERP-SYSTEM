import { Search, Bell, Hammer, Plus } from "lucide-react";
import { T } from "../theme";


export default function Header() {
  return (
    <header
      className="flex items-center justify-between px-8 py-5 sticky top-0 z-10"
      style={{ background: `${T.ink}E6`, borderBottom: `1px solid ${T.line}`, backdropFilter: "blur(8px)" }}
    >
      <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
        <Search size={15} style={{ color: T.textMuted }} />
        <input
          placeholder="Search invoices, batches, brands…"
          className="bg-transparent text-sm outline-none w-64"
          style={{ color: T.textPrimary }}
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          className="icon-btn flex items-center justify-center rounded-xl"
          style={{ width: 38, height: 38, background: T.surface, border: `1px solid ${T.line}`, color: T.textMuted }}
        >
          <Bell size={16} />
        </button>
        <button
          onClick={() => window.location.assign("/production")}
          className="quick-btn flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          style={{ background: T.teal, color: "#04231E" }}
        >
          <Hammer size={15} />
          Start Production
        </button>
        <button
          onClick={() => window.location.assign("/sales")}
          className="quick-btn flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          style={{ background: T.surfaceRaised, color: T.textPrimary, border: `1px solid ${T.line}` }}
        >
          <Plus size={15} />
          New Sale
        </button>
      </div>
    </header>
  );
}
