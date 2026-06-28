import type { ArticlePreview } from "@nextgen-cms/contract/types/article";
import type { Issue } from "@nextgen-cms/contract/types/issue";
import Image from "next/image";
import Link from "next/link";
import { ArticleListItem } from "@/components/article/ArticleListItem";
import { SectionTitle } from "@/components/article/SectionHeader";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

type CurrentIssueHeroProps = {
  issue: Issue;
  featured: ArticlePreview[];
};

export function CurrentIssueHero({ issue, featured }: CurrentIssueHeroProps) {
  const lead = featured[0];

  return (
    <Container className="py-8 md:py-14">
      <div className="grid gap-8 md:grid-cols-[280px_1fr] md:gap-14">
        {/* Issue cover */}
        <div className="space-y-4">
          <Link href={`/issues/${issue.number}`} className="block">
            <div className="relative mx-auto aspect-3/4 w-full max-w-[220px] overflow-hidden rounded bg-rule sm:max-w-[260px] md:max-w-none">
              <Image
                src={issue.cover.src}
                alt={issue.cover.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 220px, 280px"
                priority
              />
            </div>
          </Link>
          <div className="space-y-2 text-center md:text-start">
            <p className="font-heading text-base text-ink md:text-lg">
              {issue.label}
            </p>
            <p className="text-sm text-ink-muted">
              {issue.articleCount} محتوا در این شماره
            </p>
            <div className="md:text-start">
              <Button href={`/issues/${issue.number}`} variant="outline">
                مشاهده شماره
              </Button>
            </div>
          </div>
        </div>

        {/* Lead + list */}
        <div className="space-y-6">
          <SectionTitle title="شمارهٔ جدید" />
          {lead ? (
            <article className="group space-y-3 border-b border-rule pb-8 sm:space-y-4">
              <Link href={`/content/${lead.slug}`}>
                <h2 className="font-heading text-2xl leading-tight text-ink transition-colors group-hover:text-accent md:text-4xl">
                  {lead.title}
                </h2>
                <p className="mt-2 text-base leading-relaxed text-ink-muted md:mt-3 md:text-lg">
                  {lead.subtitle}
                </p>
              </Link>
              <p className="text-sm text-ink-muted">
                {lead.authors.map((author) => author.name).join(" و ")}
              </p>
            </article>
          ) : null}

          <ul>
            {featured.slice(1, 4).map((article, index) => (
              <ArticleListItem
                key={article.slug}
                article={article}
                rank={index + 2}
              />
            ))}
          </ul>
        </div>
      </div>
    </Container>
  );
}
