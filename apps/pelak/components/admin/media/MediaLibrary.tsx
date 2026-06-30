"use client";

import { getFolderBrowseLabel } from "@nextgen-cms/contract/media/folder-display";
import type { MediaAsset } from "@nextgen-cms/contract/types/media";
import {
  deleteMedia,
  uploadMedia,
} from "@nextgen-cms/studio/cms/mutations/media";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { FolderBreadcrumb } from "@/components/admin/media/FolderBreadcrumb";
import { MediaGrid } from "@/components/admin/media/MediaGrid";
import { MediaSettingsTab } from "@/components/admin/media/MediaSettingsTab";
import { FormMessage } from "@/components/admin/studio/FormMessage";

type MediaLibraryProps = {
  browseFolder: string;
  uploadFolder: string;
  assets: MediaAsset[];
  subfolders: string[];
  canUpload: boolean;
  deletableIds: number[];
};

type TabId = "files" | "settings";

export function MediaLibrary({
  browseFolder,
  uploadFolder,
  assets,
  subfolders,
  canUpload,
  deletableIds,
}: MediaLibraryProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<TabId>("files");
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const deletableSet = new Set(deletableIds);

  function handleUpload(file: File) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadMedia(formData, { folder: uploadFolder });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess("فایل آپلود شد.");
      router.refresh();
    });
  }

  function handleDelete(asset: MediaAsset) {
    if (!window.confirm(`«${asset.originalName}» حذف شود؟`)) return;

    setError(null);
    setSuccess(null);
    setDeletingId(asset.id);
    startTransition(async () => {
      const result = await deleteMedia(asset.id);
      setDeletingId(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess("فایل حذف شد.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl text-ink">مدیا</h1>
        {tab === "files" && canUpload ? (
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={pending}
              className="rounded bg-accent px-4 py-2 text-sm text-paper hover:bg-accent-hover disabled:opacity-50"
            >
              {pending ? "در حال آپلود…" : "آپلود"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex gap-2 border-b border-rule">
        <button
          type="button"
          onClick={() => setTab("files")}
          className={`border-b-2 px-3 py-2 text-sm ${
            tab === "files"
              ? "border-accent text-ink"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          فایل‌ها
        </button>
        <button
          type="button"
          onClick={() => setTab("settings")}
          className={`border-b-2 px-3 py-2 text-sm ${
            tab === "settings"
              ? "border-accent text-ink"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          تنظیمات
        </button>
      </div>

      <FormMessage error={error} success={success} />

      {tab === "settings" ? (
        <MediaSettingsTab />
      ) : (
        <div className="space-y-6">
          <FolderBreadcrumb folder={browseFolder} />

          {subfolders.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {subfolders.map((subfolder) => (
                <Link
                  key={subfolder}
                  href={`/admin/media?folder=${encodeURIComponent(subfolder)}`}
                  className="rounded border border-rule bg-surface-2 px-3 py-2 text-sm text-ink hover:border-accent"
                >
                  {getFolderBrowseLabel(browseFolder, subfolder)}
                </Link>
              ))}
            </div>
          ) : null}

          <MediaGrid
            assets={assets}
            onDelete={handleDelete}
            deletingId={deletingId}
            deletableIds={deletableSet}
          />
        </div>
      )}
    </div>
  );
}
