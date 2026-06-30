import { normalizeFolderPath } from "@nextgen-cms/contract/media/folder-path";
import {
  canBrowseMediaRoot,
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

  let browseFolder = "";
  if (params.folder !== undefined) {
    const requestedFolder = normalizeFolderPath(params.folder);
    if (
      !canReadFolder(
        session,
        requestedFolder,
        browseContext.ownedContentIds,
      )
    ) {
      redirect("/admin/media");
    }
    browseFolder = requestedFolder;
  } else if (!canBrowseMediaRoot(session)) {
    redirect(
      `/admin/media?folder=${encodeURIComponent(browseContext.defaultFolder)}`,
    );
  }

  const uploadFolder = browseFolder || browseContext.defaultFolder;

  const [assets, subfolders] = await Promise.all([
    browseFolder ? listMedia({ folder: browseFolder }) : Promise.resolve([]),
    getMediaFolders(browseFolder ? browseFolder.replace(/\/$/, "") : undefined),
  ]);

  const deletableIds = assets
    .filter((asset) =>
      canDeleteAsset(session, asset, browseContext.ownedContentIds),
    )
    .map((asset) => asset.id);

  const canUpload = canUploadToFolder(
    session,
    uploadFolder,
    browseContext.ownedContentIds,
  );

  return (
    <MediaLibrary
      browseFolder={browseFolder}
      uploadFolder={uploadFolder}
      assets={assets}
      subfolders={subfolders}
      canUpload={canUpload}
      deletableIds={deletableIds}
    />
  );
}
