import { memberHasEditAllArticles } from "@nextgen-cms/core/db/access/article-permission";
import {
  countArticlesByStatus,
  countArticlesSince,
  findRecentArticlesForAdmin,
} from "@nextgen-cms/core/db/repositories/articles";
import {
  countAuthors,
  countContentGroups,
} from "@nextgen-cms/core/db/repositories/content-groups-public";
import { countTopics } from "@nextgen-cms/core/db/repositories/topics";
import { countVideos } from "@nextgen-cms/core/db/repositories/videos";
import { requireMember } from "@nextgen-cms/studio/admin/require-member";
import type { AdminDashboardData } from "@nextgen-cms/studio/admin/types";

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const session = await requireMember();
  const access = { memberId: session.memberId };

  let recentArticles: Awaited<ReturnType<typeof findRecentArticlesForAdmin>> =
    [];
  try {
    recentArticles = await findRecentArticlesForAdmin(access, 8);
  } catch {
    recentArticles = [];
  }

  const [
    statusCounts,
    articlesLast7Days,
    articlesLast30Days,
    totalAuthors,
    totalTopics,
    totalContentGroups,
    totalVideos,
  ] = await Promise.all([
    countArticlesByStatus(),
    countArticlesSince(7),
    countArticlesSince(30),
    countAuthors(),
    countTopics(),
    countContentGroups(),
    countVideos(),
  ]);

  const editAll = await memberHasEditAllArticles(session.memberId);
  const totalArticles = editAll
    ? statusCounts.draft + statusCounts.published + statusCounts.archived
    : recentArticles.length;

  return {
    stats: {
      totalArticles,
      publishedArticles: editAll ? statusCounts.published : 0,
      draftArticles: editAll
        ? statusCounts.draft
        : recentArticles.filter((a) => a.status === "draft").length,
      archivedArticles: editAll ? statusCounts.archived : 0,
      articlesLast7Days: editAll ? articlesLast7Days : 0,
      articlesLast30Days: editAll ? articlesLast30Days : 0,
      totalAuthors,
      totalTopics,
      totalContentGroups,
      totalVideos,
    },
    recentArticles,
  };
}
