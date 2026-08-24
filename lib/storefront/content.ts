import type { FooterGroup, MediaTile, Product, Testimonial, TrustMetric } from "./types";

const media = (id: string, src: string, alt: string, accent: string, aspectRatio = "1 / 1") => ({
  id, type: "image" as const, src, alt, accent, aspectRatio,
});

export const siteContent = {
  announcement: "DELIVERY ACROSS PAKISTAN — FREE SHIPPING OVER RS. 7,999",
  hero: {
    eyebrow: "PLAY BEYOND THE SCREEN",
    title: "MAKE EVERY DAY MORE FUN",
    cta: "SHOP ZIPSTRING",
    note: "Easy returns • Delivery across Pakistan",
    media: media("hero", "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=1800&q=85", "Colorful light trails in a dark creative space", "#05183d", "16 / 9"),
  },
  press: ["PAKISTAN FAVOURITE", "SCREEN-FREE FUN", "FAMILY PLAY", "100+ TRICKS", "GLOW-IN-THE-DARK"],
  socialTiles: [
    media("social-1", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80", "Creative technology workspace", "#1338be"),
    media("social-2", "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80", "Retro gaming technology", "#f04e98"),
    media("social-3", "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=900&q=80", "Friends gaming together", "#22d6ee"),
    media("social-4", "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=900&q=80", "Neon game controller", "#7aff4f"),
  ],
};

export const trustMetrics: TrustMetric[] = [
  { value: "EASY RETURNS", label: "Simple, stress-free returns" },
  { value: "1M+", label: "Happy customers" },
  { value: "PAKISTAN", label: "Nationwide delivery" },
  { value: "4.9/5", label: "Loved by families" },
];

const commonBenefits = [
  { title: "EASY RETURNS", text: "Not the right fit? Send it back." },
  { title: "GLOW-IN-THE-DARK", text: "Turn off the lights and keep playing." },
  { title: "100+ TRICKS", text: "Learn them, show them, make them yours." },
  { title: "USB-C CHARGING", text: "Charge up and start playing." },
];

export const products: Product[] = [
  {
    id: "zipstring-original", name: "ZipString Original", kicker: "BRAND NEW", description: "Launch the glowing string, master 100+ tricks, and bring playtime beyond the screen.", category: "Best Sellers", price: 899900, rating: 4.9, reviews: 1273, badge: "HIT", swatches: ["#11ffc3", "#5a7dff", "#ff4fa3"],
    media: [
      media("zipstring-1", "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1100&q=85", "Neon blue and magenta light installation", "#06d5ee"),
      media("zipstring-2", "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1100&q=85", "Blue night sky and glowing horizon", "#2856d9"),
      media("zipstring-3", "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1100&q=85", "Galaxy full of stars", "#15185a"),
    ], benefits: commonBenefits,
    bundles: [
      { id: "one", label: "1 ZIPSTRING", quantity: 1, unitPrice: 899900 },
      { id: "two", label: "2 ZIPSTRING", quantity: 2, unitPrice: 849900, badge: "FREE SHIPPING" },
      { id: "four", label: "4 ZIPSTRING", quantity: 4, unitPrice: 764900, compareAt: 899900, badge: "SAVE 15%" },
    ],
  },
  { id: "zipstring-glow", name: "ZipString Glow", description: "A brighter glow string made for unforgettable night-time tricks.", category: "Best Sellers", price: 699900, compareAt: 799900, rating: 4.8, reviews: 918, badge: "SAVE 13%", swatches: ["#14f195", "#ffcf33"], media: [media("zipstring-glow", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80", "Bright colorful outdoor light", "#31e9bf")], benefits: commonBenefits, bundles: [] },
  { id: "zipstring-colors", name: "ZipString Colors", description: "Choose your favourite colour and show off new tricks with friends.", category: "Best Sellers", price: 549900, rating: 4.7, reviews: 682, swatches: ["#ff5f57", "#5ac8fa", "#ff2d9a", "#bdff38"], media: [media("pop", "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80", "Colorful retro gaming console", "#ff5f57")], benefits: commonBenefits, bundles: [] },
  { id: "zipstring-pack", name: "ZipString String Pack", description: "Extra glow strings for more colours, more tricks, and more fun.", category: "String Packs", price: 149900, rating: 4.9, reviews: 341, swatches: ["#22ef8c", "#ff7a00", "#ff4fa3", "#78ff44"], media: [media("pack", "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=80", "Colorful glow against the night sky", "#743bff")], benefits: commonBenefits, bundles: [] },
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
  { ...media("trick-2", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80", "Concert lights and movement", "#ff43a4", "4 / 5"), label: "THE TWISTER", size: "tall" },
  { ...media("trick-3", "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80", "Glowing blue abstract tunnel", "#1758ff", "4 / 5"), label: "LIGHT SPEED", size: "tall" },
  { ...media("trick-4", "https://images.unsplash.com/photo-1504194104404-433180773017?auto=format&fit=crop&w=900&q=80", "Person playing in warm sunlight", "#ff9a3d", "4 / 5"), label: "GRAVITY FLIP", size: "tall" },
  { ...media("trick-5", "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80", "Festival crowd with colorful lights", "#1de5cb", "16 / 9"), label: "COLOUR BURST", size: "wide" },
  { ...media("trick-6", "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=80", "Performance under stage lights", "#ffcc29", "4 / 5"), label: "FAST SPIN", size: "tall" },
  { ...media("trick-7", "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=900&q=80", "Hands in colorful music crowd", "#52e3ff", "4 / 5"), label: "RIDE THE WAVE", size: "tall" },
  { ...media("trick-8", "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80", "Gaming event with blue lights", "#755dff", "4 / 5"), label: "QUICK DASH", size: "tall" },
];

export const testimonials: Testimonial[] = [
  { name: "Ayesha K.", rating: 5, quote: "Bachon ko bohat pasand aaya — mobile side par rakh kar poora din tricks seekhte rahe." },
  { name: "Hamza R.", rating: 5, quote: "Use karna asaan hai aur glow kamaal ka. Ghar mein sab ne bari bari try kiya." },
  { name: "Fatima A.", rating: 5, quote: "Birthday gift ke liye liya tha, lekin ab cousins bhi apna ZipString maang rahe hain." },
  { name: "Usman M.", rating: 5, quote: "Parcel theek mila aur toy dekhte hi bachon ki khushi double ho gayi." },
  { name: "Sana I.", rating: 5, quote: "Screen-free activity chahiye thi — yeh bilkul sahi nikla. Full paisa vasool masti." },
];

export const footerGroups: FooterGroup[] = [
  { title: "Shop", links: [{ label: "ZipString Original", href: "#featured" }, { label: "Best Sellers", href: "#shop" }, { label: "String Packs", href: "#shop" }] },
  { title: "Explore", links: [{ label: "100+ Tricks", href: "#tricks" }, { label: "Our Story", href: "#story" }, { label: "Contact Us", href: "mailto:hello@pixelsgalaxy.com" }] },
  { title: "Help", links: [{ label: "FAQs — coming soon", href: "#policies" }, { label: "Delivery — coming soon", href: "#policies" }, { label: "Returns — coming soon", href: "#policies" }] },
];
