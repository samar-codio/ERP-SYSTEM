import { T } from "../../theme";

interface TextFieldProps {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}

export function TextField({ name, label, defaultValue, required, placeholder }: TextFieldProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
        style={{ color: T.textMuted, letterSpacing: "0.06em" }}
      >
        {label}
        {required && <span style={{ color: T.amber }}> *</span>}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors field-input"
        style={{
          background: T.lineSoft,
          border: `1px solid ${T.line}`,
          color: T.textPrimary,
        }}
      />
    </div>
  );
}