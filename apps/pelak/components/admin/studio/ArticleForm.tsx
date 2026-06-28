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
  createArticleAndRedirect,
  publishArticle,
  removeArticleAndRedirect,
  saveArticleAndStay,
  unpublishArticle,
} from "@nextgen-cms/studio/cms/mutations/article";
import type { PickerOption } from "@nextgen-cms/studio/cms/queries";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BlockEditor } from "@/components/admin/fields/BlockEditor";
import { ImageField } from "@/components/admin/fields/ImageField";
import { ReferencePicker } from "@/components/admin/fields/ReferencePicker";
import { SlugField } from "@/components/admin/fields/SlugField";
import { TextareaField } from "@/components/admin/fields/TextareaField";
import { TextField } from "@/components/admin/fields/TextField";
import { FormMessage } from "@/components/admin/studio/FormMessage";
import { PublishBar } from "@/components/admin/studio/PublishBar";

type ArticleFormProps = {
  mode: "create" | "edit";
  articleId?: number;
  initial: ArticleFormData;
  members: PickerOption[];
  topics: PickerOption[];
  issues: PickerOption[];
  canDelete?: boolean;
};

export function ArticleForm({
  mode,
  articleId,
  initial,
  members,
  topics,
  issues,
  canDelete = false,
}: ArticleFormProps) {
  const router = useRouter();
  const session = useAdminMember();
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

  async function handleSave() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
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

  function handleDelete() {
    if (!articleId) return;
    if (!window.confirm("این محتوا حذف شود؟")) return;
    setError(null);
    startTransition(async () => {
      const result = await removeArticleAndRedirect(articleId);
      if (result && !result.ok) setError(result.error);
    });
  }

  function handlePublish() {
    if (!articleId) return;
    setError(null);
    startTransition(async () => {
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

  function handleUnpublish() {
    if (!articleId) return;
    setError(null);
    startTransition(async () => {
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
      {mode === "edit" && articleId ? (
        <PublishBar
          status={form.status}
          canPublish={canPublish}
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
        label="شماره"
        options={issues}
        selectedIds={
          form.issueNumber != null
            ? issues
                .filter((item) => item.number === form.issueNumber)
                .map((item) => item.id)
            : []
        }
        onChange={(ids) => {
          const issue = issues.find((item) => item.id === ids[0]);
          update("issueNumber", issue?.number ?? null);
        }}
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
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="rounded border border-rule px-6 py-2 text-sm text-ink hover:bg-surface disabled:opacity-50"
          >
            حذف
          </button>
        ) : null}
      </div>
    </div>
  );
}
