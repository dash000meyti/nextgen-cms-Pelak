"use client";

import type { MemberSettings } from "@nextgen-cms/contract/types/modules";
import type { RoleRow } from "@nextgen-cms/core/db/schema/roles";
import { saveMemberSettings } from "@nextgen-cms/studio/cms/mutations/settings";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FormMessage } from "@/components/admin/studio/FormMessage";

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
    startTransition(async () => {
      try {
        await saveMemberSettings(settings);
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
      <label className="flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={settings.allowRegistration}
          onChange={(e) =>
            setSettings({ ...settings, allowRegistration: e.target.checked })
          }
          className="accent-accent"
        />
        <span>ثبت‌نام عمومی از صفحهٔ ورود</span>
      </label>
      <label className="flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={settings.requireApproval}
          onChange={(e) =>
            setSettings({ ...settings, requireApproval: e.target.checked })
          }
          className="accent-accent"
        />
        <span>عضو جدید تا تأیید مدیر غیرفعال بماند</span>
      </label>
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
