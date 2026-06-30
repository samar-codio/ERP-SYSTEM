import {
  LayoutDashboard,
  Factory,
  Boxes,
  PackageSearch,
  ShoppingCart,
  Users,
  Truck,
  Wallet,
  CreditCard,
  BookOpen,
  FileBarChart2,
  Settings as SettingsIcon,
  type LucideIcon,
} from "lucide-react";

export type NavKey =
  | "dashboard"
  | "production"
  | "raw-materials"
  | "finished-goods"
  | "sales"
  | "brands"
  | "suppliers"
  | "salary"
  | "expenses"
  | "ledger"
  | "reports"
  | "settings";

export interface NavItem {
  key: NavKey;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { key: "production", label: "Production", icon: Factory },
      { key: "raw-materials", label: "Raw Materials", icon: Boxes },
      { key: "finished-goods", label: "Finished Goods", icon: PackageSearch },
      { key: "sales", label: "Sales", icon: ShoppingCart },
    ],
  },
  {
    label: "Relations & Finance",
    items: [
      { key: "brands", label: "Brands", icon: Users },
      { key: "suppliers", label: "Suppliers", icon: Truck },
      { key: "salary", label: "Salary", icon: Wallet },
      { key: "expenses", label: "Expenses", icon: CreditCard },
      { key: "ledger", label: "Ledger", icon: BookOpen },
    ],
  },
  {
    label: "System",
    items: [
      { key: "reports", label: "Reports & Profit", icon: FileBarChart2 },
      { key: "settings", label: "Settings", icon: SettingsIcon },
    ],
  },
];
