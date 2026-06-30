import { useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AppRouter from "./routes/AppRouter";
import { getNavKeyFromPath } from "./routes/routeConfig";
import { T } from "./theme";

export default function App() {
  const location = useLocation();
  const active = getNavKeyFromPath(location.pathname);

  return (
    <div
      className="flex w-full min-h-screen"
      style={{ background: T.ink, fontFamily: "'Inter', sans-serif", color: T.textPrimary }}
    >
      <Sidebar active={active} />
      <main className="flex-1 overflow-y-auto raes-scroll">
        <Header />
        <div className="px-8 py-7">
          <AppRouter />
        </div>
      </main>
    </div>
  );
}

