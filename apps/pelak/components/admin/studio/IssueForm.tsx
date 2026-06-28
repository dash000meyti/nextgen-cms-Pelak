"use client";

import { getIssueFieldDefs } from "@nextgen-cms/contract/cms-schema/issue";
import type { DocumentField } from "@nextgen-cms/contract/cms-schema/types";
import type { IssuePeriod } from "@nextgen-cms/contract/types/modules";
import {
  createIssueAndRedirect,
  type IssueFormData,
  saveIssue,
} from "@nextgen-cms/studio/cms/mutations/issue";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ImageField } from "@/components/admin/fields/ImageField";
import { JalaliDateField } from "@/components/admin/fields/JalaliDateField";
import { TextField } from "@/components/admin/fields/TextField";
import { FormMessage } from "@/components/admin/studio/FormMessage";

type IssueFormProps = {
  mode: "create" | "edit";
  issueId?: number;
  initial: IssueFormData;
  issuePeriod: IssuePeriod;
};

function renderPeriodField(
  field: DocumentField,
  form: IssueFormData,
  update: <K extends keyof IssueFormData>(
    key: K,
    value: IssueFormData[K],
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

export function IssueForm({
  mode,
  issueId,
  initial,
  issuePeriod,
}: IssueFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState(initial);
  const periodFields = useMemo(
    () => getIssueFieldDefs(issuePeriod),
    [issuePeriod],
  );

  function update<K extends keyof IssueFormData>(
    key: K,
    value: IssueFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      if (mode === "create") {
        const result = await createIssueAndRedirect(form);
        if (result && !result.ok) setError(result.error);
        return;
      }
      if (!issueId) return;
      const result = await saveIssue(issueId, form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess("ذخیره شد.");
      router.refresh();
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
