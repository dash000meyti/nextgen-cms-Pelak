"use client";

import { useState, useTransition } from "react";
import { FormMessage } from "@/components/admin/studio/FormMessage";

export function DatabaseSettingsPanel() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  function handleExport() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const response = await fetch("/api/admin/database/export", {
        method: "GET",
      });
      if (!response.ok) {
        setError("دانلود فایل پشتیبان ناموفق بود.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `pelak-backup-${new Date().toISOString().replaceAll(":", "-")}.sqlite`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setSuccess("فایل پشتیبان دانلود شد.");
    });
  }

  function handleImport() {
    if (!file) {
      setError("ابتدا فایل sqlite را انتخاب کنید.");
      return;
    }
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("database", file);
      const response = await fetch("/api/admin/database/import", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload?.error ?? "آپلود/بازیابی دیتابیس ناموفق بود.");
        return;
      }
      setSuccess("دیتابیس با موفقیت بازیابی شد.");
      setFile(null);
    });
  }

  return (
    <section className="space-y-6 rounded border border-rule bg-surface p-5">
      <div className="space-y-2">
        <h2 className="font-heading text-lg text-ink">
          پشتیبان و بازیابی دیتابیس
        </h2>
        <p className="text-sm text-ink-muted">
          قبل از بازیابی، یک نسخه پشتیبان از دیتابیس فعلی گرفته می‌شود.
        </p>
      </div>

      <FormMessage error={error} success={success} />

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleExport}
          disabled={pending}
          className="rounded bg-accent px-4 py-2 text-sm text-paper hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "در حال آماده‌سازی…" : "دانلود پشتیبان دیتابیس"}
        </button>
      </div>

      <div className="space-y-3 border-t border-rule pt-4">
        <label
          htmlFor="database-import"
          className="block text-sm text-ink-muted"
        >
          فایل sqlite برای بازیابی
        </label>
        <input
          id="database-import"
          type="file"
          accept=".sqlite,.db,application/octet-stream"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="block w-full text-sm text-ink-muted file:me-3 file:rounded file:border file:border-rule file:bg-paper file:px-3 file:py-2"
        />
        <button
          type="button"
          onClick={handleImport}
          disabled={pending || !file}
          className="rounded border border-rule px-4 py-2 text-sm text-ink hover:bg-surface-2 disabled:opacity-50"
        >
          {pending ? "در حال بازیابی…" : "بازیابی دیتابیس"}
        </button>
      </div>
    </section>
  );
}
