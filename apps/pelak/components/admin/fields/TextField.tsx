type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  type?: string;
  min?: number;
  disabled?: boolean;
};

export function TextField({
  id,
  label,
  value,
  onChange,
  onBlur,
  required,
  hint,
  placeholder,
  type = "text",
  min,
  disabled,
}: TextFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        min={min}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent disabled:opacity-60"
      />
      {hint ? <p className="text-xs text-ink-faint">{hint}</p> : null}
    </div>
  );
}
