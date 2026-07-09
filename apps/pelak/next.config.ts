import type { NextConfig } from "next";

const routeRedirects = [
  { source: "/articles", destination: "/content", permanent: true },
  {
    source: "/articles/:path*",
    destination: "/content/:path*",
    permanent: true,
  },
  {
    source: "/authors/:path*",
    destination: "/members/:path*",
    permanent: true,
  },
  {
    source: "/admin/articles",
    destination: "/admin/content",
    permanent: true,
  },
  {
    source: "/admin/articles/:path*",
    destination: "/admin/content/:path*",
    permanent: true,
  },
  {
    source: "/admin/authors/:path*",
    destination: "/admin/members/:path*",
    permanent: true,
  },
  {
    source: "/admin/settings/topics",
    destination: "/admin/content/settings/topics",
    permanent: true,
  },
  {
    source: "/admin/settings/topics/:path*",
    destination: "/admin/content/topics/:path*",
    permanent: true,
  },
  {
    source: "/admin/topics",
    destination: "/admin/content/settings/topics",
    permanent: true,
  },
  {
    source: "/admin/topics/:path*",
    destination: "/admin/content/topics/:path*",
    permanent: true,
  },
  {
    source: "/admin/settings/content",
    destination: "/admin/content/settings/content",
    permanent: true,
  },
  {
    source: "/admin/settings/content/:path*",
    destination: "/admin/content/:path*",
    permanent: true,
  },
  {
    source: "/admin/settings/members",
    destination: "/admin/members/settings",
    permanent: true,
  },
  {
    source: "/admin/settings/media",
    destination: "/admin/media?tab=settings",
    permanent: true,
  },
  { source: "/issues", destination: "/content-group", permanent: true },
  {
    source: "/issues/:number",
    destination: "/content-group/:number",
    permanent: true,
  },
  {
    source: "/admin/issues",
    destination: "/admin/content-group",
    permanent: true,
  },
  {
    source: "/admin/issues/:path*",
    destination: "/admin/content-group/:path*",
    permanent: true,
  },
  {
    source: "/uploads/issues/:path*",
    destination: "/uploads/content-group/:path*",
    permanent: true,
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.cdn.asset.aparat.com",
      },
      {
        protocol: "https",
        hostname: "static.cdn.asset.aparat.cloud",
      },
    ],
  },
  serverExternalPackages: ["better-sqlite3", "playwright-core"],
  outputFileTracingIncludes: {
    "/api/pdf/content/[id]": ["./lib/pdf/fonts/**/*", "./public/images/**/*"],
    "/api/pdf/content-group/[slug]": [
      "./lib/pdf/fonts/**/*",
      "./public/images/**/*",
    ],
    "/api/pdf/video/[slug]": ["./lib/pdf/fonts/**/*", "./public/images/**/*"],
    "/api/pdf/playlist/[slug]": [
      "./lib/pdf/fonts/**/*",
      "./public/images/**/*",
    ],
  },
  experimental: {
    authInterrupts: true,
    proxyClientMaxBodySize: "30mb",
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
  transpilePackages: [
    "@nextgen-cms/contract",
    "@nextgen-cms/core",
    "@nextgen-cms/config",
    "@nextgen-cms/site-data",
    "@nextgen-cms/studio",
  ],
  redirects: async () => routeRedirects,
};

export default nextConfig;
