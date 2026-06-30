export interface FinishedGood {
  id: string;
  brandId: string;
  brandName: string;
  productId: string;
  productName: string;
  stock: number;
  unit: string;           // e.g. "pcs", "bottles"
  reorderLevel: number;   // threshold for low stock alert
  lastUpdated: string;
}