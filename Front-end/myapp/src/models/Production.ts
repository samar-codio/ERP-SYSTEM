export interface BOMItem {
  rawMaterialId: string;
  rawMaterialName: string;
  qtyPerUnit: number; // per single finished good unit
}

export interface BOM {
  productId: string;
  items: BOMItem[];
}

export interface ProductionBatch {
  id: string;
  date: string;
  brandId: string;
  brandName: string;
  productId: string;
  productName: string;
  qty: number;
  totalRawConsumed?: number; // for display
}