import Image from "next/image";

type AvatarProps = {
  src: string;
  alt: string;
  name?: string;
  className?: string;
};

function getInitial(name?: string) {
  if (!name) return "؟";
  return name.trim().charAt(0) || "؟";
}

export function Avatar({ src, alt, name, className = "size-6" }: AvatarProps) {
  const hasImage = src.trim().length > 0;

  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full bg-rule ${className}`.trim()}
      aria-hidden={hasImage ? true : undefined}
    >
      {hasImage ? (
        <Image src={src} alt={alt} fill className="object-cover" sizes="48px" />
      ) : (
        <span className="flex size-full items-center justify-center font-heading text-[0.55em] text-ink-muted">
          {getInitial(name)}
        </span>
      )}
    </span>
  );
}
