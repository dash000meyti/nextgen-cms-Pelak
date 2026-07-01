"use client";

import { getModuleAdminLabelPlaceholder } from "@nextgen-cms/contract/modules/labels";
import type { ModuleId } from "@nextgen-cms/contract/permissions";
import type { ModuleSettings } from "@nextgen-cms/contract/types/modules";
import { saveModuleSettings } from "@nextgen-cms/studio/cms/mutations/settings";
import { TextField } from "@/components/admin/fields/TextField";
import { SettingsSaveBar } from "@/components/admin/studio/SettingsSaveBar";
import { useSingletonSettingsForm } from "@/components/admin/studio/useSingletonSettingsForm";

type ModuleSettingsEditorProps = {
  value: ModuleSettings;
};

const MODULE_IDS: ModuleId[] = ["contentGroup", "video", "newsletter"];

export function ModuleSettingsEditor({ value }: ModuleSettingsEditorProps) {
  const {
    value: modules,
    setValue,
    pending,
    error,
    success,
    submit,
  } = useSingletonSettingsForm({
    initialValue: value,
    save: saveModuleSettings,
  });

  return (
    <div className="max-w-lg space-y-6">
      {MODULE_IDS.map((moduleId) => (
        <section
          key={moduleId}
          className="space-y-3 rounded border border-rule p-4"
        >
          <label className="flex items-center gap-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={modules[moduleId].enabled}
              onChange={(e) =>
                setValue({
                  ...modules,
                  [moduleId]: {
                    ...modules[moduleId],
                    enabled: e.target.checked,
                  },
                })
              }
              className="accent-accent"
            />
            <span className="font-medium">
              {getModuleAdminLabelPlaceholder(moduleId)}
            </span>
          </label>
          {modules[moduleId].enabled ? (
            <TextField
              id={`${moduleId}-label`}
              label="نام نمایشی در منو"
              placeholder={getModuleAdminLabelPlaceholder(moduleId)}
              value={modules[moduleId].label}
              onChange={(label) =>
                setValue({
                  ...modules,
                  [moduleId]: { ...modules[moduleId], label },
                })
              }
            />
          ) : null}
        </section>
      ))}

      <SettingsSaveBar
        pending={pending}
        error={error}
        success={success}
        onSave={submit}
      />
    </div>
  );
}
