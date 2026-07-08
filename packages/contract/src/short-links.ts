export type ShortLinkTarget =
  | { kind: "content"; id: number }
  | { kind: "contentGroup"; id: number };

export function buildContentShortPath(id: number): string {
  return `/p/c${id}`;
}

export function buildContentGroupShortPath(id: number): string {
  return `/p/m${id}`;
}

export function buildContentPdfPath(id: number): string {
  return `/api/pdf/content/${id}`;
}

export function buildContentGroupPdfPath(slug: string): string {
  return `/api/pdf/content-group/${slug}`;
}

export function parseShortLinkCode(code: string): ShortLinkTarget | null {
  const contentMatch = /^c(\d+)$/.exec(code);
  if (contentMatch) {
    const id = Number.parseInt(contentMatch[1] ?? "", 10);
    if (id > 0) return { kind: "content", id };
  }

  const groupMatch = /^m(\d+)$/.exec(code);
  if (groupMatch) {
    const id = Number.parseInt(groupMatch[1] ?? "", 10);
    if (id > 0) return { kind: "contentGroup", id };
  }

  return null;
}
