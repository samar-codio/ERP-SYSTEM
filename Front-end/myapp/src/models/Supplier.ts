export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  totalPurchases: number;   // total amount purchased so far
  outstanding: number;      // pending payment
  lastPurchaseDate?: string;
}