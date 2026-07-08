"use client";

import type { MediaSettings } from "@nextgen-cms/contract/types/modules";
import { saveMediaSettings } from "@nextgen-cms/studio/cms/mutations/settings";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { TextField } from "@/components/admin/fields/TextField";
import { FormMessage } from "@/components/admin/studio/FormMessage";

const MIME_OPTIONS = [
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/png", label: "PNG" },
  { value: "image/webp", label: "WebP" },
  { value: "image/svg+xml", label: "SVG" },
  { value: "application/pdf", label: "PDF" },
];

type MediaSettingsFormProps = {
  value: MediaSettings;
};

export function MediaSettingsForm({ value }: MediaSettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState(value);

  function toggleMime(mime: string) {
    const allowed = new Set(settings.allowedMime);
    if (allowed.has(mime)) allowed.delete(mime);
    else allowed.add(mime);
    setSettings({ ...settings, allowedMime: [...allowed] });
  }

  function save() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        await saveMediaSettings(settings);
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
      <TextField
        id="max-image-bytes"
        label="حداکثر حجم تصویر (بایت)"
        type="number"
        value={String(settings.maxImageBytes)}
        onChange={(raw) =>
          setSettings({
            ...settings,
            maxImageBytes: Number.parseInt(raw, 10) || settings.maxImageBytes,
          })
        }
        hint={`معادل ${Math.round(settings.maxImageBytes / (1024 * 1024))} مگابایت`}
      />
      <TextField
        id="max-pdf-bytes"
        label="حداکثر حجم PDF (بایت)"
        type="number"
        value={String(settings.maxPdfBytes)}
        onChange={(raw) =>
          setSettings({
            ...settings,
            maxPdfBytes: Number.parseInt(raw, 10) || settings.maxPdfBytes,
          })
        }
        hint={`معادل ${Math.round(settings.maxPdfBytes / (1024 * 1024))} مگابایت`}
      />
      <div className="space-y-2">
        <p className="text-sm font-medium text-ink">فرمت‌های مجاز</p>
        <div className="space-y-2">
          {MIME_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 text-sm text-ink"
            >
              <input
                type="checkbox"
                checked={settings.allowedMime.includes(option.value)}
                onChange={() => toggleMime(option.value)}
                className="accent-accent"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2 rounded border border-rule p-4">
        <p className="text-sm font-medium text-ink">پردازش تصویر</p>
        <label className="flex items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={settings.pipeline.stripMetadata}
            onChange={(e) =>
              setSettings({
                ...settings,
                pipeline: {
                  ...settings.pipeline,
                  stripMetadata: e.target.checked,
                },
              })
            }
            className="accent-accent"
          />
          <span>حذف متادیتا (EXIF)</span>
        </label>
        <label className="flex items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={settings.pipeline.generateWebp}
            onChange={(e) =>
              setSettings({
                ...settings,
                pipeline: {
                  ...settings.pipeline,
                  generateWebp: e.target.checked,
                },
              })
            }
            className="accent-accent"
          />
          <span>تولید نسخه WebP</span>
        </label>
      </div>
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
