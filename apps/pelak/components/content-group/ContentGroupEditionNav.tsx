import type { ImageMeta } from "@nextgen-cms/contract/types/article";
import Image from "next/image";
import Link from "next/link";
import { contentGroupCoverFrameClass } from "@/components/content-group/content-group-cover-aspect";

type ContentGroupEditionEdge = {
  slug: string;
  title: string;
  cover: ImageMeta;
};

type ContentGroupEditionNavProps = {
  prev: ContentGroupEditionEdge | null;
  next: ContentGroupEditionEdge | null;
};

function ChevronIcon({ direction }: { direction: "start" | "end" }) {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      {direction === "start" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
      )}
    </svg>
  );
}

function EditionCover({ cover }: { cover: ImageMeta }) {
  return (
    <div
      className={`${contentGroupCoverFrameClass} w-14 shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-[1.03] sm:w-16`}
    >
      <Image
        src={cover.src}
        alt={cover.alt}
        fill
        className="object-cover"
        sizes="64px"
      />
    </div>
  );
}

function EditionLink({
  href,
  label,
  title,
  cover,
  direction,
  align,
}: {
  href: string;
  label: string;
  title: string;
  cover: ImageMeta;
  direction: "start" | "end";
  align: "start" | "end";
}) {
  const text = (
    <div
      className={`flex flex-col gap-1 ${align === "end" ? "items-end text-end" : "items-start"}`}
    >
      <span className="flex items-center gap-1.5 text-xs text-ink-muted group-hover:text-accent">
        {direction === "end" ? (
          <>
            <ChevronIcon direction="end" />
            {label}
          </>
        ) : (
          <>
            {label}
            <ChevronIcon direction="start" />
          </>
        )}
      </span>
      <span className="line-clamp-2 font-heading text-sm text-ink transition-colors group-hover:text-accent">
        {title}
      </span>
    </div>
  );

  return (
    <Link
      href={href}
      className="group flex max-w-[calc(50%-0.75rem)] items-center gap-3 transition-colors hover:text-accent sm:max-w-none sm:gap-4"
    >
      {align === "end" ? (
        <>
          {text}
          <EditionCover cover={cover} />
        </>
      ) : (
        <>
          <EditionCover cover={cover} />
          {text}
        </>
      )}
    </Link>
  );
}

function EditionBoundary({
  label,
  text,
  direction,
  align,
}: {
  label: string;
  text: string;
  direction: "start" | "end";
  align: "start" | "end";
}) {
  const textContent = (
    <div
      className={`flex flex-col gap-1 ${align === "end" ? "items-end text-end" : "items-start"}`}
    >
      <span className="flex items-center gap-1.5 text-xs text-ink-faint">
        {direction === "end" ? (
          <>
            <ChevronIcon direction="end" />
            {label}
          </>
        ) : (
          <>
            {label}
            <ChevronIcon direction="start" />
          </>
        )}
      </span>
      <span className="font-heading text-lg text-ink-faint">{text}</span>
    </div>
  );

  const coverPlaceholder = (
    <div
      aria-hidden="true"
      className={`${contentGroupCoverFrameClass} w-14 shrink-0 rounded-md border border-rule/40 bg-surface sm:w-16`}
    />
  );

  return (
    <div
      className={`flex max-w-[calc(50%-0.75rem)] items-center gap-3 sm:max-w-none sm:gap-4 ${align === "end" ? "justify-end" : "justify-start"}`}
    >
      {align === "end" ? (
        <>
          {textContent}
          {coverPlaceholder}
        </>
      ) : (
        <>
          {coverPlaceholder}
          {textContent}
        </>
      )}
    </div>
  );
}

export function ContentGroupEditionNav({
  prev,
  next,
}: ContentGroupEditionNavProps) {
  return (
    <nav
      aria-label="ناوبری نسخه‌های گروه محتوا"
      className="mt-8 flex items-center justify-between gap-4 border-t border-rule pt-8 sm:items-start"
    >
      {prev != null ? (
        <EditionLink
          href={`/content-group/${prev.slug}`}
          label="نسخه قبلی"
          title={prev.title}
          cover={prev.cover}
          direction="end"
          align="start"
        />
      ) : (
        <EditionBoundary
          label="نسخه قبلی"
          text="اولین نسخه"
          direction="end"
          align="start"
        />
      )}

      {next != null ? (
        <EditionLink
          href={`/content-group/${next.slug}`}
          label="نسخه بعدی"
          title={next.title}
          cover={next.cover}
          direction="start"
          align="end"
        />
      ) : (
        <EditionBoundary
          label="نسخه بعدی"
          text="به زودی"
          direction="start"
          align="end"
        />
      )}
    </nav>
  );
}
