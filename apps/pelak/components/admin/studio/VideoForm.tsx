"use client";

import { useAdminMember } from "@nextgen-cms/studio/admin/admin-member-context";
import {
  archiveVideo,
  createVideoAndRedirect,
  publishVideo,
  removeVideo,
  resolveAparatFromUrl,
  restoreVideoFromArchive,
  saveVideo,
  unpublishVideo,
  type VideoFormData,
} from "@nextgen-cms/studio/cms/mutations/video";
import type { PickerOption } from "@nextgen-cms/studio/cms/queries";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImageField } from "@/components/admin/fields/ImageField";
import { JalaliDateField } from "@/components/admin/fields/JalaliDateField";
import { ReferencePicker } from "@/components/admin/fields/ReferencePicker";
import { SlugField } from "@/components/admin/fields/SlugField";
import { TextareaField } from "@/components/admin/fields/TextareaField";
import { TextField } from "@/components/admin/fields/TextField";
import { FormMessage } from "@/components/admin/studio/FormMessage";
import { PublishBar } from "@/components/admin/studio/PublishBar";
import { useConfirmDialog } from "@/components/admin/studio/useConfirmDialog";

type VideoFormProps = {
  mode: "create" | "edit";
  videoId?: number;
  initial: VideoFormData;
  playlistOptions: PickerOption[];
};

export function VideoForm({
  mode,
  videoId,
  initial,
  playlistOptions,
}: VideoFormProps) {
  const router = useRouter();
  const session = useAdminMember();
  const { confirm, dialog } = useConfirmDialog();
  const canPublish = session.permissions.includes("modules.video.edit");
  const canDelete = session.permissions.includes("modules.video.delete");
  const [pending, startTransition] = useTransition();
  const [fetchingAparat, startFetchTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState(initial);
  const uploadContext = videoId ? { videoId } : { memberId: session.memberId };

  function update<K extends keyof VideoFormData>(
    key: K,
    value: VideoFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      if (mode === "create") {
        const result = await createVideoAndRedirect(form);
        if (result && !result.ok) setError(result.error);
        return;
      }
      if (!videoId) return;
      const result = await saveVideo(videoId, form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess("ذخیره شد.");
      router.refresh();
    });
  }

  function handleResolveAparat() {
    setError(null);
    startFetchTransition(async () => {
      const result = await resolveAparatFromUrl(form.aparatUrl);
      if (!result.ok || !("data" in result)) {
        setError(
          "error" in result ? result.error : "خطا در دریافت اطلاعات آپارات.",
        );
        return;
      }
      setForm((prev) => ({
        ...prev,
        title: result.data.title || prev.title,
        duration: result.data.duration || prev.duration,
        thumbnailSrc: result.data.thumbnailSrc || prev.thumbnailSrc,
        externalLink: result.data.externalLink || prev.externalLink,
      }));
      setSuccess("اطلاعات آپارات دریافت شد.");
    });
  }

  async function handlePublish() {
    if (!videoId) return;
    const confirmed = await confirm({
      title: "انتشار",
      message: "این ویدیو منتشر شود؟",
      confirmLabel: "انتشار",
    });
    if (!confirmed) return;
    setError(null);
    startTransition(async () => {
      const result = await publishVideo(videoId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      update("status", "published");
      setSuccess("منتشر شد.");
      router.refresh();
    });
  }

  async function handleUnpublish() {
    if (!videoId) return;
    const confirmed = await confirm({
      title: "لغو انتشار",
      message: "انتشار این ویدیو لغو شود؟",
      confirmLabel: "لغو انتشار",
    });
    if (!confirmed) return;
    setError(null);
    startTransition(async () => {
      const result = await unpublishVideo(videoId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      update("status", "draft");
      setSuccess("انتشار لغو شد.");
      router.refresh();
    });
  }

  async function handleArchive() {
    if (!videoId) return;
    const confirmed = await confirm({
      title: "ارسال به بایگانی",
      message: "این ویدیو به بایگانی ارسال شود؟",
      confirmLabel: "بایگانی",
    });
    if (!confirmed) return;
    setError(null);
    startTransition(async () => {
      const result = await archiveVideo(videoId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      update("status", "archived");
      setSuccess("به بایگانی ارسال شد.");
      router.refresh();
    });
  }

  async function handleRestore() {
    if (!videoId) return;
    setError(null);
    startTransition(async () => {
      const result = await restoreVideoFromArchive(videoId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      update("status", "draft");
      setSuccess("از بایگانی بازگردانی شد.");
      router.refresh();
    });
  }

  async function handleDelete() {
    if (!videoId) return;
    const confirmed = await confirm({
      title: "حذف دائمی",
      message: "این ویدیو برای همیشه حذف شود؟",
      confirmLabel: "حذف",
      variant: "destructive",
    });
    if (!confirmed) return;
    setError(null);
    startTransition(async () => {
      const result = await removeVideo(videoId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/videos?status=archived");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {dialog}
      {mode === "edit" && videoId ? (
        <PublishBar
          status={form.status}
          canPublish={canPublish}
          viewHref={form.externalLink || "#"}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          publishing={pending || fetchingAparat}
        />
      ) : null}
      <FormMessage error={error} success={success} />
      <div className="grid gap-6 lg:grid-cols-2">
        <TextField
          id="title"
          label="عنوان"
          value={form.title}
          onChange={(title) => update("title", title)}
          required
        />
        <SlugField
          id="slug"
          label="نامک"
          value={form.slug}
          onChange={(slug) => update("slug", slug)}
          sourceTitle={mode === "create" ? form.title : undefined}
          required
        />
      </div>
      <TextareaField
        id="description"
        label="توضیحات"
        value={form.description}
        onChange={(description) => update("description", description)}
        rows={4}
      />
      <TextField
        id="duration"
        label="مدت"
        value={form.duration}
        onChange={(duration) => update("duration", duration)}
      />
      <div className="space-y-2">
        <span className="block text-sm font-medium text-ink">منبع نمایش</span>
        <div className="flex gap-4 text-sm text-ink">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              checked={form.linkSource === "thumbnail"}
              onChange={() => update("linkSource", "thumbnail")}
              className="accent-accent"
            />
            تصویر بندانگشتی
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              checked={form.linkSource === "aparat"}
              onChange={() => update("linkSource", "aparat")}
              className="accent-accent"
            />
            لینک آپارات
          </label>
        </div>
      </div>
      <JalaliDateField
        id="publishedAt"
        label="تاریخ انتشار"
        value={form.publishedAt}
        onChange={(publishedAt) => update("publishedAt", publishedAt)}
        required
      />
      {form.linkSource === "aparat" ? (
        <div className="space-y-3">
          <TextField
            id="aparatUrl"
            label="لینک آپارات"
            value={form.aparatUrl}
            onChange={(aparatUrl) => update("aparatUrl", aparatUrl)}
            placeholder="https://www.aparat.com/v/XXXX"
            required
          />
          <button
            type="button"
            onClick={handleResolveAparat}
            disabled={pending || fetchingAparat}
            className="rounded border border-rule px-4 py-2 text-sm text-ink hover:bg-surface disabled:opacity-50"
          >
            {fetchingAparat ? "در حال دریافت…" : "دریافت از آپارات"}
          </button>
          <ImageField
            id="thumbnail"
            label="تصویر بندانگشتی"
            src={form.thumbnailSrc}
            alt={form.thumbnailAlt}
            onSrcChange={(thumbnailSrc) => update("thumbnailSrc", thumbnailSrc)}
            onAltChange={(thumbnailAlt) => update("thumbnailAlt", thumbnailAlt)}
            uploadContext={uploadContext}
            required
          />
        </div>
      ) : (
        <div className="space-y-3">
          <ImageField
            id="thumbnail"
            label="تصویر بندانگشتی"
            src={form.thumbnailSrc}
            alt={form.thumbnailAlt}
            onSrcChange={(thumbnailSrc) => update("thumbnailSrc", thumbnailSrc)}
            onAltChange={(thumbnailAlt) => update("thumbnailAlt", thumbnailAlt)}
            uploadContext={uploadContext}
            required
          />
          <TextField
            id="externalLink"
            label="لینک ویدیو"
            value={form.externalLink}
            onChange={(externalLink) => update("externalLink", externalLink)}
            placeholder="https://..."
            required
          />
        </div>
      )}
      <ReferencePicker
        label="لیست‌های پخش"
        options={playlistOptions}
        selectedIds={form.playlistIds}
        onChange={(playlistIds) => update("playlistIds", playlistIds)}
        multiple
      />
      <div className="flex flex-wrap gap-3 border-t border-rule pt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending || fetchingAparat}
          className="rounded bg-accent px-6 py-2 text-sm text-paper hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "در حال ذخیره…" : mode === "create" ? "ایجاد" : "ذخیره"}
        </button>
        {mode === "edit" && canDelete && videoId ? (
          form.status === "archived" ? (
            <>
              <button
                type="button"
                onClick={handleRestore}
                disabled={pending || fetchingAparat}
                className="rounded border border-rule px-6 py-2 text-sm text-ink hover:bg-surface disabled:opacity-50"
              >
                بازگردانی از بایگانی
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending || fetchingAparat}
                className="rounded border border-rule px-6 py-2 text-sm text-ink hover:bg-surface disabled:opacity-50"
              >
                حذف دائمی
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleArchive}
              disabled={pending || fetchingAparat}
              className="rounded border border-rule px-6 py-2 text-sm text-ink hover:bg-surface disabled:opacity-50"
            >
              ارسال به بایگانی
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}
