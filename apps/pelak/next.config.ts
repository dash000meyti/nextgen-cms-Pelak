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
    destination: "/admin/settings/content/topics",
    permanent: true,
  },
  {
    source: "/admin/settings/topics/:path*",
    destination: "/admin/settings/content/topics/:path*",
    permanent: true,
  },
  {
    source: "/admin/topics",
    destination: "/admin/settings/content/topics",
    permanent: true,
  },
  {
    source: "/admin/topics/:path*",
    destination: "/admin/settings/content/topics/:path*",
    permanent: true,
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
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
