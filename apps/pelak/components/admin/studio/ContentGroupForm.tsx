"use client";

import { getContentGroupFieldDefs } from "@nextgen-cms/contract/cms-schema/content-group";
import type { DocumentField } from "@nextgen-cms/contract/cms-schema/types";
import type { ContentGroupPeriod } from "@nextgen-cms/contract/types/modules";
import { useAdminMember } from "@nextgen-cms/studio/admin/admin-member-context";
import {
  type ContentGroupFormData,
  createContentGroupAndRedirect,
  saveContentGroup,
} from "@nextgen-cms/studio/cms/mutations/content-group";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ImageField } from "@/components/admin/fields/ImageField";
import { JalaliDateField } from "@/components/admin/fields/JalaliDateField";
import { PdfField } from "@/components/admin/fields/PdfField";
import { TextField } from "@/components/admin/fields/TextField";
import { FormMessage } from "@/components/admin/studio/FormMessage";

type ContentGroupFormProps = {
  mode: "create" | "edit";
  contentGroupId?: number;
  initial: ContentGroupFormData;
  contentGroupPeriod: ContentGroupPeriod;
  maxImageBytes: number;
  maxPdfBytes: number;
};

function renderPeriodField(
  field: DocumentField,
  form: ContentGroupFormData,
  update: <K extends keyof ContentGroupFormData>(
    key: K,
    value: ContentGroupFormData[K],
  ) => void,
) {
  if (field.key === "year") {
    return (
      <TextField
        key={field.key}
        id="year"
        label={field.label}
        value={String(form.year)}
        onChange={(value) => update("year", Number.parseInt(value, 10) || 0)}
        required={field.required}
      />
    );
  }

  if (field.kind === "select" && field.options) {
    return (
      <label key={field.key} className="block space-y-1.5 text-sm">
        <span className="font-medium text-ink">
          {field.label}
          {field.required ? <span className="text-accent"> *</span> : null}
        </span>
        <select
          value={form.season}
          onChange={(e) => update("season", e.target.value)}
          className="w-full rounded border border-rule bg-paper px-3 py-2 text-ink"
        >
          <option value="">انتخاب کنید</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.key === "season" && field.kind === "number") {
    return (
      <TextField
        key={field.key}
        id="season"
        label={field.label}
        type="number"
        value={form.season}
        onChange={(season) => update("season", season)}
        required={field.required}
        hint={field.hint}
      />
    );
  }

  return (
    <TextField
      key={field.key}
      id="season-text"
      label={field.label}
      value={form.season}
      onChange={(season) => update("season", season)}
      required={field.required}
      hint={field.hint}
    />
  );
}

export function ContentGroupForm({
  mode,
  contentGroupId,
  initial,
  contentGroupPeriod,
  maxImageBytes,
  maxPdfBytes,
}: ContentGroupFormProps) {
  const router = useRouter();
  const session = useAdminMember();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState(initial);
  const uploadContext = contentGroupId
    ? { contentGroupId }
    : { memberId: session.memberId };
  const periodFields = useMemo(
    () => getContentGroupFieldDefs(contentGroupPeriod),
    [contentGroupPeriod],
  );

  function update<K extends keyof ContentGroupFormData>(
    key: K,
    value: ContentGroupFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
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
      } catch {
        setError("خطا در ذخیره — دوباره تلاش کنید.");
      }
    });
  }

  const periodOnlyFields = periodFields.filter((field) =>
    ["year", "season"].includes(field.key),
  );

  return (
    <div className="space-y-8">
      <FormMessage error={error} success={success} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <TextField
          id="number"
          label="شماره"
          value={String(form.number)}
          onChange={(value) =>
            update("number", Number.parseInt(value, 10) || 0)
          }
          required
        />
        {periodOnlyFields.map((field) =>
          renderPeriodField(field, form, update),
        )}
      </div>
      <TextField
        id="label"
        label="برچسب"
        value={form.label}
        onChange={(label) => update("label", label)}
        required
      />
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
