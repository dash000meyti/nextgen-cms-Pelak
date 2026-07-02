import { accessSync } from "node:fs";
import type { Browser } from "playwright-core";
import { chromium } from "playwright-core";

let browserPromise: Promise<Browser> | null = null;

function resolveChromiumExecutable(): string | undefined {
  const configured = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?.trim();
  if (configured) return configured;

  const candidates = [
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];

  for (const candidate of candidates) {
    try {
      accessSync(candidate);
      return candidate;
    } catch {
      // try next candidate
    }
  }

  return undefined;
}

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    const executablePath = resolveChromiumExecutable();
    try {
      browserPromise = chromium.launch({
        headless: true,
        ...(executablePath ? { executablePath } : {}),
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
      });
    } catch (error) {
      throw new Error(
        "Chromium برای ساخت PDF یافت نشد. Chrome را نصب کنید یا PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH را تنظیم کنید.",
        { cause: error },
      );
    }
  }

  return browserPromise;
}

export async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "32px",
        right: "32px",
        bottom: "32px",
        left: "32px",
      },
    });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}
