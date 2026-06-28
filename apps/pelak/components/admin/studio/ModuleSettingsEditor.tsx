"use client";

import { ISSUE_PERIOD_LABELS } from "@nextgen-cms/contract/cms-schema/issue";
import type {
  IssuePeriod,
  ModuleSettings,
} from "@nextgen-cms/contract/types/modules";
import { saveModuleSettings } from "@nextgen-cms/studio/cms/mutations/settings";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { TextField } from "@/components/admin/fields/TextField";
import { FormMessage } from "@/components/admin/studio/FormMessage";

type ModuleSettingsEditorProps = {
  value: ModuleSettings;
};

const PERIOD_OPTIONS: IssuePeriod[] = [
  "yearly",
  "seasonal",
  "monthly",
  "weekly",
];

export function ModuleSettingsEditor({ value }: ModuleSettingsEditorProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modules, setModules] = useState(value);

  function save() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        await saveModuleSettings(modules);
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

      <section className="space-y-3 rounded border border-rule p-4">
        <label className="flex items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={modules.issues.enabled}
            onChange={(e) =>
              setModules({
                ...modules,
                issues: { ...modules.issues, enabled: e.target.checked },
              })
            }
            className="accent-accent"
          />
          <span className="font-medium">شماره‌ها</span>
        </label>
        {modules.issues.enabled ? (
          <label className="block space-y-1.5 text-sm">
            <span className="text-ink-muted">دوره انتشار</span>
            <select
              value={modules.issues.period}
              onChange={(e) =>
                setModules({
                  ...modules,
                  issues: {
                    ...modules.issues,
                    period: e.target.value as IssuePeriod,
                  },
                })
              }
              className="w-full rounded border border-rule bg-paper px-3 py-2 text-ink"
            >
              {PERIOD_OPTIONS.map((period) => (
                <option key={period} value={period}>
                  {ISSUE_PERIOD_LABELS[period]}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </section>

      <section className="space-y-3 rounded border border-rule p-4">
        <label className="flex items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={modules.video.enabled}
            onChange={(e) =>
              setModules({
                ...modules,
                video: { ...modules.video, enabled: e.target.checked },
              })
            }
            className="accent-accent"
          />
          <span className="font-medium">ویدیو</span>
        </label>
        {modules.video.enabled ? (
          <div className="space-y-4">
            <TextField
              id="video-title"
              label="عنوان صفحه"
              value={modules.video.pageTitle}
              onChange={(pageTitle) =>
                setModules({
                  ...modules,
                  video: { ...modules.video, pageTitle },
                })
              }
            />
            <TextField
              id="video-per-page"
              label="تعداد در صفحه"
              type="number"
              value={String(modules.video.itemsPerPage)}
              onChange={(raw) =>
                setModules({
                  ...modules,
                  video: {
                    ...modules.video,
                    itemsPerPage: Number.parseInt(raw, 10) || 12,
                  },
                })
              }
            />
          </div>
        ) : null}
      </section>

      <section className="rounded border border-rule p-4">
        <label className="flex items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={modules.newsletter.enabled}
            onChange={(e) =>
              setModules({
                ...modules,
                newsletter: { enabled: e.target.checked },
              })
            }
            className="accent-accent"
          />
          <span className="font-medium">خبرنامه</span>
        </label>
      </section>

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
