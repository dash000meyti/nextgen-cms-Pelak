"use client";

import type { MediaUploadContext } from "@nextgen-cms/contract/types/media";
import { uploadMedia } from "@nextgen-cms/studio/cms/mutations/media";
import { useRef, useState } from "react";
import { TextField } from "@/components/admin/fields/TextField";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";
import {
  FIGURE_CAPTION_CLASS,
  FIGURE_CLASS,
} from "@/components/article/blockStyles";

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
  /** Two-column layout: preview on the start side, upload + fields on the end side. */
  twoColumn?: boolean;
  /** Drop outer card chrome (for WYSIWYG block editor). */
  bare?: boolean;
  /** ImageBlock-like overlay chrome on the preview. */
  overlay?: boolean;
  /** Anchor for image src errors (`data-field`). Defaults to `id`. */
  fieldKey?: string;
  /** Anchor for alt text errors (`data-field`). Defaults to `${id}Alt`. */
  altFieldKey?: string;
};

const chromeBtn =
  "shrink-0 rounded border border-rule bg-paper/95 px-2.5 py-1.5 text-xs text-ink shadow-sm hover:bg-surface disabled:opacity-50";

const chromeInput =
  "w-full rounded border border-rule bg-paper/95 px-2.5 py-1.5 text-xs text-ink outline-none placeholder:text-ink-faint focus:border-accent";

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
  bare = false,
  overlay = false,
  fieldKey,
  altFieldKey,
}: ImageFieldProps) {
  const srcField = fieldKey ?? id;
  const altField = altFieldKey ?? `${id}Alt`;
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

  const fileInput = (
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
  );

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
      {fileInput}
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
  const aspectClass = previewAspectClass ?? "aspect-video";

  const picker = uploadContext ? (
    <MediaPickerModal
      open={pickerOpen}
      uploadContext={uploadContext}
      onSelect={onSrcChange}
      onClose={() => setPickerOpen(false)}
    />
  ) : null;

  const errorMessage = uploadError ? (
    <p className="text-xs text-accent" role="alert">
      {uploadError}
    </p>
  ) : null;

  if (overlay) {
    const emptyHint = label ? `پیش‌نمایش ${label}` : "پیش‌نمایش تصویر";
    const srcPlaceholder = label ? `آدرس ${label}` : "آدرس تصویر…";
    const altPlaceholder = label ? `متن جایگزین ${label}` : "متن جایگزین…";

    return (
      <figure
        className={`${FIGURE_CLASS} my-0!`}
        aria-label={label}
        data-field={srcField}
      >
        {picker}
        <div
          className={`relative w-full overflow-hidden rounded border border-dashed border-rule bg-surface-2 ${aspectClass}`}
        >
          {previewSrc ? (
            // biome-ignore lint/performance/noImgElement: admin preview of arbitrary upload URLs
            <img
              src={previewSrc}
              alt={alt || label || "پیش‌نمایش تصویر"}
              className="absolute inset-0 h-full w-full rounded object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-ink-faint">
              {emptyHint}
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between gap-2 p-2">
            <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
              <input
                id={`${id}-src`}
                type="url"
                value={src}
                onChange={(e) => onSrcChange(e.target.value)}
                placeholder={srcPlaceholder}
                aria-label={srcPlaceholder}
                required={required}
                className={`${chromeInput} min-w-0 flex-1`}
              />
              {uploadContext ? (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className={chromeBtn}
                >
                  انتخاب از مدیا
                </button>
              ) : null}
              {fileInput}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className={chromeBtn}
              >
                {uploading ? "در حال آپلود…" : "آپلود"}
              </button>
            </div>

            {hideAlt ? null : (
              <div data-field={altField}>
                <input
                  id={`${id}-alt`}
                  type="text"
                  value={alt}
                  onChange={(e) => onAltChange(e.target.value)}
                  placeholder={altPlaceholder}
                  aria-label={altPlaceholder}
                  required={required}
                  className={`${chromeInput} pointer-events-auto`}
                />
              </div>
            )}
          </div>
        </div>

        {errorMessage ? <div className="mt-2">{errorMessage}</div> : null}

        {showCaption && (onCaptionChange || onCreditChange) ? (
          <figcaption className={FIGURE_CAPTION_CLASS}>
            {onCaptionChange ? (
              <input
                id={`${id}-caption`}
                type="text"
                value={caption}
                onChange={(e) => onCaptionChange(e.target.value)}
                placeholder="زیرنویس…"
                className="w-full border-0 bg-transparent font-sans text-base leading-relaxed text-ink-muted outline-none placeholder:text-ink-faint"
              />
            ) : null}
            {onCreditChange ? (
              <input
                id={`${id}-credit`}
                type="text"
                value={credit}
                onChange={(e) => onCreditChange(e.target.value)}
                placeholder="اعتبار…"
                className="w-full border-0 bg-transparent font-sans text-base leading-relaxed text-ink-muted opacity-80 outline-none placeholder:text-ink-faint"
              />
            ) : null}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  const preview = bare ? (
    <figure className="my-0 w-full overflow-hidden">
      {previewSrc ? (
        // biome-ignore lint/performance/noImgElement: admin preview of arbitrary upload URLs
        <img
          src={previewSrc}
          alt={alt || label || "پیش‌نمایش تصویر"}
          className="h-auto w-full rounded object-contain"
        />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded border border-dashed border-rule bg-surface-2 text-xs text-ink-faint">
          پیش‌نمایش تصویر
        </div>
      )}
      {showCaption && (caption || credit) ? (
        <figcaption className="mt-3 space-y-1 text-base leading-relaxed text-ink-muted">
          {caption ? <p>{caption}</p> : null}
          {credit ? <p className="opacity-80">{credit}</p> : null}
        </figcaption>
      ) : null}
    </figure>
  ) : (
    <div
      className={`relative w-full overflow-hidden rounded border border-rule bg-paper ${aspectClass}`}
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
        fieldKey={srcField}
      />
      {hideAlt ? null : (
        <TextField
          id={`${id}-alt`}
          label="متن جایگزین"
          value={alt}
          onChange={onAltChange}
          required={required}
          fieldKey={altField}
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
    <div
      data-field={srcField}
      className={
        bare
          ? "space-y-3"
          : "space-y-3 rounded border border-rule bg-surface-2 p-4"
      }
    >
      {picker}
      {errorMessage}

      {twoColumn ? (
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
          <div className="min-w-0">{preview}</div>
          <div className="min-w-0 space-y-3">
            {uploadButtons}
            {fields}
          </div>
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
