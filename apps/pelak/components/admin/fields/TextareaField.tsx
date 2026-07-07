type TextareaFieldProps = {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
};

export function TextareaField({
  id,
  label,
  value,
  onChange,
  rows = 4,
  required,
  hint,
  placeholder,
  ariaLabel,
  disabled,
}: TextareaFieldProps) {
  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
          {required ? <span className="text-accent"> *</span> : null}
        </label>
      ) : null}
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel ?? label ?? placeholder}
        className="w-full rounded border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent disabled:opacity-60"
      />
      {hint ? <p className="text-xs text-ink-faint">{hint}</p> : null}
    </div>
  );
}
