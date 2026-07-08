import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import { listVideosAdmin } from "@nextgen-cms/studio/cms/queries";
import { VideosAdminList } from "@/components/admin/studio/lists/VideosAdminList";

type VideoAdminPageProps = {
  searchParams: Promise<{
    status?: "draft" | "published" | "archived" | "all";
  }>;
};

export default async function AdminVideosPage({
  searchParams,
}: VideoAdminPageProps) {
  await requirePermission("modules.video.view");
  const params = await searchParams;
  const status = params.status ?? "all";
  const videos = await listVideosAdmin(status);

  return <VideosAdminList videos={videos} status={status} />;
}
