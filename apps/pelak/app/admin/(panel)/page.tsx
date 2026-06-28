import { getAdminDashboardData } from "@nextgen-cms/studio/admin/get-dashboard";
import { AdminRecentArticles } from "@/components/admin/AdminRecentArticles";
import { AdminStatCard } from "@/components/admin/AdminStatCard";

export default async function AdminDashboardPage() {
  const { stats, recentArticles } = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl text-ink">داشبورد</h1>
        <p className="mt-1 text-sm text-ink-muted">نمای کلی محتوای سایت</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="کل محتوا" value={stats.totalArticles} />
        <AdminStatCard label="منتشرشده" value={stats.publishedArticles} />
        <AdminStatCard label="پیش‌نویس" value={stats.draftArticles} />
        <AdminStatCard label="بایگانی" value={stats.archivedArticles} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="محتوای ۷ روز اخیر"
          value={stats.articlesLast7Days}
        />
        <AdminStatCard
          label="محتوای ۳۰ روز اخیر"
          value={stats.articlesLast30Days}
        />
        <AdminStatCard label="اعضا" value={stats.totalAuthors} />
        <AdminStatCard label="موضوعات" value={stats.totalTopics} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <AdminStatCard label="شماره‌ها" value={stats.totalIssues} />
        <AdminStatCard label="ویدیوها" value={stats.totalVideos} />
      </section>

      <section className="rounded-lg border border-rule bg-surface p-6">
        <h2 className="font-heading text-lg text-ink">آخرین محتوا</h2>
        <div className="mt-4">
          <AdminRecentArticles articles={recentArticles} />
        </div>
      </section>
    </div>
  );
}
