"use client";

import { CONTENT_GROUP_PERIOD_LABELS } from "@nextgen-cms/contract/cms-schema/content-group";
import type {
  ContentGroupModuleSettings,
  ContentGroupPeriod,
} from "@nextgen-cms/contract/types/modules";
import { saveContentGroupModuleSettings } from "@nextgen-cms/studio/cms/mutations/settings";
import { SettingsSaveBar } from "@/components/admin/studio/SettingsSaveBar";
import { useSingletonSettingsForm } from "@/components/admin/studio/useSingletonSettingsForm";

const PERIOD_OPTIONS: ContentGroupPeriod[] = [
  "yearly",
  "seasonal",
  "monthly",
  "weekly",
];

type ContentGroupModuleSettingsFormProps = {
  value: ContentGroupModuleSettings;
};

export function ContentGroupModuleSettingsForm({
  value,
}: ContentGroupModuleSettingsFormProps) {
  const {
    value: settings,
    setValue,
    pending,
    error,
    success,
    submit,
  } = useSingletonSettingsForm({
    initialValue: value,
    save: saveContentGroupModuleSettings,
  });

  return (
    <div className="max-w-lg space-y-6">
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-ink">دوره انتشار</span>
        <select
          value={settings.period}
          onChange={(e) =>
            setValue({
              ...settings,
              period: e.target.value as ContentGroupPeriod,
            })
          }
          className="w-full rounded border border-rule bg-paper px-3 py-2 text-ink"
        >
          {PERIOD_OPTIONS.map((period) => (
            <option key={period} value={period}>
              {CONTENT_GROUP_PERIOD_LABELS[period]}
            </option>
          ))}
        </select>
      </label>
      <SettingsSaveBar
        pending={pending}
        error={error}
        success={success}
        onSave={submit}
      />
    </div>
  );
}
