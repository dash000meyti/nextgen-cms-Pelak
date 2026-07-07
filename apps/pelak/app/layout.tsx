import { THEME_STORAGE_KEY } from "@nextgen-cms/config/theme/constants";
import { applyPublicNav } from "@nextgen-cms/site-data/apply-public-nav";
import {
  getArticles,
  getContentGroupModuleSettings,
  getContentSettings,
  getCurrentContentGroup,
  getFeatureModules,
  getMemberSettings,
  getModuleSettings,
  getSiteConfig,
  getThemeTokens,
  getVideoModuleSettings,
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

function resolveMetadataBase(): URL {
  const fallback = "http://localhost:3000";
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    fallback;
  try {
    return new URL(raw);
  } catch {
    return new URL(fallback);
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const logoUrl = siteConfig.logo?.trim();
  const iconVersion = logoUrl ? encodeURIComponent(logoUrl) : "default";
  const iconUrl = `/icon?v=${iconVersion}`;
  return {
    metadataBase: resolveMetadataBase(),
    title: {
      default: `${siteConfig.name} | ${siteConfig.tagline}`,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
      icon: [{ url: iconUrl }],
      shortcut: [{ url: iconUrl }],
      apple: [{ url: iconUrl }],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [
    rawSiteConfig,
    themeTokens,
    featureModules,
    searchArticles,
    contentSettings,
    memberSettings,
    contentGroupSettings,
    videoSettings,
    moduleSettings,
  ] = await Promise.all([
    getSiteConfig(),
    getThemeTokens(),
    getFeatureModules(),
    getArticles(),
    getContentSettings(),
    getMemberSettings(),
    getContentGroupModuleSettings(),
    getVideoModuleSettings(),
    getModuleSettings(),
  ]);

  const currentContentGroup = featureModules.contentGroup
    ? await getCurrentContentGroup()
    : null;
  const siteConfig = applyPublicNav(rawSiteConfig, {
    content: contentSettings,
    members: memberSettings,
    contentGroup: contentGroupSettings,
    video: videoSettings,
    modules: moduleSettings,
  });

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
              currentContentGroupLabel={currentContentGroup?.label ?? ""}
            />
            <main className="flex-1">{children}</main>
            <SiteFooter siteConfig={siteConfig} />
          </ThemeProvider>
        </SiteConfigProvider>
      </body>
    </html>
  );
}
