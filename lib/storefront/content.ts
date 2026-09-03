import type { FooterGroup, MediaTile, Product, Testimonial, TrustMetric } from "./types";

const media = (id: string, src: string, alt: string, accent: string, aspectRatio = "1 / 1") => ({
  id, type: "image" as const, src, alt, accent, aspectRatio,
});

export const siteContent = {
  announcement: "PICK ANY 2 FOR PKR 3,500 — FREE DELIVERY ACROSS PAKISTAN",
  footerSearchText: "Looking for a string toy in Pakistan? Compare the string toy price in Pakistan for Ku String, explore rechargeable flying string toys, and see an option for shoppers searching for a ZipString-style toy in Pakistan.",
  hero: {
    eyebrow: "KU STRING • NOW IN PAKISTAN",
    title: "STRING SHOOTER TOY",
    cta: "CHOOSE YOUR COLOURS",
    note: "Mix blue, green, or pink • Cash on Delivery",
    media: media("hero", "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=1800&q=85", "Colorful light trails in a dark creative space", "#05183d", "16 / 9"),
  },
  press: ["502 PIECES IN STOCK", "AGES 3+", "BLUE • GREEN • PINK", "CASH ON DELIVERY", "3-DAY ISSUE REPORTING"],
  socialTiles: [
    media("social-1", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80", "Creative technology workspace", "#1338be"),
    media("social-2", "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80", "Retro gaming technology", "#f04e98"),
    media("social-3", "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=900&q=80", "Friends gaming together", "#22d6ee"),
    media("social-4", "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=900&q=80", "Neon game controller", "#7aff4f"),
  ],
  seo: {
    eyebrow: "FLYING STRING FUN",
    heading: "Buy a String Shooter Toy in Pakistan",
    introduction: "Ku String is a handheld flying string toy that sends a soft loop through the air for waves, circles, and tricks. Order online from Pixels Galaxy in blue, green, or pink, with Cash on Delivery available across Pakistan.",
    features: [
      { title: "Glow-in-the-dark flying string", text: "Create bright loops and moving patterns during indoor or low-light play." },
      { title: "USB charging included", text: "The box includes the Ku String device, glowing string, USB cable, and guide." },
      { title: "Three colour choices", text: "Choose blue, green, or pink, or mix any two colours in the bundle." },
      { title: "Cash on Delivery in Pakistan", text: "Order online and pay when your parcel arrives anywhere in our Pakistan delivery coverage." },
    ],
    faqs: [
      { question: "What is a string shooter toy?", answer: "A string shooter is a handheld toy that moves a continuous loop of string through the air. You guide the flying loop with your hand to make waves, circles, and other patterns." },
      { question: "How much is Ku String in Pakistan?", answer: "One Ku String costs PKR 1,999. The Pick Any 2 bundle costs PKR 3,500 in total and includes free delivery across Pakistan." },
      { question: "What comes in the Ku String box?", answer: "The package includes the Ku String launcher, glowing string, USB charging cable, and a guide." },
      { question: "Which Ku String colours are available?", answer: "Ku String is available in blue, green, and pink. The two-piece bundle lets you select both colours separately." },
      { question: "What age is Ku String for?", answer: "The product is marked for ages 3 and above. Adult supervision is recommended during play." },
      { question: "Where does Pixels Galaxy deliver?", answer: "Pixels Galaxy delivers across Pakistan with Cash on Delivery. Major cities usually take 2 to 4 working days; other cities and towns usually take 3 to 6 working days." },
      { question: "What if my order arrives damaged or incorrect?", answer: "Report a damaged, wrong, incomplete, or faulty item to Pixels Galaxy within 3 days of delivery so the issue can be reviewed." },
    ],
  },
};

export const trustMetrics: TrustMetric[] = [
  { value: "3 DAYS", label: "Report delivery or product issues" },
  { value: "502", label: "Total pieces in current stock" },
  { value: "PAKISTAN", label: "Nationwide delivery coverage" },
  { value: "COD", label: "Pay when your order arrives" },
];

const commonBenefits = [
  { title: "AGES 3+", text: "Adult supervision is recommended." },
  { title: "THREE COLOURS", text: "Choose blue, green, or pink." },
  { title: "FREE DELIVERY", text: "Included with the two-piece bundle across Pakistan." },
  { title: "3-DAY SUPPORT", text: "Report damage, faults, or wrong items within 3 days." },
];

export const products: Product[] = [
  {
    id: "ku-string", name: "Ku string", kicker: "ONLINE ONLY", description: "Ku string is a glow-in-the-dark string shooter and flying rope toy for ages 3+, available online in blue, green, and pink with Cash on Delivery across Pakistan.", category: "Best Sellers", price: 199900, rating: 0, reviews: 0, badge: "IN STOCK", swatches: ["#2474ff", "#28b86f", "#ff4f9a"],
    media: [
      { id: "ku-string-demo", type: "video", src: "/videos/v1.mp4", poster: "/photos/p-1.webp", alt: "Ku string toy demonstration video", accent: "#2474ff", aspectRatio: "1 / 1" },
      media("ku-string-hero", "/photos/p-1.webp", "Blue Ku string glow-in-the-dark rope launcher in action", "#2474ff"),
      media("ku-string-instructions", "/photos/p-2.jpg", "Four illustrated steps showing how to use the Ku string toy", "#5fe7ef"),
      media("ku-string-package", "/photos/p-3.jpg", "Ku string package contents including launcher, USB cable, guide, and glowing string", "#8b5cf6"),
      media("ku-string-product", "/photos/p-4.jpg", "Blue Ku string launcher with its glowing yellow string", "#2474ff"),
      media("ku-string-features", "/photos/p-5.jpg", "Ku string launcher features including glowing string and USB charging", "#5fe7ef"),
      media("ku-string-size", "/photos/p-6.jpg", "Ku string launcher dimensions, charging cable, string, and retail box", "#8b5cf6"),
    ], benefits: commonBenefits,
    bundles: [
      { id: "blue", label: "BLUE", quantity: 1, unitPrice: 199900, badge: "PG-KU-001-BLU" },
      { id: "green", label: "GREEN", quantity: 1, unitPrice: 199900, badge: "PG-KU-001-GRN" },
      { id: "pink", label: "PINK", quantity: 1, unitPrice: 199900, badge: "PG-KU-001-PNK" },
      { id: "pick-any-two", label: "PICK ANY 2 COLOURS", quantity: 2, unitPrice: 175000, compareAt: 199900, badge: "PKR 3,500 TOTAL • FREE DELIVERY" },
    ],
  },
];

products[0].media[1].hoverVideo = "/videos/v1.mp4";
products[0].media[1].actionLabel = "VIEW PRODUCT";

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
];

export const footerGroups: FooterGroup[] = [
  { title: "Shop", links: [{ label: "Ku string", href: "#featured" }, { label: "Choose a colour", href: "#featured" }, { label: "PKR 1,999", href: "#featured" }] },
  { title: "Product", links: [{ label: "Ages 3+", href: "#featured" }, { label: "Blue, green, pink", href: "#featured" }, { label: "Online only", href: "#featured" }] },
  { title: "Help", links: [{ label: "Pakistan-wide delivery", href: "#policies" }, { label: "3-day issue reporting", href: "#policies" }, { label: "Contact Us", href: "mailto:support@pixelsgalaxy.com" }] },
];
