import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { HeroSection } from "@/components/sections/HeroSection";
import { PressStrip } from "@/components/sections/PressStrip";
import { TrustMetrics } from "@/components/sections/TrustMetrics";
import { PromoBanner } from "@/components/sections/PromoBanner";
import { FeaturedProduct } from "@/components/sections/FeaturedProduct";
import { SocialFeed } from "@/components/sections/SocialFeed";
import { BrandStory } from "@/components/sections/BrandStory";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildProductJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonLd";
import { featuredProduct } from "@/lib/storefront/content";
import { ScrollHeader } from "@/components/layout/ScrollHeader";
import { AwardsMarquee } from "@/components/sections/AwardsMarquee";
import { QuickPurchaseBar } from "@/components/cart/QuickPurchaseBar";

export default function Home() { return <><JsonLd data={organizationJsonLd} /><JsonLd data={websiteJsonLd} /><JsonLd data={buildProductJsonLd(featuredProduct)} /><AnnouncementBar /><ScrollHeader><SiteHeader /></ScrollHeader><main id="main-content"><HeroSection /><PressStrip /><TrustMetrics /><FeaturedProduct /><SocialFeed /><AwardsMarquee /><BrandStory /></main><SiteFooter /><QuickPurchaseBar /></>; }
