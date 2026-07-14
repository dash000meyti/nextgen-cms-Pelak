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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { BlockEditor } from "@/components/admin/blocks/BlockEditor";
import {
  ArchiveIcon,
  SaveIcon,
  TrashIcon,
  ViewIcon,
} from "@/components/admin/blocks/icons";
import { ImageField } from "@/components/admin/fields/ImageField";
import { JalaliDateField } from "@/components/admin/fields/JalaliDateField";
import { ReferencePicker } from "@/components/admin/fields/ReferencePicker";
import { SlugField } from "@/components/admin/fields/SlugField";
import { TextareaField } from "@/components/admin/fields/TextareaField";
import { TextField } from "@/components/admin/fields/TextField";
import { PublishBar } from "@/components/admin/studio/PublishBar";
import { useConfirmDialog } from "@/components/admin/studio/useConfirmDialog";
import { FormMessage } from "@/components/ui/FormMessage";
import { useFormFeedback } from "@/components/ui/useFormFeedback";
import { formatServerActionError } from "@/lib/format-server-action-error";

type ArticleFormProps = {
  mode: "create" | "edit";
  articleId?: number;
  initial: ArticleFormData;
  members: PickerOption[];
  topics: PickerOption[];
  contentGroups: PickerOption[];
  articles: PickerOption[];
  canDelete?: boolean;
};

export function ArticleForm({
  mode,
  articleId,
  initial,
  members,
  topics,
  contentGroups,
  articles,
  canDelete = false,
}: ArticleFormProps) {
  const router = useRouter();
  const session = useAdminMember();
  const { confirm, dialog } = useConfirmDialog();
  const canPublish = canPublishContent(session);
  const membersReadOnly = !hasPermission(session, "content.edit_all");
  const [pending, startTransition] = useTransition();
  const feedback = useFormFeedback();
  const [form, setForm] = useState(initial);

  const uploadContext = articleId
    ? { contentId: articleId }
    : { memberId: session.memberId };

  const relatedSelectedIds = useMemo(() => {
    const bySlug = new Map(
      articles
        .filter((option) => option.slug)
        .map((option) => [option.slug as string, option.id]),
    );
    return form.relatedSlugs
      .map((slug) => bySlug.get(slug))
      .filter((id): id is number => id != null);
  }, [articles, form.relatedSlugs]);

  function update<K extends keyof ArticleFormData>(
    key: K,
    value: ArticleFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateRelatedFromIds(ids: number[]) {
    const byId = new Map(articles.map((option) => [option.id, option.slug]));
    update(
      "relatedSlugs",
      ids
        .map((id) => byId.get(id))
        .filter((slug): slug is string => Boolean(slug)),
    );
  }

  function runMutation(task: () => Promise<void>) {
    startTransition(() => {
      void task().catch((error: unknown) => {
        if (isRedirectError(error)) throw error;
        feedback.reportError(formatServerActionError(error));
      });
    });
  }

  function handleSave() {
    feedback.clear();
    runMutation(async () => {
      if (mode === "create") {
        const result = await createArticleAndRedirect(form);
        if (result && !result.ok) {
          feedback.reportError(result.error, result.field);
        }
        return;
      }
      if (!articleId) return;
      const result = await saveArticleAndStay(articleId, form);
      if (!result.ok) {
        feedback.reportError(result.error, result.field);
        return;
      }
      feedback.reportSuccess("ذخیره شد.");
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
    feedback.clear();
    runMutation(async () => {
      const result = await archiveArticleAndRedirect(articleId);
      if (result && !result.ok) {
        feedback.reportError(result.error, result.field);
      }
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
    feedback.clear();
    runMutation(async () => {
      const result = await removeArticleAndRedirect(articleId);
      if (result && !result.ok) {
        feedback.reportError(result.error, result.field);
      }
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
    feedback.clear();
    runMutation(async () => {
      const saveResult = await saveArticleAndStay(articleId, form);
      if (!saveResult.ok) {
        feedback.reportError(saveResult.error, saveResult.field);
        return;
      }
      const result = await publishArticle(articleId);
      if (!result.ok) {
        feedback.reportError(result.error, result.field);
        return;
      }
      update("status", "published");
      if (!form.publishedAt) {
        update("publishedAt", todayIsoIran());
      }
      feedback.reportSuccess("منتشر شد.");
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
    feedback.clear();
    runMutation(async () => {
      const result = await unpublishArticle(articleId);
      if (!result.ok) {
        feedback.reportError(result.error, result.field);
        return;
      }
      update("status", "draft");
      feedback.reportSuccess("انتشار لغو شد.");
      router.refresh();
    });
  }

  const saveLabel = pending
    ? "در حال ذخیره…"
    : mode === "create"
      ? "ایجاد"
      : "ذخیره";

  const viewHref =
    mode === "edit" && articleId
      ? form.status === "published"
        ? `/content/${form.slug}`
        : `/admin/content/${articleId}/preview`
      : null;

  return (
    <div className="space-y-4">
      {dialog}
      {mode === "edit" && articleId ? (
        <PublishBar
          status={form.status}
          canPublish={canPublish}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          publishing={pending}
        />
      ) : null}

      <FormMessage
        error={feedback.error}
        success={feedback.success}
        info={feedback.info}
        onDismiss={feedback.clear}
      />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col gap-1">
                <label className="flex h-10 items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => update("isFeatured", e.target.checked)}
                    className="accent-accent"
                  />
                  محتوای ویژه
                </label>
                <label className="flex h-10 items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={form.isEditorsPick}
                    onChange={(e) => update("isEditorsPick", e.target.checked)}
                    className="accent-accent"
                  />
                  انتخاب سردبیر
                </label>
              </div>
              <div className="min-w-48 flex-1">
                <ReferencePicker
                  label="گروه محتوا"
                  options={contentGroups}
                  selectedIds={form.contentGroupIds}
                  onChange={(contentGroupIds) =>
                    update("contentGroupIds", contentGroupIds)
                  }
                  multiple
                  labelAsPlaceholder
                />
              </div>
            </div>
            <ReferencePicker
              label="موضوعات"
              options={topics}
              selectedIds={form.topicIds}
              onChange={(topicIds) => update("topicIds", topicIds)}
              multiple
              labelAsPlaceholder
            />
          </div>

          <hr className="border-rule" />

          <TextField
            id="title"
            value={form.title}
            onChange={(title) => update("title", title)}
            floatingLabel="عنوان"
            required
          />
          <SlugField
            id="slug"
            value={form.slug}
            onChange={(slug) => update("slug", slug)}
            sourceTitle={mode === "create" ? form.title : undefined}
            floatingLabel="نامک"
            required
          />
          <TextField
            id="subtitle"
            value={form.subtitle}
            onChange={(subtitle) => update("subtitle", subtitle)}
            floatingLabel="زیرعنوان"
          />
          <TextareaField
            id="excerpt"
            value={form.excerpt}
            onChange={(excerpt) => update("excerpt", excerpt)}
            floatingLabel="چکیده"
            rows={2}
          />

          <hr className="border-rule" />

          <JalaliDateField
            id="publishedAt"
            label="تاریخ انتشار"
            value={form.publishedAt ?? ""}
            onChange={(publishedAt) =>
              update("publishedAt", publishedAt || null)
            }
          />
          <ReferencePicker
            label="اعضا"
            options={members}
            selectedIds={form.memberIds}
            onChange={(memberIds) => update("memberIds", memberIds)}
            multiple
            readOnly={membersReadOnly}
            labelAsPlaceholder
            fieldKey="memberIds"
          />
        </div>

        <div className="space-y-4">
          <ImageField
            id="hero"
            label="تصویر شاخص"
            src={form.heroSrc}
            alt={form.heroAlt}
            caption={form.heroCaption}
            credit={form.heroCredit}
            onSrcChange={(heroSrc) => update("heroSrc", heroSrc)}
            onAltChange={(heroAlt) => update("heroAlt", heroAlt)}
            onCaptionChange={(heroCaption) =>
              update("heroCaption", heroCaption)
            }
            onCreditChange={(heroCredit) => update("heroCredit", heroCredit)}
            showCaption
            required
            overlay
            previewAspectClass="aspect-video lg:aspect-square"
            uploadContext={uploadContext}
            fieldKey="hero"
            altFieldKey="heroAlt"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="min-w-0 space-y-4">
          <BlockEditor
            value={form.body}
            onChange={(body: ArticleBlock[]) => update("body", body)}
            uploadContext={uploadContext}
          />

          <ReferencePicker
            label="محتوای مرتبط"
            options={articles}
            selectedIds={relatedSelectedIds}
            onChange={updateRelatedFromIds}
            multiple
            labelAsPlaceholder
          />
        </div>

        <div className="lg:sticky lg:top-[40dvh] lg:self-start">
          <div className="flex flex-row gap-2 lg:flex-col">
            {viewHref ? (
              <Link
                href={viewHref}
                target="_blank"
                rel="noreferrer"
                title="مشاهده"
                aria-label="مشاهده"
                className="flex h-10 w-10 items-center justify-center rounded border border-rule text-ink hover:bg-surface"
              >
                <ViewIcon className="h-5 w-5" />
              </Link>
            ) : null}
            <button
              type="button"
              onClick={handleSave}
              disabled={pending}
              title={saveLabel}
              aria-label={saveLabel}
              className="flex h-10 w-10 items-center justify-center rounded bg-accent text-paper hover:bg-accent-hover disabled:opacity-50"
            >
              <SaveIcon className="h-5 w-5" />
            </button>
            {mode === "edit" && canDelete ? (
              form.status === "archived" ? (
                <button
                  type="button"
                  onClick={handlePermanentDelete}
                  disabled={pending}
                  title="حذف دائمی"
                  aria-label="حذف دائمی"
                  className="flex h-10 w-10 items-center justify-center rounded border border-rule text-ink hover:bg-surface disabled:opacity-50"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleArchive}
                  disabled={pending}
                  title="ارسال به بایگانی"
                  aria-label="ارسال به بایگانی"
                  className="flex h-10 w-10 items-center justify-center rounded border border-rule text-ink hover:bg-surface disabled:opacity-50"
                >
                  <ArchiveIcon className="h-5 w-5" />
                </button>
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
