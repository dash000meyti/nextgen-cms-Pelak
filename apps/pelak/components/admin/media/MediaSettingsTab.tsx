import {
  ALLOWED_MIME_LABELS,
  MAX_UPLOAD_BYTES,
} from "@nextgen-cms/core/media/constants";

function formatMaxSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toLocaleString("fa-IR")} مگابایت`;
}

export function MediaSettingsTab() {
  return (
    <div className="max-w-xl space-y-6 rounded border border-rule bg-surface p-6">
      <div>
        <h2 className="font-heading text-lg text-ink">تنظیمات مدیا</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          این بخش در نسخه‌های بعدی از تنظیمات سایت خوانده می‌شود. فعلاً مقادیر زیر
          ثابت هستند.
        </p>
      </div>

      <dl className="space-y-4 text-sm">
        <div className="flex flex-wrap justify-between gap-2 border-b border-rule pb-3">
          <dt className="text-ink-muted">حداکثر حجم آپلود</dt>
          <dd className="font-medium text-ink">
            {formatMaxSize(MAX_UPLOAD_BYTES)}
          </dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2 border-b border-rule pb-3">
          <dt className="text-ink-muted">فرمت‌های مجاز</dt>
          <dd className="font-medium text-ink">{ALLOWED_MIME_LABELS}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <dt className="text-ink-muted">پردازش تصویر</dt>
          <dd className="font-medium text-ink">غیرفعال (placeholder)</dd>
        </div>
      </dl>
    </div>
  );
}
