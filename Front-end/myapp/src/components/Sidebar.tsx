import { Factory } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { T } from "../theme";
import { NAV, type NavKey } from "../nav";
import { ROUTE_BY_KEY } from "../routes/routeConfig";

interface SidebarProps {
  active: NavKey;
}

export default function Sidebar({ active }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <aside
      className="flex flex-col shrink-0"
      style={{ width: 256, background: T.surface, borderRight: `1px solid ${T.line}` }}
    >
      <div className="flex items-center gap-3 px-5 py-6">
        <div
          className="flex items-center justify-center rounded-xl shrink-0"
          style={{ width: 40, height: 40, background: T.tealDim, color: T.teal }}
        >
          <Factory size={20} />
        </div>
        <div className="leading-tight">
          <p
            className="font-semibold tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, color: T.textPrimary }}
          >
            RAES
          </p>
          <p className="text-xs" style={{ color: T.textMuted }}>Food &amp; Beverages ERP</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto raes-scroll px-3 pb-4">
        {NAV.map((group) => (
          <div key={group.label} className="mb-5">
            <p
              className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: T.textMuted, letterSpacing: "0.08em" }}
            >
              {group.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;
                return (
                  <li key={item.key}>
                    <button
                      onClick={() => navigate(ROUTE_BY_KEY[item.key])}
                      className={`nav-item w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "active" : ""}`}
                      style={{
                        background: isActive ? T.surfaceRaised : "transparent",
                        color: isActive ? T.textPrimary : T.textMuted,
                      }}
                    >
                      <Icon size={16} strokeWidth={2} />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-5 py-4" style={{ borderTop: `1px solid ${T.line}` }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full gauge-wave" style={{ background: T.teal }} />
          <p className="text-xs" style={{ color: T.textMuted }}>Synced just now</p>
        </div>
      </div>
    </aside>
  );
}