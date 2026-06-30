import { Pencil, Trash2 } from "lucide-react";
import { T } from "../../theme";

interface Column<T> {
  key: keyof T;
  label: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export default function DataTable<T extends { id: string }>({
  data,
  columns,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ color: T.textMuted, borderBottom: `1px solid ${T.line}` }}>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="text-left font-medium px-5 py-3 text-xs uppercase tracking-wider"
                style={{ letterSpacing: "0.06em" }}
              >
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th
                className="text-right font-medium px-5 py-3 text-xs uppercase tracking-wider"
                style={{ letterSpacing: "0.06em" }}
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="row-hover" style={{ borderTop: `1px solid ${T.lineSoft}` }}>
              {columns.map((col) => (
                <td key={String(col.key)} className="px-5 py-3" style={{ color: T.textPrimary }}>
                  {String(row[col.key] ?? "—")}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="flex items-center justify-center rounded-lg transition-colors"
                        style={{ width: 28, height: 28, color: T.textMuted }}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="flex items-center justify-center rounded-lg transition-colors"
                        style={{ width: 28, height: 28, color: T.red }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}