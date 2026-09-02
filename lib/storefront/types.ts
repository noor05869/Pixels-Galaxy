export type ProductMedia = {
  id: string;
  type: "image" | "video";
  src: string;
  alt: string;
  poster?: string;
  aspectRatio: string;
  accent: string;
  hoverVideo?: string;
  actionLabel?: "ADD TO CART" | "VIEW PRODUCT";
};

export type BundleOffer = {
  id: string;
  label: string;
  quantity: number;
  unitPrice: number;
  compareAt?: number;
  badge?: string;
};

export type Product = {
  id: string;
  name: string;
  kicker?: string;
  description: string;
  category: "Best Sellers" | "String Packs";
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  badge?: string;
  swatches: string[];
  media: ProductMedia[];
  benefits: { title: string; text: string }[];
  bundles: BundleOffer[];
};

export type MediaTile = ProductMedia & { label: string; size?: "wide" | "tall" | "square" };
export type Testimonial = { name: string; quote: string; rating: number };
export type TrustMetric = { value: string; label: string };
export type FooterGroup = { title: string; links: { label: string; href: string }[] };
