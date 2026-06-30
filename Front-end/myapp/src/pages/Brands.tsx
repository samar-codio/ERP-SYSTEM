import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import DataTable from "../components/table/DataTable";
import LoadingState from "../components/state/LoadingState";
import ErrorState from "../components/state/ErrorState";
import EmptyState from "../components/state/EmptyState";
import { TextField } from "../components/forms/TextField";
import Modal from "../components/Modal";
import type { Brand } from "../models/Brand";
import { getBrands, createBrand, updateBrand, deleteBrand } from "../data/brandApi";

export default function Brands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);

  useEffect(() => {
    getBrands()
      .then(setBrands)
      .catch(() => setError("Failed to load brands"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (brand: Brand) => {
    if (editing) {
      const updated = await updateBrand(brand);
      setBrands(brands.map(b => (b.id === updated.id ? updated : b)));
    } else {
      const created = await createBrand(brand);
      setBrands([...brands, created]);
    }
    setShowModal(false);
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    await deleteBrand(id);
    setBrands(brands.filter(b => b.id !== id));
  };

  if (loading) return <LoadingState label="Loading brands..." />;
  if (error) return <ErrorState label={error} />;
  if (!brands.length) return <EmptyState label="No brands found" icon={Users} />;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Users /> Brands
        </h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
        >
          New Brand
        </button>
      </div>

      <DataTable
        data={brands}
        columns={[
          { key: "name", label: "Name" },
          { key: "contact", label: "Contact" },
          { key: "notes", label: "Notes" },
        ]}
        onEdit={(row) => {
          setEditing(row);
          setShowModal(true);
        }}
        onDelete={(row) => handleDelete(row.id)}
      />

      {showModal && (
        <Modal
          title={editing ? "Edit Brand" : "New Brand"}
          onClose={() => setShowModal(false)}
          onSave={(formData) => handleSave(formData as Brand)}
        >
          <TextField name="name" label="Name" defaultValue={editing?.name} />
          <TextField name="contact" label="Contact" defaultValue={editing?.contact} />
          <TextField name="notes" label="Notes" defaultValue={editing?.notes} />
        </Modal>
      )}
    </div>
  );
}
