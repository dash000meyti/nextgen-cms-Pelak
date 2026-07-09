"use client";

import type { ArticleBlock } from "@nextgen-cms/contract/types/article";
import { todayIsoIran } from "@nextgen-cms/core/platform/datetime";
import { useAdminMember } from "@nextgen-cms/studio/admin/admin-member-context";
import {
  canPublishContent,
  hasPermission,
} from "@nextgen-cms/studio/admin/article-access";
import {
  type ArticleFormData,
  archiveArticleAndRedirect,
  createArticleAndRedirect,
  publishArticle,
  removeArticleAndRedirect,
  saveArticleAndStay,
  unpublishArticle,
} from "@nextgen-cms/studio/cms/mutations/article";
import type { PickerOption } from "@nextgen-cms/studio/cms/queries";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BlockEditor } from "@/components/admin/blocks/BlockEditor";
import { ImageField } from "@/components/admin/fields/ImageField";
import { JalaliDateField } from "@/components/admin/fields/JalaliDateField";
import { ReferencePicker } from "@/components/admin/fields/ReferencePicker";
import { SlugField } from "@/components/admin/fields/SlugField";
import { TextareaField } from "@/components/admin/fields/TextareaField";
import { TextField } from "@/components/admin/fields/TextField";
import { FormMessage } from "@/components/admin/studio/FormMessage";
import { PublishBar } from "@/components/admin/studio/PublishBar";
import { useConfirmDialog } from "@/components/admin/studio/useConfirmDialog";
import { formatServerActionError } from "@/lib/format-server-action-error";

type ArticleFormProps = {
  mode: "create" | "edit";
  articleId?: number;
  initial: ArticleFormData;
  members: PickerOption[];
  topics: PickerOption[];
  contentGroups: PickerOption[];
  canDelete?: boolean;
};

export function ArticleForm({
  mode,
  articleId,
  initial,
  members,
  topics,
  contentGroups,
  canDelete = false,
}: ArticleFormProps) {
  const router = useRouter();
  const session = useAdminMember();
  const { confirm, dialog } = useConfirmDialog();
  const canPublish = canPublishContent(session);
  const membersReadOnly = !hasPermission(session, "content.edit_all");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState(initial);

  const uploadContext = articleId
    ? { contentId: articleId }
    : { memberId: session.memberId };

  function update<K extends keyof ArticleFormData>(
    key: K,
    value: ArticleFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function runMutation(task: () => Promise<void>) {
    startTransition(() => {
      void task().catch((error: unknown) => {
        if (isRedirectError(error)) throw error;
        setError(formatServerActionError(error));
      });
    });
  }

  function handleSave() {
    setError(null);
    setSuccess(null);
    runMutation(async () => {
      if (mode === "create") {
        const result = await createArticleAndRedirect(form);
        if (result && !result.ok) setError(result.error);
        return;
      }
      if (!articleId) return;
      const result = await saveArticleAndStay(articleId, form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess("ذخیره شد.");
      router.refresh();
    });
  }

  async function handleArchive() {
    if (!articleId) return;
    const confirmed = await confirm({
      title: "ارسال به بایگانی",
      message: "این محتوا به بایگانی ارسال شود؟",
      confirmLabel: "بایگانی",
    });
    if (!confirmed) return;
    setError(null);
    runMutation(async () => {
      const result = await archiveArticleAndRedirect(articleId);
      if (result && !result.ok) setError(result.error);
    });
  }

  async function handlePermanentDelete() {
    if (!articleId) return;
    const confirmed = await confirm({
      title: "حذف دائمی",
      message: "این محتوا برای همیشه حذف شود؟",
      confirmLabel: "حذف",
    });
    if (!confirmed) return;
    setError(null);
    runMutation(async () => {
      const result = await removeArticleAndRedirect(articleId);
      if (result && !result.ok) setError(result.error);
    });
  }

  async function handlePublish() {
    if (!articleId) return;
    const confirmed = await confirm({
      title: "انتشار",
      message: "این محتوا منتشر شود؟",
      confirmLabel: "انتشار",
    });
    if (!confirmed) return;
    setError(null);
    runMutation(async () => {
      const saveResult = await saveArticleAndStay(articleId, form);
      if (!saveResult.ok) {
        setError(saveResult.error);
        return;
      }
      const result = await publishArticle(articleId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      update("status", "published");
      if (!form.publishedAt) {
        update("publishedAt", todayIsoIran());
      }
      setSuccess("منتشر شد.");
      router.refresh();
    });
  }

  async function handleUnpublish() {
    if (!articleId) return;
    const confirmed = await confirm({
      title: "لغو انتشار",
      message: "انتشار این محتوا لغو شود؟",
      confirmLabel: "لغو انتشار",
    });
    if (!confirmed) return;
    setError(null);
    runMutation(async () => {
      const result = await unpublishArticle(articleId);
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
      {mode === "edit" && articleId ? (
        <PublishBar
          status={form.status}
          canPublish={canPublish}
          viewHref={
            form.status === "published"
              ? `/content/${form.slug}`
              : `/admin/content/${articleId}/preview`
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
        value={form.publishedAt ?? ""}
        onChange={(publishedAt) => update("publishedAt", publishedAt || null)}
      />
      <p className="-mt-4 text-xs text-ink-faint">
        برای مقالات قدیمی، تاریخ پارسال را تنظیم کنید — در فهرست گروه محتوا بر
        اساس این تاریخ مرتب می‌شود.
      </p>

      <TextField
        id="subtitle"
        label="زیرعنوان"
        value={form.subtitle}
        onChange={(subtitle) => update("subtitle", subtitle)}
      />

      <TextareaField
        id="excerpt"
        label="چکیده"
        value={form.excerpt}
        onChange={(excerpt) => update("excerpt", excerpt)}
        rows={3}
      />

      <ImageField
        id="hero"
        label="تصویر شاخص"
        src={form.heroSrc}
        alt={form.heroAlt}
        caption={form.heroCaption}
        credit={form.heroCredit}
        onSrcChange={(heroSrc) => update("heroSrc", heroSrc)}
        onAltChange={(heroAlt) => update("heroAlt", heroAlt)}
        onCaptionChange={(heroCaption) => update("heroCaption", heroCaption)}
        onCreditChange={(heroCredit) => update("heroCredit", heroCredit)}
        showCaption
        required
        uploadContext={uploadContext}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <TextField
          id="readingMinutes"
          label="زمان مطالعه (دقیقه)"
          value={String(form.readingMinutes)}
          onChange={(value) =>
            update("readingMinutes", Number.parseInt(value, 10) || 5)
          }
        />
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => update("isFeatured", e.target.checked)}
            className="accent-accent"
          />
          محتوای ویژه
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.isEditorsPick}
            onChange={(e) => update("isEditorsPick", e.target.checked)}
            className="accent-accent"
          />
          انتخاب سردبیر
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReferencePicker
          label="اعضا"
          options={members}
          selectedIds={form.memberIds}
          onChange={(memberIds) => update("memberIds", memberIds)}
          multiple
          readOnly={membersReadOnly}
        />
        <ReferencePicker
          label="موضوعات"
          options={topics}
          selectedIds={form.topicIds}
          onChange={(topicIds) => update("topicIds", topicIds)}
          multiple
        />
      </div>

      <ReferencePicker
        label="گروه محتوا"
        options={contentGroups}
        selectedIds={form.contentGroupIds}
        onChange={(contentGroupIds) =>
          update("contentGroupIds", contentGroupIds)
        }
        multiple
      />

      <BlockEditor
        value={form.body}
        onChange={(body: ArticleBlock[]) => update("body", body)}
        uploadContext={uploadContext}
      />

      <TextareaField
        id="relatedSlugs"
        label="محتوای مرتبط (نامک)"
        hint="هر نامک در یک خط"
        value={form.relatedSlugs.join("\n")}
        onChange={(value) =>
          update(
            "relatedSlugs",
            value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          )
        }
        rows={3}
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
