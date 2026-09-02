import { describe, expect, it } from "vitest";

import { featuredProduct } from "@/lib/storefront/content";
import {
  buildProductJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "./jsonLd";

describe("search metadata contracts", () => {
  it("publishes production URLs instead of development URLs", () => {
    expect(organizationJsonLd.url).toBe("https://pixelsgalaxy.com");
    expect(websiteJsonLd.url).toBe("https://pixelsgalaxy.com");
    expect(organizationJsonLd.logo).toBe(
      "https://pixelsgalaxy.com/brand/pixels-galaxy-logo.png",
    );
  });

  it("produces merchant-listing data with absolute media and Pakistan fulfilment", () => {
    const product = buildProductJsonLd(featuredProduct);

    expect(product.image).toContain("https://pixelsgalaxy.com/photos/p-1.webp");
    expect(product.offers).toMatchObject({
      url: "https://pixelsgalaxy.com/#featured",
      priceCurrency: "PKR",
      price: "1999.00",
      availability: "https://schema.org/InStock",
      shippingDetails: {
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "PK",
        },
      },
    });
    expect(product.offers).not.toHaveProperty("hasMerchantReturnPolicy");
  });
});
