"use client";

import type { MediaUploadContext } from "@nextgen-cms/contract/types/media";
import { uploadMedia } from "@nextgen-cms/studio/cms/mutations/media";
import { useRef, useState } from "react";
import { TextField } from "@/components/admin/fields/TextField";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";

type ImageFieldProps = {
  id: string;
  label?: string;
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  onSrcChange: (value: string) => void;
  onAltChange: (value: string) => void;
  onCaptionChange?: (value: string) => void;
  onCreditChange?: (value: string) => void;
  showCaption?: boolean;
  /** Hide the alt text input (e.g. member avatar derives alt from name). */
  hideAlt?: boolean;
  /** Shown in preview when `src` is empty. */
  emptyPreviewSrc?: string;
  required?: boolean;
  uploadContext?: MediaUploadContext;
  maxBytes?: number;
  previewAspectClass?: string;
  /** Two-column layout: preview + upload on the start side, fields on the end side. */
  twoColumn?: boolean;
};

export function ImageField({
  id,
  label,
  src,
  alt,
  caption = "",
  credit = "",
  onSrcChange,
  onAltChange,
  onCaptionChange,
  onCreditChange,
  showCaption = false,
  hideAlt = false,
  emptyPreviewSrc,
  required,
  uploadContext,
  maxBytes,
  previewAspectClass,
  twoColumn = false,
}: ImageFieldProps) {
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

  const uploadButtons = (
    <div className="flex flex-wrap gap-2">
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
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleUpload(file);
        }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="rounded border border-rule px-3 py-1.5 text-xs text-ink hover:bg-surface disabled:opacity-50"
      >
        {uploading ? "در حال آپلود…" : "آپلود"}
      </button>
    </div>
  );

  const previewSrc = src || emptyPreviewSrc || "";

  const preview = (
    <div
      className={`relative w-full overflow-hidden rounded border border-rule bg-paper ${previewAspectClass ?? "aspect-video"}`}
    >
      {previewSrc ? (
        // biome-ignore lint/performance/noImgElement: admin preview of arbitrary upload URLs
        <img
          src={previewSrc}
          alt={alt || label || "پیش‌نمایش تصویر"}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-ink-faint">
          پیش‌نمایش تصویر
        </div>
      )}
    </div>
  );

  const fields = (
    <div className="space-y-3">
      <TextField
        id={`${id}-src`}
        label="آدرس تصویر"
        value={src}
        onChange={onSrcChange}
        required={required}
      />
      {hideAlt ? null : (
        <TextField
          id={`${id}-alt`}
          label="متن جایگزین"
          value={alt}
          onChange={onAltChange}
          required={required}
        />
      )}
      {showCaption && onCaptionChange ? (
        <TextField
          id={`${id}-caption`}
          label="زیرنویس"
          value={caption}
          onChange={onCaptionChange}
        />
      ) : null}
      {showCaption && onCreditChange ? (
        <TextField
          id={`${id}-credit`}
          label="اعتبار"
          value={credit}
          onChange={onCreditChange}
        />
      ) : null}
    </div>
  );

  return (
    <div className="space-y-3 rounded border border-rule bg-surface-2 p-4">
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

      {twoColumn ? (
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
          <div className="space-y-2">
            {preview}
            {uploadButtons}
          </div>
          {fields}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            {label ? (
              <h3 className="text-sm font-medium text-ink">{label}</h3>
            ) : null}
            {uploadButtons}
          </div>
          {previewAspectClass ? preview : null}
          {fields}
          {previewSrc && !previewAspectClass ? (
            // biome-ignore lint/performance/noImgElement: admin preview of arbitrary upload URLs
            <img
              src={previewSrc}
              alt={alt || label || "پیش‌نمایش"}
              className="max-h-40 rounded border border-rule"
            />
          ) : null}
        </>
      )}
    </div>
  );
}
