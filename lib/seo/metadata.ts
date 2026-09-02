import type { Metadata } from "next";

import { siteUrl } from "./jsonLd";

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Pixels Galaxy",
  title: {
    default: "Pixels Galaxy | Ku String Toys in Pakistan",
    template: "%s | Pixels Galaxy Pakistan",
  },
  description:
    "Shop the Ku String glow-in-the-dark string shooter toy in Pakistan. Choose blue, green, or pink with Cash on Delivery nationwide.",
  keywords: [
    "string shooter toy Pakistan",
    "flying string toy Pakistan",
    "glow in the dark string toy",
    "rope launcher toy Pakistan",
    "Ku String Pakistan",
    "kids toys online Pakistan",
  ],
  category: "Kids toys",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Pixels Galaxy | Ku String Toys in Pakistan",
    description:
      "Shop the rechargeable Ku String in blue, green, or pink with Cash on Delivery across Pakistan.",
    url: "/",
    siteName: "Pixels Galaxy",
    locale: "en_PK",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Pixels Galaxy Ku String toys in blue and pink",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pixels Galaxy | Ku String Toys in Pakistan",
    description:
      "Shop Ku String toys with nationwide Cash on Delivery in Pakistan.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/brand/pixels-galaxy-icon.jpg",
    shortcut: "/brand/pixels-galaxy-icon.jpg",
    apple: "/brand/pixels-galaxy-icon.jpg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};
