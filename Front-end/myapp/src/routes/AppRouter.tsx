import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Production from "../pages/Production";
import RawMaterials from "../pages/RawMaterials";
import FinishedGoods from "../pages/FinishedGoods";
import Sales from "../pages/Sales";
import Brands from "../pages/Brands";
import Suppliers from "../pages/Suppliers";
import Salary from "../pages/Salary";
import Expenses from "../pages/Expenses";
import Ledger from "../pages/Ledger";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";

import { ROUTE_BY_KEY } from "./routeConfig";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTE_BY_KEY.dashboard} replace />} />
      <Route path={ROUTE_BY_KEY.dashboard} element={<Dashboard />} />
      <Route path={ROUTE_BY_KEY.production} element={<Production />} />
      <Route path={ROUTE_BY_KEY["raw-materials"]} element={<RawMaterials />} />
      <Route path={ROUTE_BY_KEY["finished-goods"]} element={<FinishedGoods />} />
      <Route path={ROUTE_BY_KEY.sales} element={<Sales />} />
      <Route path={ROUTE_BY_KEY.brands} element={<Brands />} />
      <Route path={ROUTE_BY_KEY.suppliers} element={<Suppliers />} />
      <Route path={ROUTE_BY_KEY.salary} element={<Salary />} />
      <Route path={ROUTE_BY_KEY.expenses} element={<Expenses />} />
      <Route path={ROUTE_BY_KEY.ledger} element={<Ledger />} />
      <Route path={ROUTE_BY_KEY.reports} element={<Reports />} />
      <Route path={ROUTE_BY_KEY.settings} element={<Settings />} />

      <Route path="*" element={<Navigate to={ROUTE_BY_KEY.dashboard} replace />} />
    </Routes>
  );
}


