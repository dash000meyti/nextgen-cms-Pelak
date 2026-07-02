import { access, readFile } from "node:fs/promises";
import path from "node:path";

let fontCssPromise: Promise<string> | null = null;

async function resolveFontsDir(): Promise<string> {
  const candidates = [
    path.join(process.cwd(), "lib/pdf/fonts"),
    path.join(process.cwd(), "apps/pelak/lib/pdf/fonts"),
  ];

  for (const dir of candidates) {
    try {
      await access(path.join(dir, "Regular.ttf"));
      return dir;
    } catch {
      // try next candidate
    }
  }

  throw new Error("PDF fonts not found");
}

async function buildFontCss(): Promise<string> {
  const fontsDir = await resolveFontsDir();
  const [regular, bold] = await Promise.all([
    readFile(path.join(fontsDir, "Regular.ttf")),
    readFile(path.join(fontsDir, "Bold.ttf")),
  ]);

  const regularBase64 = regular.toString("base64");
  const boldBase64 = bold.toString("base64");

  return `
@font-face {
  font-family: "IRANSansX";
  src: url(data:font/truetype;charset=utf-8;base64,${regularBase64}) format("truetype");
  font-weight: 400;
  font-style: normal;
}
@font-face {
  font-family: "IRANSansX";
  src: url(data:font/truetype;charset=utf-8;base64,${boldBase64}) format("truetype");
  font-weight: 700;
  font-style: normal;
}
`.trim();
}

export function getPdfFontCss(): Promise<string> {
  if (!fontCssPromise) {
    fontCssPromise = buildFontCss();
  }
  return fontCssPromise;
}
