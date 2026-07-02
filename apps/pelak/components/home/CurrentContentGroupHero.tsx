import type { ArticlePreview } from "@nextgen-cms/contract/types/article";
import type { ContentGroup } from "@nextgen-cms/contract/types/content-group";
import Image from "next/image";
import Link from "next/link";
import { ArticleListItem } from "@/components/article/ArticleListItem";
import { SectionTitle } from "@/components/article/SectionHeader";
import { contentGroupCoverFrameClass } from "@/components/content-group/content-group-cover-aspect";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

type CurrentContentGroupHeroProps = {
  group: ContentGroup;
  featured: ArticlePreview[];
};

export function CurrentContentGroupHero({
  group,
  featured,
}: CurrentContentGroupHeroProps) {
  return (
    <section className="bg-surface">
      <Container className="py-[100px]">
        <div className="grid gap-8 md:grid-cols-[1fr_280px] md:gap-20">
          <div>
            <SectionTitle
              title={group.label}
              action={
                <Button
                  href={`/content-group/${group.number}`}
                  variant="outline"
                >
                  {`مشاهده محتوای شماره ${group.number.toLocaleString("fa-IR")}`}
                </Button>
              }
              bordered={true}
            />
            <ul>
              {featured.slice(0, 3).map((article, index) => (
                <ArticleListItem
                  key={article.slug}
                  article={article}
                  priority={index === 0}
                  authorTone="ink"
                />
              ))}
            </ul>
          </div>

          <div className="self-center">
            <div className="flex items-center justify-between px-2 gap-2 text-base md:text-lg">
              <p className="min-w-0 font-sans leading-none text-ink-muted">
                تعداد محتوا در این شماره :
              </p>
              <span className="inline-flex shrink-0 items-center justify-center rounded-t-full bg-surface-2 px-2.5 py-1 text-base leading-none text-ink-muted tabular-nums md:text-lg">
                {group.articleCount.toLocaleString("fa-IR")}
              </span>
            </div>
            <Link href={`/content-group/${group.number}`} className="block">
              <div
                className={`${contentGroupCoverFrameClass} mx-auto w-full max-w-[220px] sm:max-w-[260px] md:max-w-none`}
              >
                <Image
                  src={group.cover.src}
                  alt={group.cover.alt}
                  fill
                  className="object-cover border border-rule"
                  sizes="(max-width: 768px) 220px, 280px"
                  priority
                />
              </div>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
