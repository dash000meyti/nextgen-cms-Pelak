"use client";

import { CONTENT_GROUP_PERIOD_LABELS } from "@nextgen-cms/contract/cms-schema/content-group";
import type {
  ContentGroupModuleSettings,
  ContentGroupPeriod,
} from "@nextgen-cms/contract/types/modules";
import { saveContentGroupModuleSettings } from "@nextgen-cms/studio/cms/mutations/settings";
import { SectionListSettingsFields } from "@/components/admin/studio/SectionListSettingsFields";
import { SettingsSaveBar } from "@/components/admin/studio/SettingsSaveBar";
import { TextField } from "@/components/admin/fields/TextField";
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
      <SectionListSettingsFields
        idPrefix="content-group"
        value={settings}
        onChange={(list) => setValue({ ...settings, ...list })}
      />
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
      <label className="flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={settings.groupByYear}
          onChange={(e) =>
            setValue({ ...settings, groupByYear: e.target.checked })
          }
          className="accent-accent"
        />
        <span>تفکیک شدن به سال</span>
      </label>
      <TextField
        id="content-group-max-image-bytes"
        label="حداکثر حجم تصویر جلد (بایت)"
        type="number"
        value={String(settings.maxImageBytes)}
        onChange={(raw) =>
          setValue({
            ...settings,
            maxImageBytes: Number.parseInt(raw, 10) || settings.maxImageBytes,
          })
        }
        hint={`معادل ${Math.round(settings.maxImageBytes / (1024 * 1024))} مگابایت`}
      />
      <TextField
        id="content-group-max-pdf-bytes"
        label="حداکثر حجم PDF (بایت)"
        type="number"
        value={String(settings.maxPdfBytes)}
        onChange={(raw) =>
          setValue({
            ...settings,
            maxPdfBytes: Number.parseInt(raw, 10) || settings.maxPdfBytes,
          })
        }
        hint={`معادل ${Math.round(settings.maxPdfBytes / (1024 * 1024))} مگابایت`}
      />
      <SettingsSaveBar
        pending={pending}
        error={error}
        success={success}
        onSave={submit}
      />
    </div>
  );
}
