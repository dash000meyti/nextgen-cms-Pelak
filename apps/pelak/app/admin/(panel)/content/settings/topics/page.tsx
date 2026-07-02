import { listTopicsAdmin } from "@nextgen-cms/studio/cms/queries";
import { TopicsAdminList } from "@/components/admin/studio/lists/TopicsAdminList";

export default async function ContentSettingsTopicsPage() {
  const topics = await listTopicsAdmin();

  return <TopicsAdminList topics={topics} />;
}
