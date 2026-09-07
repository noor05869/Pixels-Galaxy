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
    {
      url: `${siteUrl}/faq`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/policies/delivery`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/policies/privacy`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/policies/returns`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
