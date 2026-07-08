"use client";

import type { ContentGroupModuleSettings } from "@nextgen-cms/contract/types/modules";
import { saveContentGroupModuleSettings } from "@nextgen-cms/studio/cms/mutations/settings";
import { SectionListSettingsFields } from "@/components/admin/studio/SectionListSettingsFields";
import { SettingsSaveBar } from "@/components/admin/studio/SettingsSaveBar";
import { useSingletonSettingsForm } from "@/components/admin/studio/useSingletonSettingsForm";

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
      <SettingsSaveBar
        pending={pending}
        error={error}
        success={success}
        onSave={submit}
      />
    </div>
  );
}
