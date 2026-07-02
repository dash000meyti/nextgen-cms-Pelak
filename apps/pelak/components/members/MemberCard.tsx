import type { Author } from "@nextgen-cms/contract/types/article";
import Image from "next/image";
import Link from "next/link";

type MemberCardProps = {
  member: Author;
};

export function MemberCard({ member }: MemberCardProps) {
  return (
    <Link
      href={`/members/${member.slug}`}
      className="group flex gap-4 border border-rule bg-surface/50 p-5 transition-colors hover:border-accent"
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded bg-rule">
        <Image
          src={member.avatar.src}
          alt={member.avatar.alt}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          sizes="64px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="font-heading text-base text-ink transition-colors group-hover:text-accent">
          {member.name}
        </h2>
        {member.role ? (
          <p className="mt-1 text-xs text-accent">{member.role}</p>
        ) : null}
        {member.bio ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">
            {member.bio}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
