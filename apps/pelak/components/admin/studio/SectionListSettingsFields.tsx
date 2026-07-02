import type { SectionListSettings } from "@nextgen-cms/contract/types/modules";
import { TextField } from "@/components/admin/fields/TextField";

type SectionListSettingsFieldsProps = {
  idPrefix: string;
  value: SectionListSettings;
  onChange: (value: SectionListSettings) => void;
};

export function SectionListSettingsFields({
  idPrefix,
  value,
  onChange,
}: SectionListSettingsFieldsProps) {
  return (
    <>
      <TextField
        id={`${idPrefix}-page-title`}
        label="عنوان صفحه"
        value={value.pageTitle}
        onChange={(pageTitle) => onChange({ ...value, pageTitle })}
      />
      <TextField
        id={`${idPrefix}-items-per-page`}
        label="تعداد در صفحه"
        type="number"
        value={String(value.itemsPerPage)}
        onChange={(raw) =>
          onChange({
            ...value,
            itemsPerPage: Number.parseInt(raw, 10) || 12,
          })
        }
      />
      <label className="flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={value.showInMenu}
          onChange={(e) =>
            onChange({ ...value, showInMenu: e.target.checked })
          }
          className="accent-accent"
        />
        <span>نمایش در منو</span>
      </label>
    </>
  );
}
