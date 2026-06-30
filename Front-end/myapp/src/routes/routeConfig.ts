import type { NavKey } from "../nav";

export type RouteKey = NavKey;

export const ROUTE_BY_KEY: Record<RouteKey, string> = {
  dashboard: "/dashboard",
  production: "/production",
  "raw-materials": "/raw-materials",
  "finished-goods": "/finished-goods",
  sales: "/sales",
  brands: "/brands",
  suppliers: "/suppliers",
  salary: "/salary",
  expenses: "/expenses",
  ledger: "/ledger",
  reports: "/reports",
  settings: "/settings",
};

const KEY_BY_PATH: Partial<Record<string, RouteKey>> = Object.entries(ROUTE_BY_KEY).reduce(
  (acc, [routeKey, path]) => {
    acc[path] = routeKey as RouteKey;
    return acc;
  },
  {} as Partial<Record<string, RouteKey>>,
);

export const getNavKeyFromPath = (pathname: string): RouteKey => {
  const key = KEY_BY_PATH[pathname];
  return key ?? "dashboard";
};

