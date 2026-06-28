import { normalizeFolderPath } from "@nextgen-cms/contract/media/folder-path";
import {
  canDeleteAsset,
  canReadFolder,
} from "@nextgen-cms/studio/admin/media-access";
import { getMemberSession } from "@nextgen-cms/studio/admin/session";
import {
  canUploadToFolder,
  getMediaBrowseContext,
  getMediaFolders,
  listMedia,
} from "@nextgen-cms/studio/cms/queries/media";
import { redirect } from "next/navigation";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";

type AdminMediaPageProps = {
  searchParams: Promise<{ folder?: string }>;
};

export default async function AdminMediaPage({
  searchParams,
}: AdminMediaPageProps) {
  const session = await getMemberSession();
  if (!session) redirect("/admin/login");

  const browseContext = await getMediaBrowseContext(session);
  const params = await searchParams;
  const requestedFolder = params.folder
    ? normalizeFolderPath(params.folder)
    : browseContext.defaultFolder;

  const folder = canReadFolder(
    session,
    requestedFolder,
    browseContext.ownedContentIds,
  )
    ? requestedFolder
    : browseContext.defaultFolder;

  if (params.folder && folder !== requestedFolder) {
    redirect(`/admin/media?folder=${encodeURIComponent(folder)}`);
  }

  const [assets, subfolders] = await Promise.all([
    listMedia({ folder }),
    getMediaFolders(folder.replace(/\/$/, "")),
  ]);

  const deletableIds = assets
    .filter((asset) =>
      canDeleteAsset(session, asset, browseContext.ownedContentIds),
    )
    .map((asset) => asset.id);

  const canUpload = canUploadToFolder(
    session,
    folder,
    browseContext.ownedContentIds,
  );

  return (
    <MediaLibrary
      folder={folder}
      assets={assets}
      subfolders={subfolders}
      canUpload={canUpload}
      deletableIds={deletableIds}
    />
  );
}
