import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/jsonLd";

export default function sitemap(): MetadataRoute.Sitemap {
  // Checkout, admin, order-detail, and API routes are intentionally private.
  return [
    {
      url: `${siteUrl}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
