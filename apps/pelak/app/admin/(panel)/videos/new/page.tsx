import { todayIsoIran } from "@nextgen-cms/core/platform/datetime";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { VideoFormData } from "@nextgen-cms/studio/cms/mutations/video";
import { VideoForm } from "@/components/admin/studio/VideoForm";

const EMPTY_FORM: VideoFormData = {
  slug: "",
  title: "",
  description: "",
  duration: "",
  thumbnailSrc: "",
  thumbnailAlt: "",
  publishedAt: todayIsoIran(),
};

export default async function NewVideoPage() {
  await requirePermission("modules.video.create");

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl text-ink">ویدیو جدید</h1>
      <VideoForm mode="create" initial={EMPTY_FORM} />
    </div>
  );
}
