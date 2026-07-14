"use client";

import {
  createTopicAndRedirect,
  deleteTopic,
  saveTopic,
  type TopicFormData,
} from "@nextgen-cms/studio/cms/mutations/topic";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SlugField } from "@/components/admin/fields/SlugField";
import { TextareaField } from "@/components/admin/fields/TextareaField";
import { TextField } from "@/components/admin/fields/TextField";
import { useConfirmDialog } from "@/components/admin/studio/useConfirmDialog";
import { FormMessage } from "@/components/ui/FormMessage";
import { useFormFeedback } from "@/components/ui/useFormFeedback";

type TopicFormProps = {
  mode: "create" | "edit";
  topicId?: number;
  initial: TopicFormData;
};

export function TopicForm({ mode, topicId, initial }: TopicFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const feedback = useFormFeedback();
  const [form, setForm] = useState(initial);
  const { confirm, dialog } = useConfirmDialog();

  function update<K extends keyof TopicFormData>(
    key: K,
    value: TopicFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    feedback.clear();
    startTransition(async () => {
      if (mode === "create") {
        const result = await createTopicAndRedirect(form);
        if (result && !result.ok) {
          feedback.reportError(result.error, result.field);
        }
        return;
      }
      if (!topicId) return;
      const result = await saveTopic(topicId, form);
      if (!result.ok) {
        feedback.reportError(result.error, result.field);
        return;
      }
      feedback.reportSuccess("ذخیره شد.");
      router.refresh();
    });
  }

  async function handleDelete() {
    if (!topicId) return;
    const confirmed = await confirm({
      title: "حذف موضوع",
      message: "این موضوع حذف شود؟",
      confirmLabel: "حذف",
    });
    if (!confirmed) return;
    feedback.clear();
    startTransition(async () => {
      const result = await deleteTopic(topicId);
      if (!result.ok) {
        feedback.reportError(result.error, result.field);
        return;
      }
      router.push("/admin/content/settings/topics");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {dialog}
      <FormMessage
        error={feedback.error}
        success={feedback.success}
        info={feedback.info}
        onDismiss={feedback.clear}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <TextField
          id="name"
          label="نام"
          value={form.name}
          onChange={(name) => update("name", name)}
          required
        />
        <SlugField
          id="slug"
          label="نامک"
          value={form.slug}
          onChange={(slug) => update("slug", slug)}
          sourceTitle={mode === "create" ? form.name : undefined}
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
      <label className="flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={form.showOnHomepage}
          onChange={(e) => update("showOnHomepage", e.target.checked)}
          className="accent-accent"
        />
        <span>نمایش در صفحه اول</span>
      </label>
      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="rounded bg-accent px-6 py-2 text-sm text-paper hover:bg-accent-hover disabled:opacity-50"
      >
        {pending ? "در حال ذخیره…" : mode === "create" ? "ایجاد" : "ذخیره"}
      </button>
      {mode === "edit" && topicId ? (
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="ms-3 rounded border border-rule px-6 py-2 text-sm text-ink-muted hover:border-accent hover:text-accent disabled:opacity-50"
        >
          حذف
        </button>
      ) : null}
    </div>
  );
}
