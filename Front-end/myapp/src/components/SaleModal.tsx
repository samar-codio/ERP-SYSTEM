import { useMemo, useState } from "react";
import { T } from "../theme";
import type { Brand } from "../models/Brand";
import type { Product } from "../models/Product";
import type { PaymentMethod } from "../models/Sale";

interface SaleModalProps {
  brands: Brand[];
  products: Product[];
  onClose: () => void;
  onSave: (input: {
    customer: string;
    brandId: string;
    brandName: string;
    productId: string;
    productName: string;
    qty: number;
    unitPrice: number;
    payment: PaymentMethod;
  }) => void;
  saving?: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "Credit", "Bank Transfer"];

export default function SaleModal({ brands, products, onClose, onSave, saving }: SaleModalProps) {
  const [customer, setCustomer] = useState("");
  const [brandId, setBrandId] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [payment, setPayment] = useState<PaymentMethod>("Cash");

  const brandProducts = useMemo(
    () => products.filter((p) => String(p.brandId) === String(brandId)),
    [products, brandId]
  );

  const amount = qty * unitPrice;
  const canSubmit = customer.trim() && brandId && productId && qty > 0 && unitPrice > 0;

  const handleBrandChange = (id: string) => {
    setBrandId(id);
    setProductId("");
    setUnitPrice(0);
  };

  const handleProductChange = (id: string) => {
    setProductId(id);
    const product = brandProducts.find((p) => p.id === id);
    if (product) setUnitPrice(product.unitPrice);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const brand = brands.find((b) => b.id === brandId)!;
    const product = brandProducts.find((p) => p.id === productId)!;
    onSave({
      customer: customer.trim(),
      brandId,
      brandName: brand.name,
      productId,
      productName: product.name,
      qty,
      unitPrice,
      payment,
    });
  };

  const labelStyle: React.CSSProperties = {
    color: T.textMuted,
    letterSpacing: "0.06em",
  };
  const inputStyle: React.CSSProperties = {
    background: T.lineSoft,
    border: `1px solid ${T.line}`,
    color: T.textPrimary,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(7,12,22,0.72)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto raes-scroll"
        style={{ background: T.surface, border: `1px solid ${T.line}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="text-base font-semibold mb-5"
          style={{ color: T.textPrimary, fontFamily: "'Space Grotesk', sans-serif" }}
        >
          New Sale
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>
              Customer
            </label>
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Customer or business name"
              required
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>
                Brand
              </label>
              <select
                value={brandId}
                onChange={(e) => handleBrandChange(e.target.value)}
                required
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
              >
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>
                Product
              </label>
              <select
                value={productId}
                onChange={(e) => handleProductChange(e.target.value)}
                required
                disabled={!brandId}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none disabled:opacity-50"
                style={inputStyle}
              >
                <option value="">{brandId ? "Select product" : "Pick a brand first"}</option>
                {brandProducts.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>
                Quantity
              </label>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                required
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>
                Unit Price
              </label>
              <input
                type="number"
                min={0}
                value={unitPrice}
                onChange={(e) => setUnitPrice(Math.max(0, Number(e.target.value)))}
                required
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>
              Payment Method
            </label>
            <div className="flex gap-2">
              {PAYMENT_METHODS.map((m) => {
                const active = payment === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPayment(m)}
                    className="flex-1 text-xs font-medium px-2.5 py-2 rounded-lg transition-colors"
                    style={{
                      color: active ? T.ink : T.textMuted,
                      background: active ? T.teal : T.lineSoft,
                      border: `1px solid ${active ? T.teal : T.line}`,
                    }}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="flex items-center justify-between rounded-xl px-4 py-3 mb-5"
            style={{ background: T.tealDim, border: "1px solid rgba(43,217,194,0.25)" }}
          >
            <span className="text-xs font-medium" style={{ color: T.textMuted }}>Total Amount</span>
            <span
              className="text-lg font-semibold"
              style={{ color: T.teal, fontFamily: "'JetBrains Mono', monospace" }}
            >
              Rs {amount.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium px-4 py-2 rounded-lg"
              style={{ color: T.textMuted, background: T.lineSoft, border: `1px solid ${T.line}` }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || saving}
              className="text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
              style={{ color: T.ink, background: T.teal }}
            >
              {saving ? "Saving…" : "Record Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}