export type MaterialUnit = "pcs" | "kg" | "g" | "L" | "ml";

export interface RawMaterial {
  id: string;
  name: string;
  stock: number;
  unit: MaterialUnit;
  reorder: number;
}