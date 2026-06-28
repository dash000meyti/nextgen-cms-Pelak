import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import * as schema from "@nextgen-cms/core/db/schema";
import {
  shouldRunSeed,
  shouldSeedForce,
} from "@nextgen-cms/core/platform/first-boot";
import {
  isPlatformInstalled,
  setPlatformMeta,
} from "@nextgen-cms/core/platform/meta";
import { resolveSqlitePath } from "@nextgen-cms/core/platform/paths";
import {
  CORE_VERSION,
  getSchemaRevision,
} from "@nextgen-cms/core/platform/version";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { articles as mockArticles } from "./fixtures/articles";
import { authors as mockAuthors } from "./fixtures/authors";
import { issues as mockIssues } from "./fixtures/issues";
import { defaultRolePermissions, systemRoles } from "./fixtures/rbac";
import { siteConfig as mockSiteConfig } from "./fixtures/site-config";
import {
  DEFAULT_CONTENT_SETTINGS,
  DEFAULT_MEDIA_SETTINGS,
  DEFAULT_MEMBER_SETTINGS,
  DEFAULT_MODULE_SETTINGS,
  featureModulesFixture,
  themeTokensFixture,
} from "./fixtures/theme-tokens";
import { topics as mockTopics } from "./fixtures/topics";
import { videos as mockVideos } from "./fixtures/videos";

const sqlitePath = resolveSqlitePath();
const force = shouldSeedForce();

mkdirSync(dirname(sqlitePath), { recursive: true });

const sqlite = new Database(sqlitePath);
const db = drizzle(sqlite, { schema });
const now = new Date().toISOString();

if (!shouldRunSeed(db, sqlite) && !force) {
  console.log(
    "Seed skipped. Set FIRST_BOOT=1, pass --first-boot, or use --force.",
  );
  sqlite.close();
  process.exit(0);
}

const existingAuthors = sqlite
  .prepare("SELECT COUNT(*) as count FROM authors")
  .get() as { count: number };

if (existingAuthors.count > 0 && !force) {
  if (!isPlatformInstalled(db)) {
    setPlatformMeta(db, {
      core_version: CORE_VERSION,
      installed_at: now,
      schema_revision: getSchemaRevision(),
    });
    console.log("Backfilled platform_meta for existing installation.");
  } else {
    console.log("Database already seeded. Use --force to re-seed.");
  }
  sqlite.close();
  process.exit(0);
}

if (force) {
  const tables = [
    "platform_meta",
    "most_read_entries",
    "article_topics",
    "article_authors",
    "articles",
    "videos",
    "issues",
    "topics",
    "authors",
    "site_settings",
    "theme_tokens",
    "member_sessions",
    "members",
    "role_permissions",
    "roles",
    "admin_sessions",
    "admin_users",
  ];
  for (const table of tables) {
    sqlite.exec(`DELETE FROM ${table}`);
  }
}

const roleIdBySlug = new Map<string, number>();
for (const role of systemRoles) {
  const result = db
    .insert(schema.roles)
    .values({
      slug: role.slug,
      name: role.name,
      isSystem: role.isSystem,
      description: role.description,
    })
    .returning({ id: schema.roles.id })
    .all();
  const roleId = result[0].id;
  roleIdBySlug.set(role.slug, roleId);

  const permissions =
    defaultRolePermissions[role.slug as keyof typeof defaultRolePermissions];
  for (const permission of permissions) {
    db.insert(schema.rolePermissions).values({ roleId, permission }).run();
  }
}

const writerRoleId = roleIdBySlug.get("writer");
if (!writerRoleId) {
  throw new Error("Writer role not seeded");
}

const authorIdBySlug = new Map<string, number>();
for (const author of mockAuthors) {
  const result = db
    .insert(schema.authors)
    .values({
      slug: author.slug,
      name: author.name,
      role: author.role,
      bio: author.bio,
      avatarSrc: author.avatar.src,
      avatarAlt: author.avatar.alt,
      socialTwitter: author.social?.twitter ?? null,
      socialTelegram: author.social?.telegram ?? null,
      socialInstagram: author.social?.instagram ?? null,
    })
    .returning({ id: schema.authors.id })
    .all();
  authorIdBySlug.set(author.slug, result[0].id);
}

const memberIdBySlug = new Map<string, number>();
const writerPassword = process.env.WRITER_PASSWORD ?? "writer123";
const writerPasswordHash = bcrypt.hashSync(writerPassword, 12);
const writerTestAccounts: Record<string, string> = {
  "mohammad-shirkound": "writer1@hokmran.example",
  "yaser-jebraeili": "writer2@hokmran.example",
};

for (const author of mockAuthors) {
  const authorId = authorIdBySlug.get(author.slug);
  if (!authorId) continue;

  const testEmail = writerTestAccounts[author.slug];

  const result = db
    .insert(schema.members)
    .values({
      email: testEmail ?? null,
      passwordHash: testEmail ? writerPasswordHash : null,
      slug: author.slug,
      name: author.name,
      displayRole: author.role,
      bio: author.bio,
      avatarSrc: author.avatar.src,
      avatarAlt: author.avatar.alt,
      socialTwitter: author.social?.twitter ?? null,
      socialTelegram: author.social?.telegram ?? null,
      socialInstagram: author.social?.instagram ?? null,
      roleId: writerRoleId,
      isActive: true,
      legacyAuthorId: authorId,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: schema.members.id })
    .all();
  memberIdBySlug.set(author.slug, result[0].id);
}

const fallbackOwnerMemberId = memberIdBySlug.get("mohammad-shirkound");
if (!fallbackOwnerMemberId) {
  throw new Error("Fallback article owner member not seeded");
}

const topicIdBySlug = new Map<string, number>();
for (const topic of mockTopics) {
  const result = db
    .insert(schema.topics)
    .values({
      slug: topic.slug,
      name: topic.name,
      description: topic.description,
    })
    .returning({ id: schema.topics.id })
    .all();
  topicIdBySlug.set(topic.slug, result[0].id);
}

for (const issue of mockIssues) {
  db.insert(schema.issues)
    .values({
      number: issue.number,
      season: issue.season,
      year: issue.year,
      label: issue.label,
      coverSrc: issue.cover.src,
      coverAlt: issue.cover.alt,
      publishedAt: issue.publishedAt,
    })
    .run();
}

const articleIdBySlug = new Map<string, number>();
for (const article of mockArticles) {
  const primaryAuthorSlug = article.authors[0]?.slug;
  const createdByMemberId =
    (primaryAuthorSlug ? memberIdBySlug.get(primaryAuthorSlug) : undefined) ??
    fallbackOwnerMemberId;

  const result = db
    .insert(schema.articles)
    .values({
      slug: article.slug,
      title: article.title,
      subtitle: article.subtitle,
      excerpt: article.excerpt,
      status: "published",
      publishedAt: article.publishedAt,
      readingMinutes: article.readingMinutes,
      heroSrc: article.heroImage.src,
      heroAlt: article.heroImage.alt,
      heroCaption: article.heroImage.caption ?? null,
      heroCredit: article.heroImage.credit ?? null,
      issueNumber: article.issueNumber ?? null,
      isFeatured: article.isFeatured ?? false,
      isEditorsPick: article.isEditorsPick ?? false,
      body: article.body,
      relatedSlugs: article.relatedSlugs,
      createdByMemberId,
      updatedAt: now,
    })
    .returning({ id: schema.articles.id })
    .all();

  const articleId = result[0].id;
  articleIdBySlug.set(article.slug, articleId);

  article.authors.forEach((author, index) => {
    const authorId = authorIdBySlug.get(author.slug);
    if (!authorId) return;
    db.insert(schema.articleAuthors)
      .values({
        articleId,
        authorId,
        sortOrder: index,
      })
      .run();
  });

  article.topics.forEach((topic) => {
    const topicId = topicIdBySlug.get(topic.slug);
    if (!topicId) return;
    db.insert(schema.articleTopics)
      .values({
        articleId,
        topicId,
      })
      .run();
  });
}

for (const video of mockVideos) {
  db.insert(schema.videos)
    .values({
      slug: video.slug,
      title: video.title,
      description: video.description,
      duration: video.duration,
      thumbnailSrc: video.thumbnail.src,
      thumbnailAlt: video.thumbnail.alt,
      publishedAt: video.publishedAt,
    })
    .run();
}

const mostReadSlugs = [
  "ekhtiar-baraye-ma",
  "solh-ya-bazarayi",
  "ghorub-washington",
  "payan-amniyat-varedati",
  "pishraft-hasheshe",
  "naft-melli",
  "hezb-madrese",
  "mascan-tire",
  "raz-gol-sorkh",
  "tadaghod-neoliberal",
];

mostReadSlugs.forEach((slug, index) => {
  const articleId = articleIdBySlug.get(slug);
  if (!articleId) return;
  db.insert(schema.mostReadEntries)
    .values({
      articleId,
      sortOrder: index,
    })
    .run();
});

sqlite
  .prepare(
    `INSERT INTO site_settings (
      id, name, tagline, description, logo, default_theme, default_direction,
      typography, nav_sections, utility_links, footer_columns, social_links,
      hot_topics, contact_email, feature_modules, module_settings,
      media_settings, member_settings, content_settings
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
  .run(
    1,
    mockSiteConfig.name,
    mockSiteConfig.tagline,
    mockSiteConfig.description,
    mockSiteConfig.logo,
    mockSiteConfig.defaultTheme,
    mockSiteConfig.defaultDirection,
    JSON.stringify(mockSiteConfig.typography),
    JSON.stringify(mockSiteConfig.navSections),
    JSON.stringify(mockSiteConfig.utilityLinks),
    JSON.stringify(mockSiteConfig.footerColumns),
    JSON.stringify(mockSiteConfig.socialLinks),
    JSON.stringify(mockSiteConfig.hotTopics),
    mockSiteConfig.contactEmail,
    JSON.stringify(featureModulesFixture),
    JSON.stringify(DEFAULT_MODULE_SETTINGS),
    JSON.stringify(DEFAULT_MEDIA_SETTINGS),
    JSON.stringify(DEFAULT_MEMBER_SETTINGS),
    JSON.stringify(DEFAULT_CONTENT_SETTINGS),
  );

sqlite
  .prepare(`INSERT INTO theme_tokens (id, light, dark) VALUES (?, ?, ?)`)
  .run(
    1,
    JSON.stringify(themeTokensFixture.light),
    JSON.stringify(themeTokensFixture.dark),
  );

const adminEmail = process.env.ADMIN_EMAIL ?? "admin@hokmran.example";
const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme123";
const passwordHash = bcrypt.hashSync(adminPassword, 12);
const superAdminRoleId = roleIdBySlug.get("super_admin");
if (!superAdminRoleId) {
  throw new Error("Super admin role not seeded");
}

const adminSlug = adminEmail.includes("@")
  ? adminEmail
      .slice(0, adminEmail.indexOf("@"))
      .toLowerCase()
      .replace(/\./g, "-")
  : "admin";

db.insert(schema.members)
  .values({
    email: adminEmail,
    passwordHash,
    slug: memberIdBySlug.has(adminSlug) ? `admin-${adminSlug}` : adminSlug,
    name: adminSlug,
    displayRole: "",
    bio: "",
    avatarSrc: "",
    avatarAlt: "",
    roleId: superAdminRoleId,
    isActive: true,
    legacyAuthorId: null,
    createdAt: now,
    updatedAt: now,
  })
  .run();

setPlatformMeta(db, {
  core_version: CORE_VERSION,
  installed_at: now,
  schema_revision: getSchemaRevision(),
});

console.log(`Seeded database at ${sqlitePath}`);
console.log(`Admin user: ${adminEmail}`);
console.log("Writer test accounts:");
console.log("  writer1@hokmran.example /", writerPassword);
console.log("  writer2@hokmran.example /", writerPassword);

sqlite.close();
