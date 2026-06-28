"use client";

import { slugifyTitle } from "@nextgen-cms/studio/cms/validation";
import { useEffect, useRef } from "react";

type SlugFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  sourceTitle?: string;
  required?: boolean;
};

export function SlugField({
  id,
  label,
  value,
  onChange,
  sourceTitle,
  required,
}: SlugFieldProps) {
  const touched = useRef(false);

  useEffect(() => {
    if (touched.current || !sourceTitle) return;
    const generated = slugifyTitle(sourceTitle);
    if (generated) onChange(generated);
  }, [sourceTitle, onChange]);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </label>
      <input
        id={id}
        type="text"
        dir="ltr"
        value={value}
        onChange={(e) => {
          touched.current = true;
          onChange(e.target.value);
        }}
        required={required}
        className="w-full rounded border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
      <p className="text-xs text-ink-faint">
        فقط حروف کوچک لاتین، اعداد و خط تیره
      </p>
    </div>
  );
}
