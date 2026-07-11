import { resolveMemberAvatar } from "@nextgen-cms/contract/media/member-avatar";
import Image from "next/image";

type AvatarProps = {
  src: string;
  alt: string;
  name?: string;
  className?: string;
};

export function Avatar({ src, alt, name, className = "size-6" }: AvatarProps) {
  const avatar = resolveMemberAvatar(src, name || alt);

  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full bg-rule ${className}`.trim()}
      aria-hidden
    >
      <Image
        src={avatar.src}
        alt={avatar.alt}
        fill
        className="object-cover"
        sizes="48px"
      />
    </span>
  );
}
