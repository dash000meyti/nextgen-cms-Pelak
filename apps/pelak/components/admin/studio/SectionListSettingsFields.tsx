"use client";

import type { SectionListSettings } from "@nextgen-cms/contract/types/modules";
import { useEffect, useState } from "react";
import { TextField } from "@/components/admin/fields/TextField";

type SectionListSettingsFieldsProps = {
  idPrefix: string;
  value: SectionListSettings;
  onChange: (value: SectionListSettings) => void;
  itemsPerPageDisabled?: boolean;
  itemsPerPageHint?: string;
};

function parseItemsPerPage(raw: string, fallback: number): number {
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function ItemsPerPageField({
  id,
  value,
  onChange,
  disabled,
  hint,
}: {
  id: string;
  value: number;
  onChange: (itemsPerPage: number) => void;
  disabled?: boolean;
  hint?: string;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  return (
    <TextField
      id={id}
      label="تعداد در صفحه"
      type="number"
      min={1}
      value={draft}
      disabled={disabled}
      hint={hint}
      onChange={(raw) => {
        setDraft(raw);
        const parsed = Number.parseInt(raw, 10);
        if (Number.isFinite(parsed) && parsed > 0) {
          onChange(parsed);
        }
      }}
      onBlur={() => {
        const next = parseItemsPerPage(draft, value);
        setDraft(String(next));
        if (next !== value) {
          onChange(next);
        }
      }}
    />
  );
}

export function SectionListSettingsFields({
  idPrefix,
  value,
  onChange,
  itemsPerPageDisabled,
  itemsPerPageHint,
}: SectionListSettingsFieldsProps) {
  return (
    <>
      <TextField
        id={`${idPrefix}-page-title`}
        label="عنوان صفحه"
        value={value.pageTitle}
        onChange={(pageTitle) => onChange({ ...value, pageTitle })}
      />
      <ItemsPerPageField
        id={`${idPrefix}-items-per-page`}
        value={value.itemsPerPage}
        disabled={itemsPerPageDisabled}
        hint={itemsPerPageHint}
        onChange={(itemsPerPage) => onChange({ ...value, itemsPerPage })}
      />
      <label className="flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={value.showInMenu}
          onChange={(e) => onChange({ ...value, showInMenu: e.target.checked })}
          className="accent-accent"
        />
        <span>نمایش در منو</span>
      </label>
    </>
  );
}
