import { buildContentGroupShortPath } from "@nextgen-cms/contract/short-links";
import {
  getAllContentGroupNumbers,
  getContentGroupByNumber,
  getContentGroupModuleSettings,
  getSiteConfig,
} from "@nextgen-cms/site-data/get-content";
import { requireFeatureModule } from "@nextgen-cms/site-data/require-feature-module";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArticleListItem } from "@/components/article/ArticleListItem";
import { SectionTitle } from "@/components/article/SectionHeader";
import { ContentGroupEditionNav } from "@/components/content-group/ContentGroupEditionNav";
import { contentGroupCoverFrameClass } from "@/components/content-group/content-group-cover-aspect";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { JalaliDate } from "@/components/ui/JalaliDate";
import { ShareBar } from "@/components/ui/ShareBar";

type ContentGroupPageProps = {
  params: Promise<{ number: string }>;
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hokmran.example";

function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${baseUrl}${path}`;
}

function adjacentContentGroupNumbers(
  numbers: number[],
  current: number,
): { prevNumber: number | null; nextNumber: number | null } {
  const index = numbers.indexOf(current);
  if (index === -1) return { prevNumber: null, nextNumber: null };

  return {
    prevNumber:
      index < numbers.length - 1 ? (numbers[index + 1] ?? null) : null,
    nextNumber: index > 0 ? (numbers[index - 1] ?? null) : null,
  };
}

export async function generateMetadata({
  params,
}: ContentGroupPageProps): Promise<Metadata> {
  const { number } = await params;
  const [group, siteConfig] = await Promise.all([
    getContentGroupByNumber(Number(number)),
    getSiteConfig(),
  ]);
  if (!group) return { title: "گروه محتوا یافت نشد" };

  const pageUrl = `${baseUrl}/content-group/${group.number}`;
  const description = `${group.label} — ${group.articleCount.toLocaleString("fa-IR")} محتوا`;
  const pdfUrl = group.pdfSrc ? absoluteUrl(group.pdfSrc) : undefined;

  return {
    title: group.label,
    description,
    alternates: {
      canonical: pageUrl,
      ...(pdfUrl
        ? {
            types: {
              "application/pdf": pdfUrl,
            },
          }
        : {}),
    },
    openGraph: {
      type: "website",
      url: pageUrl,
      siteName: siteConfig.name,
      title: group.label,
      description,
      images: [
        {
          url: absoluteUrl(group.cover.src),
          alt: group.cover.alt,
        },
      ],
    },
  };
}

export default async function ContentGroupPage({
  params,
}: ContentGroupPageProps) {
  await requireFeatureModule("contentGroup");
  const { number: numberParam } = await params;
  const number = Number(numberParam);
  const [group, allNumbers, contentGroupModuleSettings, siteConfig] =
    await Promise.all([
      getContentGroupByNumber(number),
      getAllContentGroupNumbers(),
      getContentGroupModuleSettings(),
      getSiteConfig(),
    ]);
  if (!group) notFound();

  const pageUrl = `${baseUrl}/content-group/${group.number}`;
  const pdfUrl = group.pdfSrc ? absoluteUrl(group.pdfSrc) : undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PublicationIssue",
    name: group.label,
    issueNumber: group.number,
    datePublished: group.publishedAt,
    url: pageUrl,
    isPartOf: {
      "@type": "Periodical",
      name: contentGroupModuleSettings.pageTitle,
      publisher: {
        "@type": "Organization",
        name: siteConfig.name,
      },
    },
    ...(pdfUrl
      ? {
          associatedMedia: {
            "@type": "MediaObject",
            contentUrl: pdfUrl,
            encodingFormat: "application/pdf",
          },
        }
      : {}),
  };

  const { prevNumber, nextNumber } = adjacentContentGroupNumbers(
    allNumbers,
    number,
  );

  const [prevGroup, nextGroup] = await Promise.all([
    prevNumber != null ? getContentGroupByNumber(prevNumber) : undefined,
    nextNumber != null ? getContentGroupByNumber(nextNumber) : undefined,
  ]);

  return (
    <Container className="py-8 md:py-14">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires inline script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: "خانه", href: "/" },
          { label: "گروه‌های محتوا", href: "/content-group" },
          { label: group.label },
        ]}
      />

      <div className="mt-6 grid gap-6 border-b border-rule pb-10 sm:grid-cols-[200px_1fr] sm:gap-10 md:grid-cols-[260px_1fr] md:gap-14">
        <div
          className={`${contentGroupCoverFrameClass} w-full max-w-[200px] sm:max-w-none`}
        >
          <Image
            src={group.cover.src}
            alt={group.cover.alt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 200px, 260px"
            priority
          />
        </div>
        <div className="space-y-3 self-center">
          <h1 className="text-page-title">{group.label}</h1>
          <p className="text-meta">
            منتشر شده در <JalaliDate value={group.publishedAt} /> —{" "}
            {group.articleCount.toLocaleString("fa-IR")} محتوا
          </p>
          <ShareBar
            title={group.label}
            shareUrl={buildContentGroupShortPath(number)}
            pdfDownloadUrl={group.pdfSrc ?? undefined}
          />
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <SectionTitle
          title={`فهرست محتوای این ${contentGroupModuleSettings.pageTitle}`}
        />
        {group.articles.length > 0 ? (
          <ul>
            {group.articles.map((article, index) => (
              <ArticleListItem
                key={article.slug}
                article={article}
                rank={index + 1}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">
            هنوز محتوایی در این گروه منتشر نشده است.
          </p>
        )}
        <ContentGroupEditionNav
          prev={
            prevGroup
              ? { number: prevGroup.number, cover: prevGroup.cover }
              : null
          }
          next={
            nextGroup
              ? { number: nextGroup.number, cover: nextGroup.cover }
              : null
          }
        />
      </div>
    </Container>
  );
}
