import type { Sale } from "../models/Sale";

const API_BASE = "http://127.0.0.1:8000/api";

export async function getSales(): Promise<Sale[]> {
  const res = await fetch(`${API_BASE}/sales/`);
  if (!res.ok) throw new Error("Failed to fetch sales");
  const data = await res.json();
  // Transform API response to match Sale interface
  return data.map((item: any) => ({
    id: item.id,
    date: item.date,
    customer: item.customer,
    brandId: item.brandId || item.brand_id || item.brand?.id || item.brand,
    brandName: item.brandName || item.brand_name || item.brand?.name,
    productId: item.productId || item.product_id || item.product?.id || item.product,
    productName: item.productName || item.product_name || item.product?.name,
    qty: Number(item.qty),
    unitPrice: Number(item.unitPrice || item.unit_price || item.price),
    amount: Number(item.amount),
    payment: item.payment,
  }));
}

export async function createSale(sale: Omit<Sale, "id">): Promise<Sale> {
  const payload: any = {
    customer: sale.customer,
    brand: sale.brandId,
    brandName: sale.brandName,
    productId: sale.productId,
    productName: sale.productName,
    qty: sale.qty,
    unitPrice: sale.unitPrice,
    amount: sale.qty * sale.unitPrice, // Calculate amount
    payment: sale.payment,
    date: new Date().toISOString().split('T')[0], // Add current date
  };
  
  console.log("Creating sale with payload:", payload);
  
  const res = await fetch(`${API_BASE}/sales/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Failed to create sale:", errorText);
    throw new Error(`Failed to create sale: ${errorText}`);
  }
  
  return res.json();
}

export async function updateSale(sale: Sale): Promise<Sale> {
  const payload: any = {
    customer: sale.customer,
    brand: sale.brandId,
    brandName: sale.brandName,
    productId: sale.productId,
    productName: sale.productName,
    qty: sale.qty,
    unitPrice: sale.unitPrice,
    amount: sale.amount,
    payment: sale.payment,
    date: sale.date,
  };

  const res = await fetch(`${API_BASE}/sales/${sale.id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update sale");
  return res.json();
}

export async function deleteSale(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/sales/${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete sale");
}

export async function getProducts(): Promise<any[]> {
  try {
    // Hits your active Django endpoint directly using native fetch
    const response = await fetch("http://127.0.0.1:8000/api/finishedgoods/");
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw products data from API:", data);
    // Transform API response to match Product interface
    // Handle different possible field names from Django API
    const transformed = data.map((item: any) => ({
      id: String(item.id),
      brandId: String(item.brand?.id || item.brand),
      name: item.productName || item.name,
      unitPrice: 0, // FinishedGood doesn't have unitPrice, will be set by user
    }));
    console.log("Transformed products:", transformed);
    return transformed;
  } catch (error) {
    console.error("Error fetching finished goods from database:", error);
    return []; // Safe fallback array to keep the UI from crashing if backend drops
  }
}