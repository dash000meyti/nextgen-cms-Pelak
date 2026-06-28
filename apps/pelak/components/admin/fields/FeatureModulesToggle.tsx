"use client";

import type { FeatureModules } from "@nextgen-cms/contract/types/theme";

const MODULE_LABELS: Record<keyof FeatureModules, string> = {
  issues: "شماره‌ها",
  video: "ویدیو",
  newsletter: "خبرنامه",
};

type FeatureModulesToggleProps = {
  value: FeatureModules;
  onChange: (value: FeatureModules) => void;
};

export function FeatureModulesToggle({
  value,
  onChange,
}: FeatureModulesToggleProps) {
  return (
    <div className="space-y-3">
      {(Object.keys(MODULE_LABELS) as (keyof FeatureModules)[]).map((key) => (
        <label
          key={key}
          className="flex cursor-pointer items-center gap-3 rounded border border-rule bg-paper px-4 py-3 text-sm text-ink"
        >
          <input
            type="checkbox"
            checked={value[key]}
            onChange={(e) => onChange({ ...value, [key]: e.target.checked })}
            className="accent-accent"
          />
          <span>{MODULE_LABELS[key]}</span>
        </label>
      ))}
    </div>
  );
}
