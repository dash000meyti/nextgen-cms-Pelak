"use client";

import { normalizeMemberSettings } from "@nextgen-cms/config/theme/defaults";
import type { MemberSettings } from "@nextgen-cms/contract/types/modules";
import type { RoleRow } from "@nextgen-cms/core/db/schema/roles";
import { saveMemberSettings } from "@nextgen-cms/studio/cms/mutations/settings";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FormMessage } from "@/components/admin/studio/FormMessage";
import { SectionListSettingsFields } from "@/components/admin/studio/SectionListSettingsFields";

type MemberSettingsFormProps = {
  value: MemberSettings;
  roles: RoleRow[];
};

export function MemberSettingsForm({ value, roles }: MemberSettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState(value);

  function save() {
    setError(null);
    setSuccess(null);
    const normalized = normalizeMemberSettings(settings);
    startTransition(async () => {
      try {
        await saveMemberSettings(normalized);
        setSettings(normalized);
        setSuccess("ذخیره شد.");
        router.refresh();
      } catch {
        setError("خطا در ذخیرهٔ تنظیمات.");
      }
    });
  }

  return (
    <div className="max-w-lg space-y-6">
      <FormMessage error={error} success={success} />
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-ink">نقش پیش‌فرض عضو جدید</span>
        <select
          value={settings.defaultRoleId}
          onChange={(e) =>
            setSettings({
              ...settings,
              defaultRoleId: Number.parseInt(e.target.value, 10),
            })
          }
          className="w-full rounded border border-rule bg-paper px-3 py-2 text-ink"
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-ink">نام معرفی عضو</span>
        <input
          type="text"
          value={settings.memberLabel}
          onChange={(e) =>
            setSettings({ ...settings, memberLabel: e.target.value })
          }
          className="w-full rounded border border-rule bg-paper px-3 py-2 text-ink"
        />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-ink">نام معرفی اعضا</span>
        <input
          type="text"
          value={settings.membersLabel}
          onChange={(e) =>
            setSettings({ ...settings, membersLabel: e.target.value })
          }
          className="w-full rounded border border-rule bg-paper px-3 py-2 text-ink"
        />
      </label>
      <SectionListSettingsFields
        idPrefix="members"
        value={settings}
        onChange={(list) => setSettings({ ...settings, ...list })}
      />
      <button
        type="button"
        onClick={save}
        disabled={pending}
        className="rounded bg-accent px-6 py-2 text-sm text-paper hover:bg-accent-hover disabled:opacity-50"
      >
        {pending ? "در حال ذخیره…" : "ذخیره"}
      </button>
    </div>
  );
}
