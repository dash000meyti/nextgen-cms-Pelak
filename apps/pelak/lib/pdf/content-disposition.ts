/**
 * Build a Content-Disposition header value that safely carries a non-ASCII
 * (e.g. Persian) filename. The `filename=` token must be a Latin-1 ByteString,
 * so the original name is only emitted via the RFC 5987 `filename*=UTF-8''…`
 * form, with an ASCII fallback for older clients.
 */
export function contentDisposition(
  disposition: "inline" | "attachment",
  filename: string,
): string {
  const encoded = encodeURIComponent(filename);
  const asciiFallback =
    filename.replace(/[^\x20-\x7E]/g, "").trim() || "file.pdf";
  const safeAscii = asciiFallback.replace(/"/g, "");
  return `${disposition}; filename="${safeAscii}"; filename*=UTF-8''${encoded}`;
}
