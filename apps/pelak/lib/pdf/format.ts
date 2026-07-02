import { formatJalali } from "@nextgen-cms/core/platform/datetime";

export function formatPdfAuthors(
  authors: Array<{ name: string; role: string }>,
): string {
  return authors.map((author) => `${author.name} (${author.role})`).join("، ");
}

export function formatPdfDate(value: string): string {
  try {
    return formatJalali(value, "long");
  } catch {
    return value;
  }
}
