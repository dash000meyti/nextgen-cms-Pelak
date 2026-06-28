"use client";

import type { ThemePalette } from "@nextgen-cms/contract/types/theme";
import { TextField } from "@/components/admin/fields/TextField";

const PALETTE_KEYS: (keyof ThemePalette)[] = [
  "paper",
  "surface",
  "surface2",
  "ink",
  "inkMuted",
  "inkFaint",
  "accent",
  "accentHover",
  "accentSoft",
  "rule",
  "ruleStrong",
  "contentMax",
  "wideMax",
  "radius",
];

const PALETTE_LABELS: Record<keyof ThemePalette, string> = {
  paper: "پس‌زمینه",
  surface: "سطح",
  surface2: "سطح ۲",
  ink: "متن",
  inkMuted: "متن کم‌رنگ",
  inkFaint: "متن خیلی کم‌رنگ",
  accent: "رنگ اصلی",
  accentHover: "هاور",
  accentSoft: "رنگ نرم",
  rule: "خط",
  ruleStrong: "خط پررنگ",
  contentMax: "عرض محتوا",
  wideMax: "عرض گسترده",
  radius: "شعاع گوشه",
};

type ThemePaletteEditorProps = {
  label: string;
  value: ThemePalette;
  onChange: (value: ThemePalette) => void;
};

export function ThemePaletteEditor({
  label,
  value,
  onChange,
}: ThemePaletteEditorProps) {
  return (
    <fieldset className="space-y-4 rounded border border-rule bg-surface-2 p-4">
      <legend className="px-1 text-sm font-medium text-ink">{label}</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        {PALETTE_KEYS.map((key) => (
          <div key={key} className="flex items-end gap-2">
            <div className="flex-1">
              <TextField
                id={`palette-${label}-${key}`}
                label={PALETTE_LABELS[key]}
                value={value[key]}
                onChange={(next) => onChange({ ...value, [key]: next })}
              />
            </div>
            <div
              className="mb-2 h-9 w-9 shrink-0 rounded border border-rule"
              style={{ backgroundColor: value[key] }}
              aria-hidden
            />
          </div>
        ))}
      </div>
    </fieldset>
  );
}
