import { listPlaylistsAdmin } from "@nextgen-cms/studio/cms/queries";
import { PlaylistsAdminList } from "@/components/admin/studio/lists/PlaylistsAdminList";

export default async function VideoPlaylistsSettingsPage() {
  const playlists = await listPlaylistsAdmin();
  return <PlaylistsAdminList playlists={playlists} />;
}
