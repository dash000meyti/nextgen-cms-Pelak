import { getVideoModuleSettings } from "@nextgen-cms/site-data/get-content";
import { VideoModuleSettingsForm } from "@/components/admin/studio/VideoModuleSettingsForm";

export default async function VideoSettingsPage() {
  const settings = await getVideoModuleSettings();
  return <VideoModuleSettingsForm value={settings} />;
}
