"use client";

import {
  createVideoAndRedirect,
  saveVideo,
  type VideoFormData,
} from "@nextgen-cms/studio/cms/mutations/video";
import { useAdminMember } from "@nextgen-cms/studio/admin/admin-member-context";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImageField } from "@/components/admin/fields/ImageField";
import { JalaliDateField } from "@/components/admin/fields/JalaliDateField";
import { SlugField } from "@/components/admin/fields/SlugField";
import { TextareaField } from "@/components/admin/fields/TextareaField";
import { TextField } from "@/components/admin/fields/TextField";
import { FormMessage } from "@/components/admin/studio/FormMessage";

type VideoFormProps = {
  mode: "create" | "edit";
  videoId?: number;
  initial: VideoFormData;
};

export function VideoForm({ mode, videoId, initial }: VideoFormProps) {
  const router = useRouter();
  const session = useAdminMember();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState(initial);
  const uploadContext = videoId
    ? { videoId }
    : { memberId: session.memberId };

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

  return (
    <div className="space-y-8">
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
      <JalaliDateField
        id="publishedAt"
        label="تاریخ انتشار"
        value={form.publishedAt}
        onChange={(publishedAt) => update("publishedAt", publishedAt)}
        required
      />
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
      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="rounded bg-accent px-6 py-2 text-sm text-paper hover:bg-accent-hover disabled:opacity-50"
      >
        {pending ? "در حال ذخیره…" : mode === "create" ? "ایجاد" : "ذخیره"}
      </button>
    </div>
  );
}
