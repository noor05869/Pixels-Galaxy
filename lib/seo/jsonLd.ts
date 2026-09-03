import type { Product } from "@/lib/storefront/types";
export const siteUrl = "https://pixelsgalaxy.com";

const absoluteUrl = (path: string) => new URL(path, `${siteUrl}/`).toString();

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: "Pixels Galaxy",
  url: siteUrl,
  logo: absoluteUrl("/brand/pixels-galaxy-logo.png"),
  email: "support@pixelsgalaxy.com",
  areaServed: { "@type": "Country", name: "Pakistan" },
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Pixels Galaxy",
  alternateName: "Pixels Galaxy Pakistan",
  url: siteUrl,
  inLanguage: "en-PK",
  description: "Buy a glow-in-the-dark string shooter toy online with Cash on Delivery across Pakistan.",
};

export function buildProductJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} glow-in-the-dark string shooter toy`,
    image: product.media
      .filter((item) => item.type === "image")
      .map((item) => absoluteUrl(item.src)),
    description: product.description,
    sku: "PG-KU-001",
    category: "Toys & Games > String Shooter Toys",
    brand: { "@type": "Brand", name: "Pixels Galaxy" },
    color: ["Blue", "Green", "Pink"],
    audience: { "@type": "PeopleAudience", suggestedMinAge: 3 },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/#featured`,
      priceCurrency: "PKR",
      price: (product.price / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "Pixels Galaxy" },
      areaServed: { "@type": "Country", name: "Pakistan" },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "PK" },
      },
    },
  };
}
