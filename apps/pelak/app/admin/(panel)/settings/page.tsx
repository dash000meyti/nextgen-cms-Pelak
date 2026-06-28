import { redirect } from "next/navigation";
import { getSettingsRedirectHref } from "./layout";

export default async function AdminSettingsIndexPage() {
  redirect(await getSettingsRedirectHref());
}
