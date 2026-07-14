"use client";

import { normalizeContentSettings } from "@nextgen-cms/config/theme/defaults";
import type { ContentSettings } from "@nextgen-cms/contract/types/modules";
import { saveContentSettings } from "@nextgen-cms/studio/cms/mutations/settings";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SectionListSettingsFields } from "@/components/admin/studio/SectionListSettingsFields";
import { FormMessage } from "@/components/ui/FormMessage";
import { useFormFeedback } from "@/components/ui/useFormFeedback";

type ContentSettingsFormProps = {
  value: ContentSettings;
};

export function ContentSettingsForm({ value }: ContentSettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const feedback = useFormFeedback();
  const [settings, setSettings] = useState(value);

  function save() {
    feedback.clear();
    const normalized = normalizeContentSettings(settings);
    startTransition(async () => {
      try {
        const result = await saveContentSettings(normalized);
        if (result && "ok" in result && !result.ok) {
          feedback.reportError("دسترسی مجاز نیست.");
          return;
        }
        setSettings(normalized);
        feedback.reportSuccess("ذخیره شد.");
        router.refresh();
      } catch {
        feedback.reportError("خطا در ذخیرهٔ تنظیمات.");
      }
    });
  }

  return (
    <div className="max-w-lg space-y-6">
      <FormMessage
        error={feedback.error}
        success={feedback.success}
        info={feedback.info}
        onDismiss={feedback.clear}
      />
      <SectionListSettingsFields
        idPrefix="content"
        value={settings}
        onChange={(list) => setSettings({ ...settings, ...list })}
      />
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-ink">وضعیت پیش‌فرض مقاله</span>
        <select
          value={settings.defaultArticleStatus}
          onChange={(e) =>
            setSettings({
              ...settings,
              defaultArticleStatus: e.target
                .value as ContentSettings["defaultArticleStatus"],
            })
          }
          className="w-full rounded border border-rule bg-paper px-3 py-2 text-ink"
        >
          <option value="draft">پیش‌نویس</option>
          <option value="published">منتشرشده</option>
        </select>
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
