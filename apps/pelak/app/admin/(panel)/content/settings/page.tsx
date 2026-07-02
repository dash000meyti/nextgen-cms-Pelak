import { getFirstContentSettingsTabHref } from "@nextgen-cms/studio/admin/content-settings-tabs";
import { redirect } from "next/navigation";

export default function ContentSettingsIndexPage() {
  redirect(getFirstContentSettingsTabHref());
}
