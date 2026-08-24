import type { FooterGroup, MediaTile, Product, Testimonial, TrustMetric } from "./types";

const media = (id: string, src: string, alt: string, accent: string, aspectRatio = "1 / 1") => ({
  id, type: "image" as const, src, alt, accent, aspectRatio,
});

export const siteContent = {
  announcement: "FREE SHIPPING ON GALAXY ORDERS OVER $60+",
  hero: {
    eyebrow: "PLAY BEYOND THE SCREEN",
    title: "GIVE THE GIFT OF WONDER",
    cta: "SHOP THE GALAXY",
    note: "90-Day Money Back Guarantee",
    media: media("hero", "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=1800&q=85", "Colorful light trails in a dark creative space", "#05183d", "16 / 9"),
  },
  press: ["GOOD MORNING AMERICA", "GOOD HOUSEKEEPING", "SHARK TANK", "KICKSTARTER", "WIRED"],
  socialTiles: [
    media("social-1", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80", "Creative technology workspace", "#1338be"),
    media("social-2", "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80", "Retro gaming technology", "#f04e98"),
    media("social-3", "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=900&q=80", "Friends gaming together", "#22d6ee"),
    media("social-4", "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=900&q=80", "Neon game controller", "#7aff4f"),
  ],
};

export const trustMetrics: TrustMetric[] = [
  { value: "90 DAYS", label: "Money-back guarantee" },
  { value: "1M+", label: "Pixel explorers" },
  { value: "60+", label: "Countries reached" },
  { value: "4.9/5", label: "Community rating" },
];

const commonBenefits = [
  { title: "90-DAY GUARANTEE", text: "Try it in your own universe." },
  { title: "GLOW-READY", text: "Made for lights-down play." },
  { title: "100+ CHALLENGES", text: "Learn, remix, and invent." },
  { title: "USB-C POWER", text: "Recharge and jump back in." },
];

export const products: Product[] = [
  {
    id: "nova-core", name: "Nova Core", kicker: "BRAND NEW", description: "A pocket-sized light launcher built for kinetic play, glowing tricks, and screen-free discovery.", category: "Best Sellers", price: 8900, rating: 4.9, reviews: 1273, badge: "HOT", swatches: ["#11ffc3", "#5a7dff", "#ff4fa3"],
    media: [
      media("nova-1", "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1100&q=85", "Neon blue and magenta light installation", "#06d5ee"),
      media("nova-2", "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1100&q=85", "Blue night sky and glowing horizon", "#2856d9"),
      media("nova-3", "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1100&q=85", "Galaxy full of stars", "#15185a"),
    ], benefits: commonBenefits,
    bundles: [
      { id: "one", label: "GET 1 NOVA", quantity: 1, unitPrice: 8900 },
      { id: "two", label: "GET 2 NOVAS", quantity: 2, unitPrice: 8400, badge: "FREE SHIPPING" },
      { id: "four", label: "GET 4 NOVAS", quantity: 4, unitPrice: 7600, compareAt: 8900, badge: "SAVE 15%" },
    ],
  },
  { id: "luma-loop", name: "Luma Loop", description: "A colorful loop kit for bright tricks and fast challenges.", category: "Best Sellers", price: 6900, compareAt: 7900, rating: 4.8, reviews: 918, badge: "SAVE 13%", swatches: ["#14f195", "#ffcf33"], media: [media("luma", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80", "Bright colorful outdoor light", "#31e9bf")], benefits: commonBenefits, bundles: [] },
  { id: "pixel-pop", name: "Pixel Pop", description: "Quick-start color play for the whole crew.", category: "Best Sellers", price: 5400, rating: 4.7, reviews: 682, swatches: ["#ff5f57", "#5ac8fa", "#ff2d9a", "#bdff38"], media: [media("pop", "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80", "Colorful retro gaming console", "#ff5f57")], benefits: commonBenefits, bundles: [] },
  { id: "comet-pack", name: "Comet Pixel Pack", description: "Replacement glow loops in a five-color cosmic mix.", category: "Pixel Packs", price: 2200, rating: 4.9, reviews: 341, swatches: ["#22ef8c", "#ff7a00", "#ff4fa3", "#78ff44"], media: [media("pack", "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=80", "Colorful glow against the night sky", "#743bff")], benefits: commonBenefits, bundles: [] },
];

products[0].media[0].hoverVideo = "/videos/v1.mp4";
products[0].media[0].actionLabel = "VIEW PRODUCT";
products[1].media[0].hoverVideo = "/videos/v2.mp4";
products[1].media[0].actionLabel = "ADD TO CART";
products[2].media[0].hoverVideo = "/videos/v3.mp4";
products[2].media[0].actionLabel = "VIEW PRODUCT";
products[3].media[0].hoverVideo = "/videos/v4.mp4";
products[3].media[0].actionLabel = "ADD TO CART";

export const featuredProduct = products[0];

export const trickTiles: MediaTile[] = [
  { ...media("trick-1", "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80", "Person moving through a colorful city", "#22d6ee", "4 / 5"), label: "THE ORBIT", size: "tall" },
  { ...media("trick-2", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80", "Concert lights and movement", "#ff43a4", "4 / 5"), label: "CORKSCREW", size: "tall" },
  { ...media("trick-3", "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80", "Glowing blue abstract tunnel", "#1758ff", "4 / 5"), label: "WARP DRIVE", size: "tall" },
  { ...media("trick-4", "https://images.unsplash.com/photo-1504194104404-433180773017?auto=format&fit=crop&w=900&q=80", "Person playing in warm sunlight", "#ff9a3d", "4 / 5"), label: "GRAVITY FLIP", size: "tall" },
  { ...media("trick-5", "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80", "Festival crowd with colorful lights", "#1de5cb", "16 / 9"), label: "SUPER NOVA", size: "wide" },
  { ...media("trick-6", "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=80", "Performance under stage lights", "#ffcc29", "4 / 5"), label: "THE COMET", size: "tall" },
  { ...media("trick-7", "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=900&q=80", "Hands in colorful music crowd", "#52e3ff", "4 / 5"), label: "RIDE THE WAVE", size: "tall" },
  { ...media("trick-8", "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80", "Gaming event with blue lights", "#755dff", "4 / 5"), label: "PIXEL DASH", size: "tall" },
];

export const testimonials: Testimonial[] = [
  { name: "Ashley S.", rating: 5, quote: "The kids forgot about their screens for an entire afternoon. That alone feels like magic." },
  { name: "Donna F.", rating: 5, quote: "Bright, playful, and surprisingly easy to learn. Everyone from six to sixty wanted a turn." },
  { name: "David M.", rating: 5, quote: "I start by saying, ‘I’m going to show you something you haven’t seen before.’ It always delivers." },
  { name: "Heather B.", rating: 5, quote: "We bought three so nobody had to wait. The house looked like a tiny galaxy." },
  { name: "Lisa T.", rating: 5, quote: "Instant wonder. It became the hit of the weekend." },
];

export const footerGroups: FooterGroup[] = [
  { title: "Shop", links: [{ label: "Nova Core", href: "#featured" }, { label: "Best Sellers", href: "#shop" }, { label: "Pixel Packs", href: "#shop" }] },
  { title: "Explore", links: [{ label: "100+ Tricks", href: "#tricks" }, { label: "Our Story", href: "#story" }, { label: "Contact", href: "mailto:hello@pixelsgalaxy.com" }] },
  { title: "Support", links: [{ label: "FAQs — coming soon", href: "#policies" }, { label: "Shipping — coming soon", href: "#policies" }, { label: "Returns — coming soon", href: "#policies" }] },
];
