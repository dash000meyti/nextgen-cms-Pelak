"use client";

import {
  normalizeSlugInput,
  slugifyTitle,
} from "@nextgen-cms/studio/cms/validation";
import { useEffect, useRef, useState } from "react";
import { FloatLabel } from "@/components/admin/fields/FloatLabel";

type SlugFieldProps = {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  sourceTitle?: string;
  required?: boolean;
  placeholder?: string;
  floatingLabel?: string;
  /** Anchor for form feedback scroll (`data-field`). Defaults to `id`. */
  fieldKey?: string;
};

export function SlugField({
  id,
  label,
  value,
  onChange,
  sourceTitle,
  required,
  placeholder,
  floatingLabel,
  fieldKey,
}: SlugFieldProps) {
  const touched = useRef(false);
  const [focused, setFocused] = useState(false);
  const useFloat = Boolean(floatingLabel) && !label;
  const floated = useFloat && (focused || value.trim().length > 0);

  useEffect(() => {
    if (touched.current || !sourceTitle) return;
    const generated = slugifyTitle(sourceTitle);
    if (generated) onChange(generated);
  }, [sourceTitle, onChange]);

  const input = (
    <input
      id={id}
      type="text"
      dir="auto"
      value={value}
      onChange={(e) => {
        touched.current = true;
        onChange(normalizeSlugInput(e.target.value));
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      required={required}
      placeholder={useFloat ? undefined : placeholder}
      aria-label={label ?? floatingLabel ?? placeholder ?? "نامک"}
      className="w-full rounded border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
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
    </div>
  );
}
