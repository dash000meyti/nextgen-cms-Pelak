import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import { listTopicsAdmin } from "@nextgen-cms/studio/cms/queries";
import type { Metadata } from "next";
import Link from "next/link";
import { TopicsAdminList } from "@/components/admin/studio/lists/TopicsAdminList";

export const metadata: Metadata = {
  title: "موضوعات — تنظیمات محتوا",
  robots: { index: false, follow: false },
};

export default async function ContentTopicsPage() {
  await requirePermission("settings.content");
  const topics = await listTopicsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-xl text-ink">موضوعات</h2>
        <Link
          href="/admin/settings/content"
          className="text-sm text-ink-muted hover:text-accent"
        >
          بازگشت به تنظیمات محتوا
        </Link>
      </div>
      <TopicsAdminList topics={topics} />
    </div>
  );
}
