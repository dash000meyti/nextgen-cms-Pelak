"use client";

import type { VideoModuleSettings } from "@nextgen-cms/contract/types/modules";
import { saveVideoModuleSettings } from "@nextgen-cms/studio/cms/mutations/settings";
import { TextField } from "@/components/admin/fields/TextField";
import { SettingsSaveBar } from "@/components/admin/studio/SettingsSaveBar";
import { useSingletonSettingsForm } from "@/components/admin/studio/useSingletonSettingsForm";

type VideoModuleSettingsFormProps = {
  value: VideoModuleSettings;
};

export function VideoModuleSettingsForm({
  value,
}: VideoModuleSettingsFormProps) {
  const {
    value: settings,
    setValue,
    pending,
    error,
    success,
    submit,
  } = useSingletonSettingsForm({
    initialValue: value,
    save: saveVideoModuleSettings,
  });

  return (
    <div className="max-w-lg space-y-6">
      <TextField
        id="video-title"
        label="عنوان صفحه"
        value={settings.pageTitle}
        onChange={(pageTitle) => setValue({ ...settings, pageTitle })}
      />
      <TextField
        id="video-per-page"
        label="تعداد در صفحه"
        type="number"
        value={String(settings.itemsPerPage)}
        onChange={(raw) =>
          setValue({
            ...settings,
            itemsPerPage: Number.parseInt(raw, 10) || 12,
          })
        }
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
