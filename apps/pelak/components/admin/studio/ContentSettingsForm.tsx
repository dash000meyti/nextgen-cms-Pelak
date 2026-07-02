"use client";

import type { ContentSettings } from "@nextgen-cms/contract/types/modules";
import { saveContentSettings } from "@nextgen-cms/studio/cms/mutations/settings";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { TextField } from "@/components/admin/fields/TextField";
import { FormMessage } from "@/components/admin/studio/FormMessage";
import { SectionListSettingsFields } from "@/components/admin/studio/SectionListSettingsFields";

type ContentSettingsFormProps = {
  value: ContentSettings;
};

export function ContentSettingsForm({ value }: ContentSettingsFormProps) {
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
        await saveContentSettings(settings);
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
      <label className="flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={settings.slugAutoGenerate}
          onChange={(e) =>
            setSettings({ ...settings, slugAutoGenerate: e.target.checked })
          }
          className="accent-accent"
        />
        <span>تولید خودکار slug از عنوان</span>
      </label>
      <TextField
        id="homepage-count"
        label="تعداد مقالات صفحهٔ اصلی"
        type="number"
        value={String(settings.homepageArticleCount)}
        onChange={(raw) =>
          setSettings({
            ...settings,
            homepageArticleCount: Number.parseInt(raw, 10) || 6,
          })
        }
      />
      <label className="flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={settings.showAuthorOnCards}
          onChange={(e) =>
            setSettings({ ...settings, showAuthorOnCards: e.target.checked })
          }
          className="accent-accent"
        />
        <span>نمایش نویسنده در کارت مقالات</span>
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
