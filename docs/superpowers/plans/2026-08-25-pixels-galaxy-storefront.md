# Pixels Galaxy Storefront Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a close, responsive Pixels Galaxy adaptation of the supplied ZipString storefront with temporary replaceable media, realistic client-side commerce interactions, strong SEO, and production-oriented performance.

**Architecture:** Replace the current static page with a Next.js App Router application. Keep marketing content and catalog information in typed data modules, render static sections on the server, and isolate navigation, product, cart, gallery, tabs, and newsletter behavior in small client components. Persist the cart in local storage without claiming that checkout is available.

**Tech Stack:** Next.js 15+, React 19, TypeScript 5+, CSS Modules/global CSS, `next/image`, Lucide React icons

**Spec:** `docs/superpowers/specs/2026-08-25-pixels-galaxy-storefront-design.md`

## Global Constraints

- Use the existing Pixels Galaxy logo and name; never display the ZipString logo or imply affiliation.
- Closely reproduce the reference's page sequence, electric-blue shell, cyan panels, rounded geometry, media density, and responsive composition.
- Centralize all replaceable marketing copy, product values, testimonials, metrics, and media definitions in typed data modules.
- Use server components by default and client components only for interactive islands.
- Do not add Stripe, a database, authentication, real search, production currency conversion, or newsletter-provider integration.
- Do not add a unit-test suite; use production builds and browser-based behavioral verification, as requested by the user.
- Never claim that checkout, search, account access, or external newsletter subscription completed.
- Respect reduced motion, keyboard access, semantic heading order, stable media dimensions, and strong focus visibility.

---

### Task 1: Next.js application shell and design system

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `next-env.d.ts`
- Create: `.gitignore`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/page.tsx`
- Create: `public/brand/pixels-galaxy-logo.png`
- Preserve temporarily: `index.html`, `styles.css`

**Interfaces:**
- Produces: global CSS tokens `--color-shell`, `--color-panel`, `--color-navy`, `--color-lime`, `--color-orange`, `--radius-panel`; root `RootLayout`; home `Page`.

- [ ] **Step 1: Add the application manifest and framework configuration**

Create scripts `dev`, `build`, `start`, and `lint`; install `next`, `react`, `react-dom`, and `lucide-react`; configure TypeScript strict mode and Next image support for the exact temporary remote media hosts chosen in Task 2.

- [ ] **Step 2: Copy the existing logo into the public brand folder**

Copy `assets/social/pixels-galaxy-primary-logo-v5.png` to `public/brand/pixels-galaxy-logo.png` without modifying the source asset.

- [ ] **Step 3: Build the root layout and CSS foundation**

Define metadata defaults, viewport settings, the skip link, main font stack, global reset, focus treatment, container utilities, blue shell, cyan panels, rounded surfaces, buttons, visually-hidden text, reduced-motion behavior, and mobile/desktop breakpoints.

- [ ] **Step 4: Add a minimal home-page skeleton**

Render `<main id="main-content">` with one `h1`, a temporary section marker, and no client-side JavaScript.

- [ ] **Step 5: Verify the framework baseline**

Run: `npm install`

Run: `npm run build`

Expected: Next.js production compilation succeeds with `/` statically rendered and no TypeScript errors.

- [ ] **Step 6: Commit the shell**

```bash
git add package.json package-lock.json next.config.ts tsconfig.json next-env.d.ts .gitignore app public/brand
git commit -m "feat: scaffold Pixels Galaxy storefront"
```

### Task 2: Typed storefront content and reusable primitives

**Files:**
- Create: `lib/storefront/types.ts`
- Create: `lib/storefront/content.ts`
- Create: `components/ui/IconButton.tsx`
- Create: `components/ui/SectionHeading.tsx`
- Create: `components/ui/MediaFrame.tsx`
- Create: `components/ui/Stars.tsx`
- Create: `components/ui/Price.tsx`

**Interfaces:**
- Produces: `Product`, `ProductMedia`, `BundleOffer`, `MediaTile`, `Testimonial`, `TrustMetric`, `FooterGroup`; exports `siteContent`, `products`, `featuredProduct`, `trickTiles`, `testimonials`, and `footerGroups`.
- Produces: `MediaFrame({ media, priority?, className? })`, `Stars({ rating, count? })`, and `Price({ amount, compareAt?, currency? })`.

- [ ] **Step 1: Define strict content types**

Model product IDs, names, descriptions, integer prices in cents, optional compare-at prices, image/video media, variants, bundles, review data, benefit lists, and fallback colors. Media must include `alt`, dimensions or aspect ratio, and an optional poster.

- [ ] **Step 2: Populate temporary Pixels Galaxy content**

Create four best-seller products, at least six featured-product media entries, eight trick tiles, five testimonials, four trust metrics, six social tiles, and footer groups. Use Pixels Galaxy names and marketing copy while allowing temporary reference media URLs.

- [ ] **Step 3: Build resilient presentational primitives**

`MediaFrame` must reserve its aspect ratio, use `next/image` for images, show a play badge for videos, and reveal a branded gradient fallback on media error. `Stars` must expose a readable rating label. `Price` must format cents through `Intl.NumberFormat`.

- [ ] **Step 4: Verify content compilation**

Run: `npm run build`

Expected: strict TypeScript compilation succeeds and no server/client boundary warning appears.

- [ ] **Step 5: Commit the content layer**

```bash
git add lib/storefront components/ui
git commit -m "feat: add typed storefront content"
```

### Task 3: Announcement bar, navigation, hero, trust strip, and catalog

**Files:**
- Create: `components/layout/AnnouncementBar.tsx`
- Create: `components/layout/SiteHeader.tsx`
- Create: `components/layout/MobileMenu.tsx`
- Create: `components/sections/HeroSection.tsx`
- Create: `components/sections/PressStrip.tsx`
- Create: `components/sections/TrustMetrics.tsx`
- Create: `components/sections/BestSellers.tsx`
- Create: `components/store/ProductCard.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `siteContent`, `products`, `TrustMetric`, `MediaFrame`, `Stars`, `Price`.
- Produces: `MobileMenu` with `open`, `onClose`; `BestSellers` with local `activeCategory` state.

- [ ] **Step 1: Implement the top-of-page composition**

Build the social/shipping/region announcement bar and sticky responsive header. Use semantic navigation, labelled icon buttons, an accessible dialog-style mobile menu, and non-deceptive search/account affordances labelled as upcoming.

- [ ] **Step 2: Implement the media hero and trust content**

Match the reference's large dark cinematic hero, lower-left headline and CTA, circular play control, guarantee note, white press strip, and four metric cards.

- [ ] **Step 3: Implement the best-seller tabs and cards**

Use ARIA tab roles, keyboard-reachable controls, product media, badges, ratings, swatches, and formatted pricing. On desktop use the reference-like card grid; on mobile use a stable two-column or horizontal layout without overflow.

- [ ] **Step 4: Compose the first viewport in `app/page.tsx`**

Render announcement, header, hero, press, trust, and best-seller components in the approved order while keeping exactly one `h1`.

- [ ] **Step 5: Verify desktop and mobile behavior**

Run: `npm run build`

Run: `npm run dev`

Inspect `/` at approximately 1440 px and 390 px widths. Expected: menu opens and returns focus on close, tabs switch product groups, all text remains readable, and no horizontal page overflow occurs.

- [ ] **Step 6: Commit the upper storefront**

```bash
git add app components/layout components/sections components/store
git commit -m "feat: build storefront hero and catalog"
```

### Task 4: Featured product, gallery, and persistent cart

**Files:**
- Create: `lib/cart/types.ts`
- Create: `lib/cart/storage.ts`
- Create: `components/cart/CartProvider.tsx`
- Create: `components/cart/CartDrawer.tsx`
- Create: `components/cart/CartLine.tsx`
- Create: `components/store/ProductGallery.tsx`
- Create: `components/store/PurchasePanel.tsx`
- Create: `components/sections/PromoBanner.tsx`
- Create: `components/sections/FeaturedProduct.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `components/layout/SiteHeader.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `CartLine { productId, name, image, unitPrice, quantity, bundleId }` and `CartContextValue { lines, totalQuantity, isOpen, addItem, updateQuantity, removeItem, openCart, closeCart }`.
- Produces: storage key `pixels-galaxy-cart-v1`; `readCart(): CartLine[]`; `writeCart(lines: CartLine[]): void`.
- Consumes: `featuredProduct`, `BundleOffer`, `ProductMedia`, `Price`, `Stars`, `MediaFrame`.

- [ ] **Step 1: Implement guarded cart persistence**

Validate parsed storage values before use, clamp quantities to `1..99`, and return an empty cart when storage is missing, malformed, or unavailable.

- [ ] **Step 2: Implement the cart provider and drawer**

Expose the defined context methods, update storage after hydration, sum the badge quantity, focus the drawer heading on open, close on Escape or backdrop click, restore focus, and provide update/remove controls. The checkout button must be disabled with the label `Checkout coming soon`.

- [ ] **Step 3: Implement the promotional banner and gallery**

Create the large overlaid media banner, then implement the featured gallery with active media, thumbnail buttons, selected state, fixed aspect ratios, and branded media fallback.

- [ ] **Step 4: Implement the purchase panel**

Render review summary, description, benefits, stock state, bundle choices, quantity stepper, price, add-to-cart control, and share affordances. Selecting a bundle updates quantity; adding opens the cart drawer and announces success through an ARIA live region.

- [ ] **Step 5: Integrate global cart state**

Wrap the application with `CartProvider`, connect the header badge/open action, place `CartDrawer` in the root layout, and add banner/product sections after best sellers.

- [ ] **Step 6: Verify cart behavior**

Run: `npm run build`

In the browser, select each bundle, change quantity, add the item, edit it in the drawer, reload, and remove it. Expected: price and quantity state remain coherent, persisted lines survive reload, malformed storage does not crash the page, Escape closes the drawer, and checkout cannot proceed.

- [ ] **Step 7: Commit product commerce interactions**

```bash
git add lib/cart components/cart components/store components/sections app components/layout/SiteHeader.tsx
git commit -m "feat: add featured product and persistent cart"
```

### Task 5: Demo grid, testimonials, social feed, story, and footer

**Files:**
- Create: `components/sections/TricksGrid.tsx`
- Create: `components/sections/Testimonials.tsx`
- Create: `components/sections/SocialFeed.tsx`
- Create: `components/sections/BrandStory.tsx`
- Create: `components/layout/NewsletterForm.tsx`
- Create: `components/layout/SiteFooter.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `trickTiles`, `testimonials`, `siteContent.socialTiles`, `footerGroups`, `MediaFrame`, `Stars`.
- Produces: local newsletter states `idle | invalid | success`; success copy explicitly states `Saved for this demo — email delivery will be connected later.`

- [ ] **Step 1: Build the reference-like media mosaic**

Use CSS Grid with varied row/column spans on desktop and a deliberate compact layout on mobile. Every tile must have a stable ratio, label, play affordance when relevant, and useful alt text.

- [ ] **Step 2: Build staggered testimonials and social feed**

Recreate the reference's loose staggered testimonial rhythm without harming reading order. Add the social-feed heading, follow CTA, and responsive media row/grid.

- [ ] **Step 3: Build the brand story**

Use a bold media-and-copy composition with a Pixels Galaxy origin headline and non-deceptive CTA.

- [ ] **Step 4: Build newsletter and footer behavior**

Validate required email syntax in the browser, prevent submission, show a clear invalid message or the defined demo success message, and never send data. Add semantic footer navigation, social links, policy links to `#policies` with honest unavailable-page labels, contact display, and region display.

- [ ] **Step 5: Complete page composition**

Append tricks, testimonials, social, story, and footer after the featured product in the approved sequence.

- [ ] **Step 6: Verify the complete responsive page**

Run: `npm run build`

Inspect desktop and mobile from top to bottom. Expected: no overlaps or horizontal overflow, DOM reading order remains logical, invalid newsletter input is explained, valid input shows only the local-demo message, and failed media shows the branded fallback.

- [ ] **Step 7: Commit the lower storefront**

```bash
git add components/sections components/layout app
git commit -m "feat: complete Pixels Galaxy landing page"
```

### Task 6: SEO metadata, structured data, and crawl routes

**Files:**
- Create: `lib/seo/jsonLd.ts`
- Create: `components/seo/JsonLd.tsx`
- Create: `app/robots.ts`
- Create: `app/sitemap.ts`
- Create: `app/opengraph-image.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: `buildOrganizationJsonLd()`, `buildWebsiteJsonLd()`, `buildProductJsonLd(product: Product)` returning serializable Schema.org objects; `JsonLd({ data })` safely serializes `<` as `\\u003c`.

- [ ] **Step 1: Add complete route metadata**

Define title, description, metadata base from `NEXT_PUBLIC_SITE_URL` with a safe local fallback, canonical URL, Open Graph values, Twitter card values, icons, and descriptive social-image metadata.

- [ ] **Step 2: Add crawl routes and social image**

Generate a root sitemap entry, permissive robots rules with sitemap URL, and a branded Open Graph image using `ImageResponse` without fetching unavailable remote media.

- [ ] **Step 3: Add safe JSON-LD**

Render Organization, WebSite, and Product objects using the centralized content. Include product name, image, description, SKU, brand, price currency, price, availability, aggregate rating, and canonical URL without inventing live checkout capability.

- [ ] **Step 4: Verify SEO output**

Run: `npm run build`

Run: `npm run start`

Inspect `/`, `/robots.txt`, `/sitemap.xml`, and `/opengraph-image`. Expected: all routes return successfully, metadata appears once, one page `h1` exists, JSON-LD parses as JSON, and canonical URLs use the configured site base.

- [ ] **Step 5: Commit SEO support**

```bash
git add app lib/seo components/seo
git commit -m "feat: add storefront SEO metadata"
```

### Task 7: Production polish, performance review, and legacy cleanup

**Files:**
- Modify as required: `app/**/*.tsx`, `components/**/*.tsx`, `app/globals.css`, `next.config.ts`
- Delete: `index.html`
- Delete: `styles.css`

**Interfaces:**
- Consumes: all preceding tasks.
- Produces: final production-ready storefront with no legacy static entry points.

- [ ] **Step 1: Audit client boundaries and media loading**

Confirm only interactive components contain `use client`; remove unnecessary state/effects; ensure only the logo and hero image are prioritized; set responsive sizes and explicit aspect ratios; prevent below-the-fold video preloading.

- [ ] **Step 2: Audit accessibility and responsive behavior**

Keyboard through the complete page, confirm visible focus, labelled icon buttons, menu/cart focus management, tab semantics, gallery selection, live announcements, reduced-motion behavior, and contrast. Check widths near 390, 768, 1024, and 1440 pixels.

- [ ] **Step 3: Audit runtime behavior**

Exercise menu, tabs, gallery, bundles, quantity, cart persistence/editing, disabled checkout, media fallbacks, and newsletter validation. Inspect browser console output and fix all application errors.

- [ ] **Step 4: Remove obsolete static entry points**

Delete `index.html` and `styles.css` only after the Next.js page has passed the full browser review. Preserve the original logo under `assets/social/` as source material.

- [ ] **Step 5: Run final verification**

Run: `npm run build`

Expected: exit code 0; home, robots, sitemap, and Open Graph routes are generated; no TypeScript or framework errors occur.

Run the production server and repeat desktop/mobile smoke testing. Expected: the complete page closely matches the supplied reference's structure and visual rhythm, all defined interactions work, and no feature falsely claims an external action completed.

- [ ] **Step 6: Commit production polish**

```bash
git add -A
git commit -m "chore: polish Pixels Galaxy storefront"
```
