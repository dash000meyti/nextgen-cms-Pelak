"use client";

import { useState, useTransition } from "react";
import { FormMessage } from "@/components/admin/studio/FormMessage";

export function DatabaseSettingsPanel() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [snapshotFile, setSnapshotFile] = useState<File | null>(null);
  const [snapshotPending, startSnapshotTransition] = useTransition();
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [snapshotSuccess, setSnapshotSuccess] = useState<string | null>(null);

  const busy = pending || snapshotPending;

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

  function handleExportSnapshot() {
    setSnapshotError(null);
    setSnapshotSuccess(null);
    startSnapshotTransition(async () => {
      const response = await fetch("/api/admin/database/export-snapshot", {
        method: "GET",
      });
      if (!response.ok) {
        setSnapshotError("دانلود پشتیبان کامل ناموفق بود.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `pelak-snapshot-${new Date().toISOString().replaceAll(":", "-")}.tar.gz`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setSnapshotSuccess("پشتیبان کامل (دیتابیس + رسانه‌ها) دانلود شد.");
    });
  }

  function handleImportSnapshot() {
    if (!snapshotFile) {
      setSnapshotError("ابتدا فایل tar.gz پشتیبان کامل را انتخاب کنید.");
      return;
    }
    setSnapshotError(null);
    setSnapshotSuccess(null);
    startSnapshotTransition(async () => {
      const response = await fetch("/api/admin/database/import-snapshot", {
        method: "POST",
        body: snapshotFile,
        headers: { "content-type": "application/gzip" },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setSnapshotError(
          payload?.error ?? "آپلود/بازیابی پشتیبان کامل ناموفق بود.",
        );
        return;
      }
      const uploadsFiles = payload?.uploadsFileCount ?? 0;
      const backupNote = payload?.backupUploadsPath
        ? `رسانه‌های قبلی در ${payload.backupUploadsPath} ذخیره شدند. `
        : "";
      setSnapshotSuccess(
        `${backupNote}پشتیبان کامل بازیابی شد (تعداد رسانه: ${uploadsFiles}). برای اعمال کامل، Container را ری‌استارت کنید.`,
      );
      setSnapshotFile(null);
    });
  }

  return (
    <section className="space-y-8 rounded border border-rule bg-surface p-5">
      <div className="space-y-2">
        <h2 className="font-heading text-lg text-ink">
          پشتیبان و بازیابی پایگاه داده
        </h2>
        <p className="text-sm text-ink-muted">
          دو نوع پشتیبان موجود است: «سریع» فقط دیتابیس را شامل می‌شود و «کامل»
          دیتابیس و همهٔ رسانه‌های آپلودشده را در یک آرشیو tar.gz هماهنگ می‌گیرد.
        </p>
      </div>

      <div className="space-y-4 border-t border-rule pt-4">
        <h3 className="text-sm font-medium text-ink">
          پشتیبان کامل (DB + رسانه‌ها)
        </h3>
        <p className="text-xs text-ink-muted">
          آرشیو tar.gz شامل <code>pelak.sqlite</code>، <code>uploads/</code> و{" "}
          <code>manifest.json</code>. ریستور کامل، دیتابیس و رسانه‌های فعلی را با
          محتوای snapshot جایگزین می‌کند؛ پیش از این یک نسخه پشتیبان خودکار از
          وضعیت فعلی گرفته می‌شود.
        </p>

        <FormMessage error={snapshotError} success={snapshotSuccess} />

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleExportSnapshot}
            disabled={busy}
            className="rounded bg-accent px-4 py-2 text-sm text-paper hover:bg-accent-hover disabled:opacity-50"
          >
            {snapshotPending ? "در حال آماده‌سازی…" : "دانلود پشتیبان کامل"}
          </button>
        </div>

        <div className="space-y-3 border-t border-rule pt-4">
          <label
            htmlFor="snapshot-import"
            className="block text-sm text-ink-muted"
          >
            فایل tar.gz پشتیبان کامل برای بازیابی
          </label>
          <input
            id="snapshot-import"
            type="file"
            accept=".tar.gz,.tgz,application/gzip"
            onChange={(event) =>
              setSnapshotFile(event.target.files?.[0] ?? null)
            }
            className="block w-full text-sm text-ink-muted file:me-3 file:rounded file:border file:border-rule file:bg-paper file:px-3 file:py-2"
          />
          <button
            type="button"
            onClick={handleImportSnapshot}
            disabled={busy || !snapshotFile}
            className="rounded border border-rule px-4 py-2 text-sm text-ink hover:bg-surface-2 disabled:opacity-50"
          >
            {snapshotPending ? "در حال بازیابی…" : "بازیابی از پشتیبان کامل"}
          </button>
        </div>
      </div>

      <div className="space-y-4 border-t border-rule pt-4">
        <h3 className="text-sm font-medium text-ink">
          پشتیبان سریع دیتابیس (فقط DB)
        </h3>
        <p className="text-xs text-ink-muted">
          فقط فایل sqlite را دانلود/ریستور می‌کند. رسانه‌ها شامل نمی‌شوند؛ برای حفظ
          یکپارچگی، از پشتیبان کامل استفاده کنید.
        </p>

        <FormMessage error={error} success={success} />

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleExport}
            disabled={busy}
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
            disabled={busy || !file}
            className="rounded border border-rule px-4 py-2 text-sm text-ink hover:bg-surface-2 disabled:opacity-50"
          >
            {pending ? "در حال بازیابی…" : "بازیابی دیتابیس"}
          </button>
        </div>
      </div>
    </section>
  );
}
