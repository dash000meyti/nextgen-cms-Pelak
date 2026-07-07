const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "articles",
  "authors",
  "content-group",
  "issues",
  "topics",
  "video",
  "uploads",
  "about",
  "contact",
]);

const SLUG_PATTERN =
  /^[\p{Script=Arabic}a-z0-9]+(?:-[\p{Script=Arabic}a-z0-9]+)*$/u;

export function validateSlug(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "نامک الزامی است.";
  if (trimmed.length > 120) return "نامک نباید بیش از ۱۲۰ کاراکتر باشد.";
  if (!SLUG_PATTERN.test(trimmed)) {
    return "نامک فقط حروف فارسی یا لاتین، اعداد و خط تیره مجاز است.";
  }
  if (RESERVED_SLUGS.has(trimmed)) return "این نامک رزرو شده است.";
  return undefined;
}

export function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[\u200c\u200f\u202a-\u202e]/g, "")
    .replace(/[^\p{Script=Arabic}a-z0-9\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
