import { buildContentGroupShortPath } from "@nextgen-cms/contract/short-links";
import {
  getAllContentGroupNumbers,
  getContentGroupByNumber,
  getContentGroupModuleSettings,
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
  const group = await getContentGroupByNumber(Number(number));
  if (!group) return { title: "گروه محتوا یافت نشد" };
  return { title: group.label };
}

export default async function ContentGroupPage({
  params,
}: ContentGroupPageProps) {
  await requireFeatureModule("contentGroup");
  const { number: numberParam } = await params;
  const number = Number(numberParam);
  const [group, allNumbers, contentGroupModuleSettings] = await Promise.all([
    getContentGroupByNumber(number),
    getAllContentGroupNumbers(),
    getContentGroupModuleSettings(),
  ]);
  if (!group) notFound();

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
        <SectionTitle title={`فهرست محتوای این ${contentGroupModuleSettings.pageTitle}`} />
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
