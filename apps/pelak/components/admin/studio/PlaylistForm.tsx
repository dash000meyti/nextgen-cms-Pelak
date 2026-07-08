"use client";

import { useAdminMember } from "@nextgen-cms/studio/admin/admin-member-context";
import {
  createPlaylistAndRedirect,
  deletePlaylist,
  type PlaylistFormData,
  savePlaylist,
} from "@nextgen-cms/studio/cms/mutations/playlist";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImageField } from "@/components/admin/fields/ImageField";
import { SlugField } from "@/components/admin/fields/SlugField";
import { TextareaField } from "@/components/admin/fields/TextareaField";
import { TextField } from "@/components/admin/fields/TextField";
import { FormMessage } from "@/components/admin/studio/FormMessage";
import { useConfirmDialog } from "@/components/admin/studio/useConfirmDialog";

type PlaylistFormProps = {
  mode: "create" | "edit";
  playlistId?: number;
  initial: PlaylistFormData;
};

export function PlaylistForm({ mode, playlistId, initial }: PlaylistFormProps) {
  const router = useRouter();
  const session = useAdminMember();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState(initial);
  const { confirm, dialog } = useConfirmDialog();
  const uploadContext = { memberId: session.memberId };

  function update<K extends keyof PlaylistFormData>(
    key: K,
    value: PlaylistFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      if (mode === "create") {
        const result = await createPlaylistAndRedirect(form);
        if (result && !result.ok) setError(result.error);
        return;
      }
      if (!playlistId) return;
      const result = await savePlaylist(playlistId, form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess("ذخیره شد.");
      router.refresh();
    });
  }

  async function handleDelete() {
    if (!playlistId) return;
    const confirmed = await confirm({
      title: "حذف لیست پخش",
      message: "این عملیات قابل بازگشت نیست.",
      confirmLabel: "حذف",
      cancelLabel: "انصراف",
      variant: "destructive",
    });
    if (!confirmed) return;
    startTransition(async () => {
      const result = await deletePlaylist(playlistId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/videos/settings/playlists");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <FormMessage error={error} success={success} />
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
      <TextareaField
        id="description"
        label="توضیحات"
        value={form.description}
        onChange={(description) => update("description", description)}
        rows={4}
      />
      <ImageField
        id="cover"
        label="کاور لیست پخش"
        src={form.coverSrc}
        alt={form.coverAlt}
        onSrcChange={(coverSrc) => update("coverSrc", coverSrc)}
        onAltChange={(coverAlt) => update("coverAlt", coverAlt)}
        uploadContext={uploadContext}
        required
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="rounded bg-accent px-6 py-2 text-sm text-paper hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "در حال ذخیره…" : mode === "create" ? "ایجاد" : "ذخیره"}
        </button>
        {mode === "edit" ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="rounded border border-danger px-4 py-2 text-sm text-danger hover:bg-danger/10 disabled:opacity-50"
          >
            حذف
          </button>
        ) : null}
      </div>
      {dialog}
    </div>
  );
}
