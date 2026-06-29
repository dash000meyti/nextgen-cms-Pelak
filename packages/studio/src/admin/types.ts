export type AdminDashboardStats = {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  archivedArticles: number;
  articlesLast7Days: number;
  articlesLast30Days: number;
  totalAuthors: number;
  totalTopics: number;
  totalContentGroups: number;
  totalVideos: number;
};

export type AdminRecentArticle = {
  id: string;
  slug: string;
  title: string;
  status: string;
  publishedAt: string | null;
  updatedAt: string;
};

export type AdminDashboardData = {
  stats: AdminDashboardStats;
  recentArticles: AdminRecentArticle[];
};
