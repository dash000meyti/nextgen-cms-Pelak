import { sectionAdminLabels } from "@nextgen-cms/contract/modules/labels";
import { todayIsoIran } from "@nextgen-cms/core/platform/datetime";
import { getVideoModuleSettings } from "@nextgen-cms/site-data/get-content";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { VideoFormData } from "@nextgen-cms/studio/cms/mutations/video";
import { findPlaylistsForPicker } from "@nextgen-cms/studio/cms/queries";
import { VideoForm } from "@/components/admin/studio/VideoForm";

const EMPTY_FORM: VideoFormData = {
  slug: "",
  title: "",
  description: "",
  duration: "",
  status: "draft",
  linkSource: "thumbnail",
  externalLink: "",
  aparatUrl: "",
  thumbnailSrc: "",
  thumbnailAlt: "",
  publishedAt: todayIsoIran(),
  playlistIds: [],
};

export default async function NewVideoPage() {
  await requirePermission("modules.video.create");
  const [settings, playlists] = await Promise.all([
    getVideoModuleSettings(),
    findPlaylistsForPicker(),
  ]);
  const labels = sectionAdminLabels(settings.pageTitle);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl text-ink">{labels.newItem}</h1>
      <VideoForm
        mode="create"
        initial={EMPTY_FORM}
        playlistOptions={playlists}
      />
    </div>
  );
}
