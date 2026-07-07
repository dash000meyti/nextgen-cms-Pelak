"use client";

import type { MediaUploadContext } from "@nextgen-cms/contract/types/media";
import { uploadMedia } from "@nextgen-cms/studio/cms/mutations/media";
import { useRef, useState } from "react";
import { TextField } from "@/components/admin/fields/TextField";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";

type PdfFieldProps = {
  id: string;
  label: string;
  src: string;
  onSrcChange: (value: string) => void;
  uploadContext?: MediaUploadContext;
  maxBytes?: number;
};

export function PdfField({
  id,
  label,
  src,
  onSrcChange,
  uploadContext,
  maxBytes,
}: PdfFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError(null);
    if (maxBytes != null && file.size > maxBytes) {
      setUploading(false);
      setUploadError(
        `حداکثر حجم فایل ${Math.round(maxBytes / (1024 * 1024))} مگابایت است.`,
      );
      return;
    }
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadMedia(formData, uploadContext);
      if (!result.ok) {
        setUploadError(result.error);
        return;
      }
      if (result.url) onSrcChange(result.url);
    } catch {
      setUploadError("خطا در آپلود — دوباره تلاش کنید.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4 rounded border border-rule bg-surface-2 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-ink">{label}</h3>
        <div className="flex gap-2">
          {uploadContext ? (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="rounded border border-rule px-3 py-1.5 text-xs text-ink hover:bg-surface"
            >
              انتخاب از مدیا
            </button>
          ) : null}
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUpload(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded border border-rule px-3 py-1.5 text-xs text-ink hover:bg-surface disabled:opacity-50"
          >
            {uploading ? "در حال آپلود…" : "آپلود PDF"}
          </button>
        </div>
      </div>

      {uploadContext ? (
        <MediaPickerModal
          open={pickerOpen}
          uploadContext={uploadContext}
          onSelect={onSrcChange}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}

      {uploadError ? (
        <p className="text-xs text-accent" role="alert">
          {uploadError}
        </p>
      ) : null}

      <TextField
        id={`${id}-src`}
        label="آدرس PDF"
        value={src}
        onChange={onSrcChange}
        hint="در صورت خالی بودن، دکمه دانلود PDF نمایش داده نمی‌شود."
      />
    </div>
  );
}
