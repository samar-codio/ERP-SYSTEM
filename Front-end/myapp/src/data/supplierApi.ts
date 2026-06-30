import type { Supplier } from "../models/Supplier";

const API_BASE = "http://127.0.0.1:8000/api";

export async function getSuppliers(): Promise<Supplier[]> {
  const res = await fetch(`${API_BASE}/suppliers/`);
  if (!res.ok) throw new Error("Failed to fetch suppliers from database");
  return await res.json();
}

export async function createSupplier(supplier: Omit<Supplier, "id">): Promise<Supplier> {
  const payload: any = { ...supplier };

  if (!payload.lastPurchaseDate || String(payload.lastPurchaseDate).length !== 10) {
    delete payload.lastPurchaseDate;
  }

  console.log("🚀 SENDING PAYLOAD TO DJANGO:", payload);

  const res = await fetch(`${API_BASE}/suppliers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("🚨 Django Validation Error:", errorData);
    throw new Error("Failed to create supplier");
  }

  return res.json();
}

export async function updateSupplier(supplier: Supplier): Promise<Supplier> {
  const payload: any = { ...supplier };
  
  // Apply the same Nuclear Option to updates!
  if (!payload.lastPurchaseDate || String(payload.lastPurchaseDate).length !== 10) {
    delete payload.lastPurchaseDate;
  }

  console.log("🚀 SENDING UPDATE PAYLOAD TO DJANGO:", payload);

  const res = await fetch(`${API_BASE}/suppliers/${supplier.id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Catch the specific error so we aren't guessing
  if (!res.ok) {
    const errorData = await res.json();
    console.error("🚨 Django Validation Error (Update):", errorData);
    throw new Error("Failed to update supplier");
  }
  
  return res.json();
}

export async function deleteSupplier(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/suppliers/${id}/`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete supplier");
}