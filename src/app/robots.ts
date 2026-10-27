import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
export default function robots(): MetadataRoute.Robots {
  // The wildcard also permits Googlebot and Mediapartners-Google.
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }], sitemap: `${SITE_URL}/sitemap.xml` };
}
