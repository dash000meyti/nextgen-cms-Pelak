import { getContentGroupByNumber } from "@nextgen-cms/site-data/get-content";
import { requireFeatureModule } from "@nextgen-cms/site-data/require-feature-module";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArticleListItem } from "@/components/article/ArticleListItem";
import { SectionTitle } from "@/components/article/SectionHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { JalaliDate } from "@/components/ui/JalaliDate";

type ContentGroupPageProps = {
  params: Promise<{ number: string }>;
};

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
  const { number } = await params;
  const group = await getContentGroupByNumber(Number(number));
  if (!group) notFound();

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
        <div className="relative aspect-3/4 w-full max-w-[200px] overflow-hidden rounded bg-rule sm:max-w-none">
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
          <h1 className="font-heading text-2xl text-ink sm:text-3xl md:text-4xl">
            {group.label}
          </h1>
          <p className="text-sm text-ink-muted">
            منتشر شده در <JalaliDate value={group.publishedAt} /> —{" "}
            {group.articleCount.toLocaleString("fa-IR")} محتوا
          </p>
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <SectionTitle title="فهرست محتوای این گروه" />
        <ul>
          {group.articles.map((article, index) => (
            <ArticleListItem
              key={article.slug}
              article={article}
              rank={index + 1}
            />
          ))}
        </ul>
      </div>
    </Container>
  );
}
