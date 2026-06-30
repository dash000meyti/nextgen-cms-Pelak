import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import { listVideosAdmin } from "@nextgen-cms/studio/cms/queries";
import { VideosAdminList } from "@/components/admin/studio/lists/VideosAdminList";

export default async function AdminVideosPage() {
  await requirePermission("modules.video.view");
  const videos = await listVideosAdmin();

  return <VideosAdminList videos={videos} />;
}
