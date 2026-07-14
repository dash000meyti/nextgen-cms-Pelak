"use client";

import { useState } from "react";
import { FloatLabel } from "@/components/admin/fields/FloatLabel";

type TextFieldProps = {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  /** When set (and no external `label`), uses an outlined floating label. */
  floatingLabel?: string;
  ariaLabel?: string;
  type?: string;
  min?: number;
  disabled?: boolean;
  /** Anchor for form feedback scroll (`data-field`). Defaults to `id`. */
  fieldKey?: string;
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
  floatingLabel,
  ariaLabel,
  type = "text",
  min,
  disabled,
  fieldKey,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const useFloat = Boolean(floatingLabel) && !label;
  const floated = useFloat && (focused || value.trim().length > 0);

  const input = (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        onBlur?.();
      }}
      required={required}
      min={min}
      disabled={disabled}
      placeholder={useFloat ? undefined : placeholder}
      aria-label={ariaLabel ?? label ?? floatingLabel ?? placeholder}
      className="w-full rounded border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent disabled:opacity-60"
    />
  );

  return (
    <div className="space-y-1.5" data-field={fieldKey ?? id}>
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
          {required ? <span className="text-accent"> *</span> : null}
        </label>
      ) : null}
      {useFloat ? (
        <div className="relative">
          <FloatLabel
            htmlFor={id}
            text={floatingLabel as string}
            floated={floated}
            required={required}
          />
          {input}
        </div>
      ) : (
        input
      )}
      {hint ? <p className="text-xs text-ink-faint">{hint}</p> : null}
    </div>
  );
}
