import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { PlaylistFormData } from "@nextgen-cms/studio/cms/mutations/playlist";
import type { Metadata } from "next";
import Link from "next/link";
import { PlaylistForm } from "@/components/admin/studio/PlaylistForm";

export const metadata: Metadata = {
  title: "لیست پخش جدید",
  robots: { index: false, follow: false },
};

const EMPTY_FORM: PlaylistFormData = {
  slug: "",
  name: "",
  description: "",
  coverSrc: "",
  coverAlt: "",
};

export default async function NewVideoPlaylistPage() {
  await requirePermission("modules.video.edit");
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-xl text-ink">لیست پخش جدید</h2>
        <Link
          href="/admin/videos/settings/playlists"
          className="text-sm text-ink-muted hover:text-accent"
        >
          بازگشت به لیست‌های پخش
        </Link>
      </div>
      <PlaylistForm mode="create" initial={EMPTY_FORM} />
    </div>
  );
}
