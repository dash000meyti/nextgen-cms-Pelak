import { sectionAdminLabels } from "@nextgen-cms/contract/modules/labels";
import { getVideoModuleSettings } from "@nextgen-cms/site-data/get-content";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { VideoFormData } from "@nextgen-cms/studio/cms/mutations/video";
import {
  findPlaylistsForPicker,
  getVideoForAdmin,
} from "@nextgen-cms/studio/cms/queries";
import { notFound } from "next/navigation";
import { VideoForm } from "@/components/admin/studio/VideoForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditVideoPage({ params }: PageProps) {
  await requirePermission("modules.video.edit");
  const { id } = await params;
  const videoId = Number.parseInt(id, 10);
  if (Number.isNaN(videoId)) notFound();

  const [video, settings, playlists] = await Promise.all([
    getVideoForAdmin(videoId),
    getVideoModuleSettings(),
    findPlaylistsForPicker(),
  ]);
  if (!video) notFound();
  const labels = sectionAdminLabels(settings.pageTitle);

  const initial: VideoFormData = {
    slug: video.slug,
    title: video.title,
    description: video.description,
    duration: video.duration,
    status: video.status,
    linkSource: video.linkSource,
    externalLink: video.externalLink ?? "",
    aparatUrl: video.aparatUrl ?? "",
    thumbnailSrc: video.thumbnailSrc,
    thumbnailAlt: video.thumbnailAlt,
    publishedAt: video.publishedAt,
    playlistIds: video.playlistIds,
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl text-ink">{labels.editItem}</h1>
      <VideoForm
        mode="edit"
        videoId={videoId}
        initial={initial}
        playlistOptions={playlists}
      />
    </div>
  );
}
