import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { PlaylistFormData } from "@nextgen-cms/studio/cms/mutations/playlist";
import { getPlaylistForAdmin } from "@nextgen-cms/studio/cms/queries";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlaylistForm } from "@/components/admin/studio/PlaylistForm";

export const metadata: Metadata = {
  title: "ویرایش لیست پخش",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditVideoPlaylistPage({ params }: PageProps) {
  await requirePermission("modules.video.edit");
  const { id } = await params;
  const playlistId = Number.parseInt(id, 10);
  if (Number.isNaN(playlistId)) notFound();
  const playlist = await getPlaylistForAdmin(playlistId);
  if (!playlist) notFound();
  const initial: PlaylistFormData = {
    slug: playlist.slug,
    name: playlist.name,
    description: playlist.description,
    coverSrc: playlist.coverSrc,
    coverAlt: playlist.coverAlt,
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-xl text-ink">ویرایش لیست پخش</h2>
        <Link
          href="/admin/videos/settings/playlists"
          className="text-sm text-ink-muted hover:text-accent"
        >
          بازگشت به لیست‌های پخش
        </Link>
      </div>
      <PlaylistForm mode="edit" playlistId={playlistId} initial={initial} />
    </div>
  );
}
