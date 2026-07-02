import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hokmran.example";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/p/", "/api/pdf/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
