import type { RawMaterial } from "../models/rawmaterial";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

export async function getRawMaterials(): Promise<RawMaterial[]> {
  const res = await fetch(`${API_BASE}/rawmaterials/`);
  if (!res.ok) throw new Error("Failed to fetch raw materials");
  return res.json();
}

export async function createRawMaterial(material: Omit<RawMaterial, "id">): Promise<RawMaterial> {
  const res = await fetch(`${API_BASE}/rawmaterials/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(material),
  });
  if (!res.ok) throw new Error("Failed to create raw material");
  return res.json();
}

export async function updateRawMaterial(material: RawMaterial): Promise<RawMaterial> {
  const res = await fetch(`${API_BASE}/rawmaterials/${material.id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(material),
  });
  if (!res.ok) throw new Error("Failed to update raw material");
  return res.json();
}

export async function deleteRawMaterial(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/rawmaterials/${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete raw material");
}