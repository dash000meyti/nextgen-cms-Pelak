"use client";

import { useAdminMember } from "@nextgen-cms/studio/admin/admin-member-context";
import {
  archiveContentGroupAndRedirect,
  type ContentGroupFormData,
  createContentGroupAndRedirect,
  publishContentGroup,
  removeContentGroupAndRedirect,
  saveContentGroup,
  unpublishContentGroup,
} from "@nextgen-cms/studio/cms/mutations/content-group";
import type { PickerOption } from "@nextgen-cms/studio/cms/queries";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImageField } from "@/components/admin/fields/ImageField";
import { JalaliDateField } from "@/components/admin/fields/JalaliDateField";
import { PdfField } from "@/components/admin/fields/PdfField";
import { ReferencePicker } from "@/components/admin/fields/ReferencePicker";
import { SlugField } from "@/components/admin/fields/SlugField";
import { TextField } from "@/components/admin/fields/TextField";
import { FormMessage } from "@/components/admin/studio/FormMessage";
import { PublishBar } from "@/components/admin/studio/PublishBar";
import { useConfirmDialog } from "@/components/admin/studio/useConfirmDialog";
import { formatServerActionError } from "@/lib/format-server-action-error";

type ContentGroupFormProps = {
  mode: "create" | "edit";
  contentGroupId?: number;
  initial: ContentGroupFormData;
  articles: PickerOption[];
  canDelete?: boolean;
  maxImageBytes: number;
  maxPdfBytes: number;
  pageTitle: string;
};

export function ContentGroupForm({
  mode,
  contentGroupId,
  initial,
  articles,
  canDelete = false,
  maxImageBytes,
  maxPdfBytes,
  pageTitle: _pageTitle,
}: ContentGroupFormProps) {
  const router = useRouter();
  const session = useAdminMember();
  const { confirm, dialog } = useConfirmDialog();
  const canPublish = session.permissions.includes("modules.contentGroup.edit");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState(initial);

  const uploadContext = contentGroupId
    ? { contentGroupId }
    : { memberId: session.memberId };

  function update<K extends keyof ContentGroupFormData>(
    key: K,
    value: ContentGroupFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function runMutation(task: () => Promise<void>) {
    startTransition(() => {
      void task().catch((err: unknown) => {
        if (isRedirectError(err)) throw err;
        setError(formatServerActionError(err));
      });
    });
  }

  function handleSave() {
    setError(null);
    setSuccess(null);
    runMutation(async () => {
      if (mode === "create") {
        const result = await createContentGroupAndRedirect(form);
        if (result && !result.ok) setError(result.error);
        return;
      }
      if (!contentGroupId) return;
      const result = await saveContentGroup(contentGroupId, form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess("ذخیره شد.");
      router.refresh();
    });
  }

  async function handleArchive() {
    if (!contentGroupId) return;
    const confirmed = await confirm({
      title: "ارسال به بایگانی",
      message: "این گروه محتوا به بایگانی ارسال شود؟",
      confirmLabel: "بایگانی",
    });
    if (!confirmed) return;
    setError(null);
    runMutation(async () => {
      const result = await archiveContentGroupAndRedirect(contentGroupId);
      if (result && !result.ok) setError(result.error);
    });
  }

  async function handlePermanentDelete() {
    if (!contentGroupId) return;
    const confirmed = await confirm({
      title: "حذف دائمی",
      message: "این گروه محتوا برای همیشه حذف شود؟",
      confirmLabel: "حذف",
    });
    if (!confirmed) return;
    setError(null);
    runMutation(async () => {
      const result = await removeContentGroupAndRedirect(contentGroupId);
      if (result && !result.ok) setError(result.error);
    });
  }

  async function handlePublish() {
    if (!contentGroupId) return;
    const confirmed = await confirm({
      title: "انتشار",
      message: "این گروه محتوا منتشر شود؟",
      confirmLabel: "انتشار",
    });
    if (!confirmed) return;
    setError(null);
    runMutation(async () => {
      const result = await publishContentGroup(contentGroupId);
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
    if (!contentGroupId) return;
    const confirmed = await confirm({
      title: "لغو انتشار",
      message: "انتشار این گروه محتوا لغو شود؟",
      confirmLabel: "لغو انتشار",
    });
    if (!confirmed) return;
    setError(null);
    runMutation(async () => {
      const result = await unpublishContentGroup(contentGroupId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      update("status", "draft");
      setSuccess("انتشار لغو شد.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {dialog}
      {mode === "edit" && contentGroupId ? (
        <PublishBar
          status={form.status}
          canPublish={canPublish}
          viewHref={
            form.status === "published" ? `/content-group/${form.slug}` : "#"
          }
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          publishing={pending}
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

      <JalaliDateField
        id="publishedAt"
        label="تاریخ انتشار"
        value={form.publishedAt}
        onChange={(publishedAt) => update("publishedAt", publishedAt)}
        required
      />

      <ImageField
        id="cover"
        label="جلد"
        src={form.coverSrc}
        alt={form.coverAlt}
        onSrcChange={(coverSrc) => update("coverSrc", coverSrc)}
        onAltChange={(coverAlt) => update("coverAlt", coverAlt)}
        uploadContext={uploadContext}
        maxBytes={maxImageBytes}
        previewAspectClass="aspect-2/3 w-full max-w-[160px]"
        required
      />

      <PdfField
        id="pdf"
        label="فایل PDF"
        src={form.pdfSrc}
        onSrcChange={(pdfSrc) => update("pdfSrc", pdfSrc)}
        uploadContext={uploadContext}
        maxBytes={maxPdfBytes}
      />

      <ReferencePicker
        label="محتوای متصل"
        options={articles}
        selectedIds={form.articleIds}
        onChange={(articleIds) => update("articleIds", articleIds)}
        multiple
      />

      <div className="flex flex-wrap gap-3 border-t border-rule pt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="rounded bg-accent px-6 py-2 text-sm text-paper hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "در حال ذخیره…" : mode === "create" ? "ایجاد" : "ذخیره"}
        </button>
        {mode === "edit" && canDelete ? (
          form.status === "archived" ? (
            <button
              type="button"
              onClick={handlePermanentDelete}
              disabled={pending}
              className="rounded border border-rule px-6 py-2 text-sm text-ink hover:bg-surface disabled:opacity-50"
            >
              حذف دائمی
            </button>
          ) : (
            <button
              type="button"
              onClick={handleArchive}
              disabled={pending}
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
