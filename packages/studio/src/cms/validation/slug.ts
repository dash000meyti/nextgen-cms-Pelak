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

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateSlug(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "نامک الزامی است.";
  if (trimmed.length > 120) return "نامک نباید بیش از ۱۲۰ کاراکتر باشد.";
  if (!SLUG_PATTERN.test(trimmed)) {
    return "نامک فقط حروف کوچک لاتین، اعداد و خط تیره مجاز است.";
  }
  if (RESERVED_SLUGS.has(trimmed)) return "این نامک رزرو شده است.";
  return undefined;
}

export function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
