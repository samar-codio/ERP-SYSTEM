export type PaymentMethod = "Cash" | "Credit" | "Bank Transfer";

export interface Sale {
  id: string;
  customer: string;
  brandId: string;
  productId: string;
  brandName: string;
  productName: string;
  qty: number;
  unitPrice: number;
  amount: number;
  payment: PaymentMethod;
  date: string; // ISO date
}