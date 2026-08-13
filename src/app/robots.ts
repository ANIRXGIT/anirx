import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // THE VAULT and ANIERA are private — never indexed.
      disallow: ["/vault", "/aniera", "/api/private"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
