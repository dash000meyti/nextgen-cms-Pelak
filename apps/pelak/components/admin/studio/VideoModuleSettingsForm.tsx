"use client";

import type { VideoModuleSettings } from "@nextgen-cms/contract/types/modules";
import { saveVideoModuleSettings } from "@nextgen-cms/studio/cms/mutations/settings";
import { SectionListSettingsFields } from "@/components/admin/studio/SectionListSettingsFields";
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
      <SectionListSettingsFields
        idPrefix="video"
        value={settings}
        onChange={setValue}
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
