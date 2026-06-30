import type { Brand } from "../models/Brand";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

export async function getBrands(): Promise<Brand[]> {
  const res = await fetch(`${API_BASE}/brands/`);
  if (!res.ok) throw new Error("Failed to fetch brands");
  const data = await res.json();
  console.log("Raw brands data from API:", data);
  const transformed = data.map((item: any) => ({
    id: String(item.id),
    name: item.name,
  }));
  console.log("Transformed brands:", transformed);
  return transformed;
}

export async function createBrand(brand: Omit<Brand, "id">): Promise<Brand> {
  const res = await fetch(`${API_BASE}/brands/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(brand),
  });
  if (!res.ok) throw new Error("Failed to create brand");
  return res.json();
}

export async function updateBrand(brand: Brand): Promise<Brand> {
  const res = await fetch(`${API_BASE}/brands/${brand.id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(brand),
  });
  if (!res.ok) throw new Error("Failed to update brand");
  return res.json();
}

export async function deleteBrand(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/brands/${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete brand");
}