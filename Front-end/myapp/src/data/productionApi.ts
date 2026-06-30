import type { ProductionBatch, BOM } from "../models/Production";

const API_BASE = "http://127.0.0.1:8000/api";

export async function getProductionBatches(): Promise<ProductionBatch[]> {
  const res = await fetch(`${API_BASE}/productionbatches/`);
  if (!res.ok) throw new Error("Failed to fetch production batches");
  const data = await res.json();
  return data.map((item: any) => ({
    id: String(item.id),
    date: item.date,
    brandId: String(item.brand?.id || item.brand),
    brandName: item.brandName || item.brand?.name,
    productId: item.productId,
    productName: item.productName,
    qty: Number(item.qty),
    totalRawConsumed: item.totalRawConsumed ? Number(item.totalRawConsumed) : null,
  }));
}

export async function createProductionBatch(batch: Omit<ProductionBatch, "id">): Promise<ProductionBatch> {
  const payload: any = {
    brand: batch.brandId,
    brandName: batch.brandName,
    productId: batch.productId,
    productName: batch.productName,
    qty: batch.qty,
    date: batch.date || new Date().toISOString().split('T')[0],
  };

  console.log("Creating production batch with payload:", payload);

  const res = await fetch(`${API_BASE}/productionbatches/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Failed to create production batch:", errorText);
    throw new Error(`Failed to create production batch: ${errorText}`);
  }
  
  return res.json();
}

export async function updateProductionBatch(batch: ProductionBatch): Promise<ProductionBatch> {
  const payload: any = {
    brand: batch.brandId,
    brandName: batch.brandName,
    productId: batch.productId,
    productName: batch.productName,
    qty: batch.qty,
    date: batch.date,
    totalRawConsumed: batch.totalRawConsumed,
  };

  const res = await fetch(`${API_BASE}/productionbatches/${batch.id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update production batch");
  return res.json();
}

export async function deleteProductionBatch(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/productionbatches/${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete production batch");
}

export async function getBomForProduct(productId: string): Promise<BOM | undefined> {
  const res = await fetch(`${API_BASE}/boms/`);
  if (!res.ok) throw new Error("Failed to fetch BOMs");
  
  const boms: BOM[] = await res.json();
  // Find the specific recipe for this product
  return boms.find(b => b.productId === productId);
}
export async function saveBom(bom: Omit<BOM, "id">): Promise<BOM> {
  // 1. Create the main BOM record
  const bomRes = await fetch(`${API_BASE}/boms/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: bom.productId }),
  });
  if (!bomRes.ok) throw new Error("Failed to create BOM");
  const createdBom = await bomRes.json();

  // 2. Attach all the materials (BOMItems) to that newly created BOM
  const createdItems = [];
  for (const item of bom.items) {
    const itemRes = await fetch(`${API_BASE}/bomitems/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bom: createdBom.id, // This tells Django which BOM this ingredient belongs to
        rawMaterial: item.rawMaterialId, 
        rawMaterialName: item.rawMaterialName,
        qtyPerUnit: item.qtyPerUnit
      }),
    });
    if (itemRes.ok) {
      createdItems.push(await itemRes.json());
    }
  }

  return { ...createdBom, items: createdItems };
}