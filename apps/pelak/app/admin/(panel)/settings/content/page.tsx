import { getContentSettings } from "@nextgen-cms/site-data/get-content";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { Metadata } from "next";
import Link from "next/link";
import { ContentSettingsForm } from "@/components/admin/studio/ContentSettingsForm";

export const metadata: Metadata = {
  title: "محتوا — تنظیمات",
  robots: { index: false, follow: false },
};

export default async function ContentSettingsPage() {
  await requirePermission("settings.content");
  const contentSettings = await getContentSettings();

  return (
    <div className="space-y-10">
      <ContentSettingsForm value={contentSettings} />
      <section className="border-t border-rule pt-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg text-ink">موضوعات</h2>
            <p className="mt-1 text-sm text-ink-muted">
              مدیریت دسته‌بندی‌های محتوا
            </p>
          </div>
          <Link
            href="/admin/settings/content/topics"
            className="rounded border border-rule px-4 py-2 text-sm text-ink hover:border-accent hover:text-accent"
          >
            مدیریت موضوعات
          </Link>
        </div>
      </section>
    </div>
  );
}
