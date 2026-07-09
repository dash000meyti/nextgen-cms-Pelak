import { accessSync } from "node:fs";
import type { Browser } from "playwright-core";
import { chromium } from "playwright-core";

let browserPromise: Promise<Browser> | null = null;

function resolveChromiumExecutable(): string | undefined {
  const configured = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?.trim();
  if (configured) {
    try {
      accessSync(configured);
      return configured;
    } catch {
      console.warn(
        `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH not found: ${configured}`,
      );
    }
  }

  const candidates = [
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/lib/chromium/chromium",
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

function chromiumArgs(): string[] {
  return [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-crash-reporter",
    "--disable-breakpad",
  ];
}

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    const executablePath = resolveChromiumExecutable();
    const attemptedExecutable =
      executablePath ??
      (process.env.PLAYWRIGHT_BROWSERS_PATH?.trim()
        ? `playwright bundle (${process.env.PLAYWRIGHT_BROWSERS_PATH})`
        : "(playwright default)");
    browserPromise = chromium
      .launch({
        headless: true,
        ...(executablePath ? { executablePath } : {}),
        args: chromiumArgs(),
      })
      .then((browser) => {
        browser.on("disconnected", () => {
          browserPromise = null;
        });
        return browser;
      })
      .catch((error) => {
        browserPromise = null;
        console.error(
          `Chromium launch failed (executable: ${attemptedExecutable}):`,
          error,
        );
        throw new Error(
          `Chromium launch failed for PDF generation (executable: ${attemptedExecutable}). ` +
            "Chrome/Chromium را نصب کنید یا PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH را تنظیم کنید.",
          { cause: error },
        );
      });
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
