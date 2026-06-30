import type { FinishedGood } from "../models/FinishedGood";

const API_BASE = "http://127.0.0.1:8000/api";

export async function getFinishedGoods(): Promise<FinishedGood[]> {
  const res = await fetch(`${API_BASE}/finishedgoods/`);
  if (!res.ok) throw new Error("Failed to fetch finished goods");
  const data = await res.json();
  console.log("Raw finished goods data:", data);
  // Transform API response to match frontend interface
  const transformed = data.map((item: any) => ({
    id: String(item.id),
    brandId: String(item.brand?.id || item.brand),
    brandName: item.brandName || item.brand?.name,
    productId: item.productId,
    productName: item.productName,
    stock: Number(item.stock),
    unit: item.unit,
    reorderLevel: Number(item.reorderLevel || 500),
    lastUpdated: item.lastUpdated,
  }));
  console.log("Transformed finished goods:", transformed);
  return transformed;
}

export async function createFinishedGood(good: Omit<FinishedGood, "id">): Promise<FinishedGood> {
  const payload: any = {
    brand: good.brandId,
    brandName: good.brandName,
    productId: good.productId,
    productName: good.productName,
    stock: good.stock,
    unit: good.unit,
  };
  delete payload.lastUpdated; // Django handles this automatically

  console.log("Creating finished good with payload:", payload);

  const res = await fetch(`${API_BASE}/finishedgoods/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Failed to create finished good:", errorText);
    throw new Error(`Failed to create finished good: ${errorText}`);
  }
  
  return res.json();
}

export async function updateFinishedGood(good: FinishedGood): Promise<FinishedGood> {
  const payload: any = { ...good, brand: good.brandId };
  delete payload.lastUpdated; // Django handles this automatically

  const res = await fetch(`${API_BASE}/finishedgoods/${good.id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update finished good");
  return res.json();
}

export async function deleteFinishedGood(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/finishedgoods/${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete finished good");
}