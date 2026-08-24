# Recorded Storefront Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reproduce the interaction language demonstrated in the supplied ZipString recording across the existing Pixels Galaxy storefront without copying ZipString branding or adding backend commerce.

**Architecture:** Add a small set of reusable client-side interaction primitives for scroll direction, viewport entry, media playback, and persistent quick purchase. Keep CSS responsible for transforms, easing, and hover states; use React state only where behavior depends on playback, selection, viewport position, or cart state. Preserve server-rendered content and reduced-motion fallbacks.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS, native `IntersectionObserver`, native scroll events, HTML video

**Spec:** `docs/superpowers/specs/2026-08-25-pixels-galaxy-storefront-design.md` plus the approved interaction inventory derived from `ZipString _ As seen on SHARK TANK! - Google Chrome 2026-08-25 01-32-17.mp4`

## Global Constraints

- Preserve Pixels Galaxy branding, copy, products, prices, cart behavior, and current full-width video hero.
- Do not add ZipString logos, product names, or branded imagery.
- Do not add backend checkout, network form submission, or third-party animation/carousel dependencies.
- Use transforms and opacity for motion; avoid layout-triggering animation properties.
- Respect `prefers-reduced-motion: reduce` by disabling autoplay-on-hover, marquees, reveal transforms, decorative rotation, and parallax.
- Maintain keyboard equivalence for every hover-revealed action through `:focus-within` or always-visible mobile controls.
- Do not commit or modify the untracked files `assets/videos/main banner2.mp4`, `assets/videos/v1.mp4`, `assets/videos/v2.mp4`, or `assets/videos/v3.mp4` unless the user separately assigns them.
- Do not add a unit-test suite; verify with production builds and explicit desktop/mobile browser checks, as previously requested.

---

### Task 1: Direction-aware header and navigation micro-interactions

**Files:**
- Create: `components/layout/ScrollHeader.tsx`
- Modify: `components/layout/SiteHeader.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `ScrollHeader({ children }: { children: React.ReactNode })` with states `data-scroll-state="top|shown|hidden"`.
- Consumes: existing `SiteHeader`, primary navigation links, and mobile menu.

- [ ] **Step 1: Implement scroll-direction state**

Create a passive scroll listener using `requestAnimationFrame`. Keep the header visible within the first 80 pixels, hide it after downward movement exceeding 12 pixels, and show it after upward movement exceeding 8 pixels. Do not update React state when the computed state is unchanged.

- [ ] **Step 2: Wrap the site header**

Render `SiteHeader` inside `ScrollHeader` without moving the announcement bar. Keep the mobile menu fixed and unaffected by header transforms while open.

- [ ] **Step 3: Add recorded header transitions**

Use `position: sticky; top: 0; transform: translateY(-110%)` for the hidden state, `translateY(0)` for shown/top states, a 260 ms cubic-bezier transition, and a subtle shadow only after leaving the top. Add white pill-shaped backgrounds for navigation hover/focus with a 160 ms color/scale transition.

- [ ] **Step 4: Verify header behavior**

Run: `npm run build`

Browser checks at 1440 and 390 pixels: scroll down past the hero and confirm the header hides; scroll upward and confirm it returns; open the mobile menu and confirm it remains operable; tab through navigation and confirm pill focus treatment.

- [ ] **Step 5: Commit the header interaction**

```bash
git add components/layout/ScrollHeader.tsx components/layout/SiteHeader.tsx app/page.tsx app/globals.css
git commit -m "feat: add direction-aware storefront header"
```

### Task 2: Hero controls and continuous press-logo marquee

**Files:**
- Create: `components/ui/VideoControl.tsx`
- Create: `components/ui/Marquee.tsx`
- Modify: `components/sections/HeroSection.tsx`
- Modify: `components/sections/PressStrip.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `VideoControl({ videoRef, label }: { videoRef: React.RefObject<HTMLVideoElement | null>; label: string })` with play/pause state synchronized through native media events.
- Produces: `Marquee({ children, duration, direction?, className? })` that duplicates one accessible-hidden visual track.

- [ ] **Step 1: Convert the hero to a controlled client component**

Hold a video ref, listen for `play` and `pause`, and replace the decorative play badge with a real circular play/pause button. Preserve muted autoplay, looping, inline playback, overlay copy, and CTA.

- [ ] **Step 2: Match hero CTA feedback**

Animate the CTA between orange and deep blue on hover/focus, shift the arrow by 5 pixels, and return cleanly on pointer exit. Keep the transition under 200 ms.

- [ ] **Step 3: Implement the press-logo marquee**

Render two copies of the logo sequence in one moving track, hide the duplicate from assistive technology, and animate a seamless leftward loop over 28 seconds. Pause on hover/focus and switch to a static wrapping row for reduced motion.

- [ ] **Step 4: Verify media and marquee behavior**

Run: `npm run build`

Browser checks: pause and resume the hero with mouse and keyboard; confirm the icon follows actual playback; confirm the press track loops without a gap, creates no page overflow, and becomes static under reduced motion.

- [ ] **Step 5: Commit hero and press interactions**

```bash
git add components/ui/VideoControl.tsx components/ui/Marquee.tsx components/sections/HeroSection.tsx components/sections/PressStrip.tsx app/globals.css
git commit -m "feat: animate hero controls and press marquee"
```

### Task 3: Interactive product cards and promotional video

**Files:**
- Create: `components/ui/HoverVideo.tsx`
- Modify: `lib/storefront/types.ts`
- Modify: `lib/storefront/content.ts`
- Modify: `components/store/ProductCard.tsx`
- Modify: `components/sections/BestSellers.tsx`
- Modify: `components/sections/PromoBanner.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Extends: `ProductMedia` with optional `hoverVideo?: string` and `actionLabel?: "ADD TO CART" | "VIEW PRODUCT"`.
- Produces: `HoverVideo({ src, poster, alt, onPlaybackChange })` that plays muted on pointer/focus entry and pauses/resets on exit.
- Consumes: existing `useCart()` for direct card additions and existing product category tabs.

- [ ] **Step 1: Add optional card-interaction data**

Attach hover video sources only when local or configured media exists; cards without video retain image zoom and action reveal. Set `actionLabel` per product according to whether it can be added directly or should scroll to the featured selector.

- [ ] **Step 2: Implement hover/focus playback**

Load card videos with `preload="metadata"`; play muted on pointer enter or focus within; show a centered pause indicator while playing; pause and reset on exit. Skip playback for reduced motion or coarse pointers.

- [ ] **Step 3: Add contextual card actions**

Fade and translate a white pill action into the lower media area. `ADD TO CART` adds one unit and opens the drawer; `VIEW PRODUCT` moves focus to `#featured`. Keep the action visible on touch layouts.

- [ ] **Step 4: Animate tab content changes**

Apply a short opacity/translate transition keyed by active category while retaining existing ARIA tabs. Do not invent a recording-specific tab action beyond this existing behavior.

- [ ] **Step 5: Make the promotional banner controllable**

Use the same real play/pause control pattern as the hero and retain its overlay CTA. If the current promo continues to use an image, add the control only after a real video source is assigned; do not render a fake button.

- [ ] **Step 6: Verify product interactions**

Run: `npm run build`

Browser checks: hover each product; confirm video cards play/reset and image cards zoom; confirm contextual actions work by keyboard; confirm direct add opens the cart; switch tabs repeatedly; confirm no videos continue off-screen.

- [ ] **Step 7: Commit product media interactions**

```bash
git add lib/storefront components/ui/HoverVideo.tsx components/store/ProductCard.tsx components/sections/BestSellers.tsx components/sections/PromoBanner.tsx app/globals.css
git commit -m "feat: add recorded product media interactions"
```

### Task 4: Featured gallery motion, rotating badge, and bundle feedback

**Files:**
- Create: `components/ui/RotatingBadge.tsx`
- Modify: `components/store/ProductGallery.tsx`
- Modify: `components/store/PurchasePanel.tsx`
- Modify: `components/sections/FeaturedProduct.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `RotatingBadge({ text }: { text: string })` with decorative circular text and a static reduced-motion state.
- Extends: `ProductGallery` with `previous()`, `next()`, and an `aria-live="polite"` active-media announcement.
- Consumes: existing bundle state in `PurchasePanel`.

- [ ] **Step 1: Add gallery arrows and transitions**

Render left/right arrow buttons over the main media. Wrap at either end, fade/scale between active items over 220 ms, preserve thumbnail selection, and announce the new media label.

- [ ] **Step 2: Add the rotating bestseller badge**

Position a continuously rotating circular `PIXELS • GALAXY • BEST SELLER •` badge above the gallery corner at desktop widths; keep the center icon static and stop rotation for reduced motion.

- [ ] **Step 3: Strengthen bundle selection motion**

Animate background, border, and a small selected check indicator. Keep the actual radio inputs and existing quantity synchronization as the source of truth.

- [ ] **Step 4: Verify the purchase section**

Run: `npm run build`

Browser checks: use arrows, thumbnails, and keyboard controls; confirm wrapping and announcements; choose all bundles; verify quantities and price displays remain coherent; confirm reduced motion stops the badge.

- [ ] **Step 5: Commit featured-product interactions**

```bash
git add components/ui/RotatingBadge.tsx components/store/ProductGallery.tsx components/store/PurchasePanel.tsx components/sections/FeaturedProduct.tsx app/globals.css
git commit -m "feat: animate featured product interactions"
```

### Task 5: Scroll reveals, testimonial depth, social overlays, and story composition

**Files:**
- Create: `components/ui/Reveal.tsx`
- Modify: `components/sections/TricksGrid.tsx`
- Modify: `components/sections/Testimonials.tsx`
- Modify: `components/sections/SocialFeed.tsx`
- Modify: `components/sections/BrandStory.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `Reveal({ children, delay?, className? })` using one shared `IntersectionObserver` behavior and `data-visible` state.
- Consumes: existing trick, testimonial, social, and story data.

- [ ] **Step 1: Build the reveal primitive**

Reveal once when 15% of an element enters the viewport, allow delays from 0 to 320 ms, and render visible immediately when reduced motion is active or `IntersectionObserver` is unavailable.

- [ ] **Step 2: Apply staggered trick-card reveals**

Reveal tiles in row order, add media zoom and darker overlay on hover/focus, and translate the action/play badge by no more than 6 pixels. Keep all labels readable without hover.

- [ ] **Step 3: Recompose testimonial depth**

Retain semantic source order while using desktop grid offsets, slight rotations between -2 and 2 degrees, and staggered entry. Add only a restrained scroll-linked vertical offset based on a CSS custom property updated through one throttled listener; disable it below 900 pixels and for reduced motion.

- [ ] **Step 4: Add contextual social overlays**

Reveal per-card labels such as `SHOP THE LOOK`, `SEE THE CHALLENGE`, and `FROM THE COMMUNITY` with gradient overlays. Show the same content persistently on coarse pointers and expose links to keyboard users.

- [ ] **Step 5: Layer the story imagery**

Render two overlapping story media cards with opposite slight rotations, responsive containment, and staggered reveal. Preserve the existing story copy and CTA.

- [ ] **Step 6: Verify lower-page motion**

Run: `npm run build`

Browser checks: scroll slowly and quickly; confirm reveals run once, testimonial movement stays subtle, overlays are keyboard accessible, touch layouts expose actions, and no section causes horizontal overflow.

- [ ] **Step 7: Commit scroll and content motion**

```bash
git add components/ui/Reveal.tsx components/sections app/globals.css
git commit -m "feat: add recorded scroll and content motion"
```

### Task 6: Persistent quick-purchase bar and angled awards marquee

**Files:**
- Create: `components/cart/QuickPurchaseBar.tsx`
- Create: `components/sections/AwardsMarquee.tsx`
- Modify: `lib/storefront/content.ts`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `QuickPurchaseBar({ productId }: { productId: string })` using `IntersectionObserver` sentinels to set `data-visible` after the featured section leaves above the viewport and hide before the footer.
- Produces: `AwardsMarquee({ awards }: { awards: Array<{ name: string; image?: string }> })` with a primary track and a faded reflected track.
- Consumes: `featuredProduct`, existing `useCart()`, and awards content from `siteContent`.

- [ ] **Step 1: Add award content and marquee section**

Define editable award names in centralized data. Place the marquee between social content and the story, rotate its visual wrapper by approximately -3 degrees, and animate the main and reflected tracks in opposite directions over 34 seconds.

- [ ] **Step 2: Implement the quick-purchase visibility rules**

Show the fixed bottom bar only after the featured product scrolls above the viewport. Include thumbnail, product name, current base price, and a bright `CHOOSE` button that scrolls to and focuses the first bundle radio. Hide the bar when the cart drawer opens or the footer enters view.

- [ ] **Step 3: Make the bar responsive and accessible**

Keep a 48-pixel minimum target size, respect safe-area insets, avoid covering mobile browser controls, and announce neither appearance nor disappearance. The bar must not trap focus.

- [ ] **Step 4: Verify sticky and marquee behavior**

Run: `npm run build`

Browser checks: cross both visibility boundaries slowly and by large scroll jumps; confirm `CHOOSE` focuses the bundle selector; open the cart and confirm the bar hides; confirm both award tracks loop without gaps and stop for reduced motion.

- [ ] **Step 5: Commit persistent purchase interactions**

```bash
git add components/cart/QuickPurchaseBar.tsx components/sections/AwardsMarquee.tsx lib/storefront/content.ts app/page.tsx app/globals.css
git commit -m "feat: add quick purchase bar and awards marquee"
```

### Task 7: Integrated interaction and performance verification

**Files:**
- Modify as needed: `components/**/*.tsx`, `app/globals.css`

**Interfaces:**
- Consumes: all prior interaction tasks.
- Produces: a verified interaction system with no console errors, keyboard regressions, overflow, or unbounded media playback.

- [ ] **Step 1: Run the complete production build**

Run: `npm run build`

Expected: exit code 0; `/`, `/robots.txt`, `/sitemap.xml`, and `/opengraph-image` are generated successfully.

- [ ] **Step 2: Verify desktop interactions**

At 1440 pixels, exercise scroll-aware header, hero control, press marquee, every product card, tabs, promo control when present, gallery arrows/thumbnails, bundles, trick cards, testimonials, social overlays, awards marquee, story reveals, quick bar, cart drawer, and newsletter validation.

- [ ] **Step 3: Verify mobile interactions**

At 390 pixels, confirm no hover-only information is hidden, header/menu/cart remain reachable, videos do not autoplay on hover assumptions, quick bar respects safe-area spacing, and `document.documentElement.scrollWidth === document.documentElement.clientWidth`.

- [ ] **Step 4: Verify reduced motion**

Emulate reduced motion and confirm all content is immediately visible, looping marquees and rotating badges stop, hover videos stay paused, and essential selection/cart feedback remains understandable.

- [ ] **Step 5: Inspect runtime health**

Confirm the browser console contains no application errors or warnings; inspect active video elements after leaving each section and verify only the hero or intentionally active visible media remains playing.

- [ ] **Step 6: Commit final interaction polish**

```bash
git add components app lib
git commit -m "chore: verify recorded storefront interactions"
```
