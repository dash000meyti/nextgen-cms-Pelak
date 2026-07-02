import { getContentSettings } from "@nextgen-cms/site-data/get-content";
import { ContentSettingsForm } from "@/components/admin/studio/ContentSettingsForm";

export default async function ContentSettingsContentPage() {
  const contentSettings = await getContentSettings();

  return <ContentSettingsForm value={contentSettings} />;
}
