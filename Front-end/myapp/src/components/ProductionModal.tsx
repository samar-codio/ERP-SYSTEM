import { X, AlertTriangle } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { T } from "../theme";
import type { Brand } from "../models/Brand";
import type { BOM, BOMItem, ProductionBatch } from "../models/Production";
import type { RawMaterial } from "../models/rawmaterial";
import { getProducts } from "../data/salesApi";
import { getBrands } from "../data/brandApi";
import { getRawMaterials } from "../data/rawMaterialApi";
import { getBomForProduct, saveBom, } from "../data/productionApi";

interface ProductionModalProps {
  onClose: () => void;
  onSave: (batch: ProductionBatch) => void;
  saving?: boolean;
}

export default function ProductionModal({ onClose, onSave, saving }: ProductionModalProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  // Typed as any[] to accept custom fields like brandName, productId, productName coming from Django
  const [products, setProducts] = useState<any[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [qty, setQty] = useState(1);
  const [bom, setBom] = useState<BOM | null>(null);
  const [editingBom, setEditingBom] = useState(false);
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);

  // Filter using brandId from the transformed product data
  const brandProducts = useMemo(() => {
    return products.filter(p => String(p.brandId) === String(selectedBrandId));
  }, [products, selectedBrandId]);

  // Track selected product based on id
  const selectedProduct = useMemo(() => {
    return products.find(p => String(p.id) === String(selectedProductId));
  }, [products, selectedProductId]);

  const requiredMaterials = useMemo(() => {
    if (!bom || !selectedProduct) return [];
    return bom.items.map(item => {
      const material = materials.find(m => m.id === item.rawMaterialId);
      const requiredQty = item.qtyPerUnit * qty;
      const available = material?.stock || 0;
      return {
        ...item,
        materialName: material?.name || "Unknown",
        requiredQty,
        available,
        insufficient: requiredQty > available
      };
    });
  }, [bom, qty, materials, selectedProduct]);

  const hasInsufficient = requiredMaterials.some(r => r.insufficient);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bData, pData, mData] = await Promise.all([
          getBrands(),
          getProducts(),
          getRawMaterials()
        ]);

        console.log("ALL PRODUCTS FETCHED:", pData);
        setBrands(bData);
        setProducts(pData);
        setMaterials(mData);
      } catch {
        // Initial load failed — will show empty selects
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedProductId) {
      return;
    }

    // Use the productId from the selected product for BOM lookup
    const productForBom = products.find(p => String(p.id) === String(selectedProductId));
    const bomProductId = productForBom?.productId;

    if (bomProductId) {
      getBomForProduct(bomProductId).then(existingBom => {
        if (existingBom) {
          setBom(existingBom);
          setBomItems(existingBom.items);
          setEditingBom(false);
        } else {
          setBom(null);
          setBomItems([]);
          setEditingBom(true);
        }
      });
    }
  }, [selectedProductId, products]);

  const handleBrandChange = (id: string) => {
    setSelectedBrandId(id);
    setSelectedProductId("");
  };

  const handleAddBomItem = () => {
    setBomItems([...bomItems, { rawMaterialId: "", rawMaterialName: "", qtyPerUnit: 0 } as BOMItem]);
  };

  const handleBomItemChange = (
    index: number,
    field: keyof BOMItem,
    value: BOMItem[keyof BOMItem]
  ) => {
    const newItems = [...bomItems];
    if (field === "rawMaterialId") {
      const materialId = value as string;
      const mat = materials.find(m => m.id === materialId);
      newItems[index] = {
        ...newItems[index],
        rawMaterialId: materialId,
        rawMaterialName: mat?.name || ""
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setBomItems(newItems);
  };

  const handleRemoveBomItem = (index: number) => {
    setBomItems(bomItems.filter((_, i) => i !== index));
  };

  const handleSaveBom = async () => {
    if (!selectedProductId || bomItems.length === 0) return;

    // Use the productId from the selected product for BOM
    const productForBom = products.find(p => String(p.id) === String(selectedProductId));
    const bomProductId = productForBom?.productId || selectedProductId;

    const newBom: BOM = {
      productId: bomProductId,
      items: bomItems
    };

    await saveBom(newBom);
    setBom(newBom);
    setEditingBom(false);
  };

  const handleProduce = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandId || !selectedProductId || qty <= 0) return;

    const brand = brands.find(b => String(b.id) === String(selectedBrandId))!;
    const product = selectedProduct!;

    const batchInput = {
      brandId: selectedBrandId,
      brandName: brand.name,
      productId: product.productId || selectedProductId,
      productName: product.name,
      qty
    };

    try {
      onSave(batchInput as any);
    } catch {
      alert("Failed to record production batch");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(7,12,22,0.72)", backdropFilter: "blur(2px)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: T.surface, border: `1px solid ${T.line}` }} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold" style={{ color: T.textPrimary }}>Record Production</h2>
          <button onClick={onClose}><X size={20} style={{ color: T.textMuted }} /></button>
        </div>

        <form onSubmit={handleProduce}>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: T.textMuted }}>Brand</label>
              <select value={selectedBrandId} onChange={e => handleBrandChange(e.target.value)} className="w-full rounded-lg px-4 py-3" style={{ background: T.lineSoft, border: `1px solid ${T.line}`, color: T.textPrimary }} required>
                <option value="">Select Brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: T.textMuted }}>Product</label>
              <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} disabled={!selectedBrandId} className="w-full rounded-lg px-4 py-3 disabled:opacity-50" style={{ background: T.lineSoft, border: `1px solid ${T.line}`, color: T.textPrimary }} required>
                <option value="">Select Product</option>
                {brandProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedProductId && (
            <>
              {editingBom ? (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium" style={{ color: T.textPrimary }}>Define Bill of Materials (per unit)</label>
                    <button type="button" onClick={handleAddBomItem} className="text-xs px-3 py-1 rounded" style={{ background: T.teal, color: T.ink }}>Add Material</button>
                  </div>
                  {bomItems.map((item, index) => (
                    <div key={index} className="flex gap-3 mb-3">
                      <select value={item.rawMaterialId} onChange={e => handleBomItemChange(index, "rawMaterialId", e.target.value)} className="flex-1 rounded-lg px-3 py-2.5 text-sm" style={{ background: T.lineSoft, border: `1px solid ${T.line}` }}>
                        <option value="">Select Raw Material</option>
                        {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                      <input type="number" value={item.qtyPerUnit} onChange={e => handleBomItemChange(index, "qtyPerUnit", Number(e.target.value))} placeholder="Qty" className="w-24 rounded-lg px-3 py-2.5 text-sm" style={{ background: T.lineSoft, border: `1px solid ${T.line}` }} />
                      <button type="button" onClick={() => handleRemoveBomItem(index)} className="text-red-500">×</button>
                    </div>
                  ))}
                  <button type="button" onClick={handleSaveBom} disabled={bomItems.length === 0} className="w-full py-3 rounded-lg mt-2" style={{ background: T.teal, color: T.ink }}>Save BOM</button>
                </div>
              ) : bom && (
                <div className="mb-6 p-4 rounded-xl" style={{ background: T.tealDim, border: `1px solid ${T.teal}` }}>
                  <p className="text-sm mb-3" style={{ color: T.textPrimary }}>Bill of Materials (per unit)</p>
                  {requiredMaterials.map((req, i) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span>{req.materialName}</span>
                      <span style={{ color: req.insufficient ? T.amber : T.textMuted }}>
                        {req.requiredQty} {materials.find(m => m.id === req.rawMaterialId)?.unit}
                        {req.insufficient && " ⚠️"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="mb-6">
            <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: T.textMuted }}>Quantity to Produce</label>
            <input type="number" min="1" value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value)))} className="w-full rounded-lg px-4 py-3 text-lg" style={{ background: T.lineSoft, border: `1px solid ${T.line}`, color: T.textPrimary, fontFamily: "'JetBrains Mono', monospace" }} required />
          </div>

          {hasInsufficient && (
            <div className="flex items-center gap-2 p-3 mb-6 rounded-xl" style={{ background: T.amberDim, color: T.amber }}>
              <AlertTriangle size={18} /> Some raw materials have insufficient stock. Production will still be recorded.
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg" style={{ background: T.lineSoft, color: T.textMuted }}>Cancel</button>
            <button type="submit" disabled={saving || !selectedProductId || qty <= 0} className="flex-1 py-3 rounded-lg font-medium" style={{ background: T.teal, color: T.ink }}>
              {saving ? "Recording..." : "Record Production"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}