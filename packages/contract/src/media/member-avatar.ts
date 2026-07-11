export const DEFAULT_MEMBER_AVATAR_SRC = "/images/man.jpg";

export function resolveMemberAvatar(
  src: string | null | undefined,
  name: string,
): { src: string; alt: string } {
  const trimmed = src?.trim() ?? "";
  return {
    src: trimmed || DEFAULT_MEMBER_AVATAR_SRC,
    alt: name.trim() || "عضو",
  };
}
