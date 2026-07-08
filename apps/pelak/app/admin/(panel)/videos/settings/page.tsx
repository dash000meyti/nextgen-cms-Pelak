import { getFirstVideoSettingsTabHref } from "@nextgen-cms/studio/admin/video-settings-tabs";
import { redirect } from "next/navigation";

export default function VideoSettingsIndexPage() {
  redirect(getFirstVideoSettingsTabHref());
}
