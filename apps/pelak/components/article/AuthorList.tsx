import type { Author } from "@nextgen-cms/contract/types/article";
import type { SocialLink } from "@nextgen-cms/contract/types/site";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Divider } from "@/components/ui/Divider";
import { SocialLinks } from "@/components/ui/SocialLinks";

type AuthorListProps = {
  authors: Author[];
  socialLinks: SocialLink[];
  memberLabel: string;
  membersLabel: string;
  variant?: "default" | "sidebar";
};

export function AuthorList({
  authors,
  socialLinks,
  memberLabel,
  membersLabel,
  variant = "default",
}: AuthorListProps) {
  const isSidebar = variant === "sidebar";
  const headingLabel = authors.length === 1 ? memberLabel : membersLabel;

  return (
    <section aria-labelledby="authors-heading" className="space-y-6">
      {!isSidebar ? <Divider /> : null}
      <h2 id="authors-heading" className="text-block-title">
        {`درباره ${headingLabel}`}
      </h2>
      <ul className={`grid gap-4 ${isSidebar ? "" : "sm:grid-cols-2"}`}>
        {authors.map((author) => {
          const socials = author.social
            ? socialLinks.filter((link) =>
                Object.keys(author.social ?? {}).includes(link.id),
              )
            : [];
          return (
            <li
              key={author.slug}
              className="flex gap-4 border border-rule bg-surface/50 p-5"
            >
              <Avatar
                src={author.avatar.src}
                alt={author.avatar.alt}
                name={author.name}
                className="size-12 shrink-0 text-xl sm:size-14 sm:text-2xl"
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/members/${author.slug}`}
                  className="font-heading text-base text-ink transition-colors hover:text-accent"
                >
                  {author.name}
                </Link>
                <p className="mt-1 text-xs text-accent">{author.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {author.bio}
                </p>
                {socials.length > 0 ? (
                  <div className="mt-4">
                    <SocialLinks links={socials} />
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
