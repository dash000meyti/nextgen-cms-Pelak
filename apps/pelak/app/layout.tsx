import { THEME_STORAGE_KEY } from "@nextgen-cms/config/theme/constants";
import { applyFeatureModules } from "@nextgen-cms/site-data/apply-feature-modules";
import {
  getArticles,
  getCurrentIssue,
  getFeatureModules,
  getSiteConfig,
  getThemeTokens,
} from "@nextgen-cms/site-data/get-content";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { iranSansBlack, iranSansRegular } from "@/components/theme/fonts/font";
import { SiteConfigProvider } from "@/components/theme/SiteConfigProvider";
import { ThemeInitScript } from "@/components/theme/ThemeInitScript";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeTokensProvider } from "@/components/theme/ThemeTokensProvider";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  return {
    title: {
      default: `${siteConfig.name} | ${siteConfig.tagline}`,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [rawSiteConfig, themeTokens, featureModules, searchArticles] =
    await Promise.all([
      getSiteConfig(),
      getThemeTokens(),
      getFeatureModules(),
      getArticles(),
    ]);

  const currentIssue = featureModules.issues ? await getCurrentIssue() : null;
  const siteConfig = applyFeatureModules(rawSiteConfig, featureModules);

  return (
    <html
      lang="fa"
      dir="rtl"
      suppressHydrationWarning
      data-default-theme={siteConfig.defaultTheme}
      data-theme-storage-key={THEME_STORAGE_KEY}
      className={`${iranSansRegular.variable} ${iranSansBlack.variable} h-full antialiased`}
    >
      <head>
        <ThemeTokensProvider tokens={themeTokens} />
        <ThemeInitScript />
      </head>
      <body className="min-h-full overflow-x-hidden flex flex-col bg-paper font-sans text-ink">
        <SiteConfigProvider config={siteConfig}>
          <ThemeProvider>
            <SiteHeader
              siteConfig={siteConfig}
              searchArticles={searchArticles}
              currentIssueLabel={currentIssue?.label ?? ""}
            />
            <main className="flex-1">{children}</main>
            <SiteFooter siteConfig={siteConfig} />
          </ThemeProvider>
        </SiteConfigProvider>
      </body>
    </html>
  );
}
