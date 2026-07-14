import {
  issue,
  type ValidationIssue,
} from "@nextgen-cms/studio/cms/validation/common";

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

export function normalizeSlugInput(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\u200c\u200f\u202a-\u202e]/g, " ")
    .replace(/[^\p{Script=Arabic}a-z0-9\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function validateSlug(
  value: string,
  field = "slug",
): ValidationIssue | undefined {
  const normalized = normalizeSlugInput(value);
  if (!normalized) return issue(field, "نامک الزامی است.");
  if (normalized.length > 120) {
    return issue(field, "نامک نباید بیش از ۱۲۰ کاراکتر باشد.");
  }
  if (!SLUG_PATTERN.test(normalized)) {
    return issue(
      field,
      "نامک فقط حروف فارسی یا لاتین، اعداد و خط تیره مجاز است.",
    );
  }
  if (RESERVED_SLUGS.has(normalized)) {
    return issue(field, "این نامک رزرو شده است.");
  }
  return undefined;
}

export function slugifyTitle(title: string): string {
  return normalizeSlugInput(title);
}
