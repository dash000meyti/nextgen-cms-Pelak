import {
  getArticlesByMember,
  getMemberBySlug,
  getSiteConfig,
} from "@nextgen-cms/site-data/get-content";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleCardGrid } from "@/components/article/ArticleCardGrid";
import { SectionTitle } from "@/components/article/SectionHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { SocialLinks } from "@/components/ui/SocialLinks";

type MemberPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: MemberPageProps): Promise<Metadata> {
  const { slug } = await params;
  const member = await getMemberBySlug(slug);
  if (!member) return { title: "عضو یافت نشد" };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hokmran.example";

  return {
    title: member.name,
    description: member.bio,
    alternates: {
      canonical: `${baseUrl}/members/${slug}`,
    },
    openGraph: { title: member.name, description: member.bio },
  };
}

export default async function MemberPage({ params }: MemberPageProps) {
  const { slug } = await params;
  const [member, articles, siteConfig] = await Promise.all([
    getMemberBySlug(slug),
    getArticlesByMember(slug),
    getSiteConfig(),
  ]);

  if (!member) notFound();

  const socials = member.social
    ? siteConfig.socialLinks.filter((link) =>
        Object.keys(member.social ?? {}).includes(link.id),
      )
    : [];

  return (
    <Container className="py-8 md:py-14">
      <Breadcrumbs
        items={[{ label: "خانه", href: "/" }, { label: member.name }]}
      />

      <div className="mt-6 grid gap-6 border-b border-rule pb-10 sm:grid-cols-[140px_1fr] sm:gap-8 md:grid-cols-[160px_1fr]">
        <div className="relative aspect-square w-28 overflow-hidden rounded bg-rule sm:w-36 md:w-40">
          <Image
            src={member.avatar.src}
            alt={member.avatar.alt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 112px, 160px"
            priority
          />
        </div>
        <div className="space-y-3">
          <h1 className="font-heading text-2xl text-ink sm:text-3xl">
            {member.name}
          </h1>
          <p className="text-sm text-accent">{member.role}</p>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
            {member.bio}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm text-ink-muted">
              {member.articleCount.toLocaleString("fa-IR")} محتوا
            </span>
            {socials.length > 0 ? <SocialLinks links={socials} /> : null}
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-8">
        <SectionTitle title="محتوای این عضو" />
        <ArticleCardGrid columns={3}>
          {articles.map((article, index) => (
            <ArticleCard
              key={article.slug}
              article={article}
              priority={index < 3}
            />
          ))}
        </ArticleCardGrid>
      </div>
    </Container>
  );
}
