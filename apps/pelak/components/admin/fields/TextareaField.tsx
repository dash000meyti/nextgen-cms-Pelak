"use client";

import { useState } from "react";
import { FloatLabel } from "@/components/admin/fields/FloatLabel";

type TextareaFieldProps = {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  floatingLabel?: string;
  ariaLabel?: string;
  disabled?: boolean;
  /** Anchor for form feedback scroll (`data-field`). Defaults to `id`. */
  fieldKey?: string;
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
  floatingLabel,
  ariaLabel,
  disabled,
  fieldKey,
}: TextareaFieldProps) {
  const [focused, setFocused] = useState(false);
  const useFloat = Boolean(floatingLabel) && !label;
  const floated = useFloat && (focused || value.trim().length > 0);

  const control = (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      rows={rows}
      required={required}
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
            restClassName="top-2.5 translate-y-0"
          />
          {control}
        </div>
      ) : (
        control
      )}
      {hint ? <p className="text-xs text-ink-faint">{hint}</p> : null}
    </div>
  );
}
