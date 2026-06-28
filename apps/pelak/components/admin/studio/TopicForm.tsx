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
import { FormMessage } from "@/components/admin/studio/FormMessage";

type TopicFormProps = {
  mode: "create" | "edit";
  topicId?: number;
  initial: TopicFormData;
};

export function TopicForm({ mode, topicId, initial }: TopicFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState(initial);

  function update<K extends keyof TopicFormData>(
    key: K,
    value: TopicFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      if (mode === "create") {
        const result = await createTopicAndRedirect(form);
        if (result && !result.ok) setError(result.error);
        return;
      }
      if (!topicId) return;
      const result = await saveTopic(topicId, form);
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
          onClick={() => {
            if (!topicId || !confirm("این موضوع حذف شود؟")) return;
            startTransition(async () => {
              const result = await deleteTopic(topicId);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              router.push("/admin/settings/content/topics");
              router.refresh();
            });
          }}
          disabled={pending}
          className="ms-3 rounded border border-rule px-6 py-2 text-sm text-ink-muted hover:border-accent hover:text-accent disabled:opacity-50"
        >
          حذف
        </button>
      ) : null}
    </div>
  );
}
