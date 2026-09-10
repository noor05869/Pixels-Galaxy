# Full-Project Tailwind CSS and Radix UI Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. The user’s ban on adding tests overrides the default TDD workflow: run the existing tests, but do not create or modify test files or test configuration.

**Goal:** Replace the project’s selector-based CSS with Tailwind CSS utilities and replace the existing custom mobile-menu and cart-drawer dialogs with Radix Dialog, without changing appearance, behavior, copy, or application logic.

**Architecture:** Tailwind v4 is configured through PostCSS and CSS-first theme tokens in `app/globals.css`; component presentation moves into the existing JSX through exact utilities and arbitrary values. `@radix-ui/react-dialog` supplies the behavior layer only for the two existing custom dialogs, while native form and disclosure elements remain native. The legacy stylesheet stays temporarily during staged conversion, then is reduced to the Tailwind entry/configuration, global document defaults, and animation keyframes after every consumer is ported.

**Tech Stack:** Next.js 15.5.24, React, TypeScript 5.9.3, Tailwind CSS v4, `@tailwindcss/postcss`, PostCSS, `@radix-ui/react-dialog`

**Spec:** `docs/superpowers/specs/2026-09-10-full-project-tailwind-radix-migration-design.md`

## Global Constraints

- Do not change design, layout, spacing, colors, typography, copy, DOM content order, URLs, data, or business behavior.
- Do not add tests, testing libraries, test configuration, linting, formatting, Storybook, CI/CD, or unrelated abstractions.
- Do not change Supabase, Resend, Zod, order, cart, SEO, or email logic except for the minimum JSX/class wiring needed by this styling migration.
- Do not add dependencies beyond `tailwindcss`, `@tailwindcss/postcss`, `postcss`, and `@radix-ui/react-dialog`.
- Do not upgrade or downgrade any existing package.
- Keep native `<select>`, radio, checkbox, and `<details>/<summary>` controls native.
- Preserve exact custom breakpoints: 960, 900, 850, 820, 760, 560, 540, and 480 pixels.
- Preserve the current `prefers-reduced-motion` and coarse-pointer behavior.
- Do not touch the pre-existing untracked `.worktrees/` directory.
- Do not modify `app/opengraph-image.tsx`; its inline Satori styles are outside the browser CSS layer.

## File Map

**Create**

- `postcss.config.mjs` — Tailwind v4 PostCSS plugin registration.

**Modify**

- `package.json`, `package-lock.json` — add only the four approved packages.
- `app/globals.css` — Tailwind import/theme and retained global/keyframe definitions; delete legacy selectors after migration.
- `app/layout.tsx` — root document/body/skip-link utilities.
- `app/checkout/layout.tsx`, `app/checkout/page.tsx` — checkout shell utilities.
- `app/admin/layout.tsx`, `app/admin/login/page.tsx`, `app/admin/orders/page.tsx`, `app/admin/orders/loading.tsx`, `app/admin/orders/[orderNumber]/page.tsx` — admin route utilities.
- `components/ui/{MediaFrame,Price,Reveal,RotatingBadge,SectionHeading,Stars,VideoControl}.tsx` — shared utility migration.
- `components/layout/{AnnouncementBar,NewsletterForm,ScrollHeader,SiteFooter,SiteHeader}.tsx` — storefront shell migration and Radix mobile menu.
- `components/sections/{AwardsMarquee,BestSellers,BrandStory,FeaturedProduct,HeroSection,PressStrip,PromoBanner,SeoProductGuide,SocialFeed,Testimonials,TricksGrid,TrustMetrics}.tsx` — all maintained storefront sections, including currently unmounted ones.
- `components/store/{ProductCard,ProductGallery,PurchasePanel}.tsx` and `components/cart/{CartDrawer,QuickPurchaseBar}.tsx` — product/cart utilities and Radix cart dialog.
- `components/checkout/{CheckoutForm,OrderSummary}.tsx` — checkout utilities.
- `components/policies/PolicyPage.tsx` — FAQ/policy utilities.
- `components/admin/{AdminDashboardHeader,AdminLoginForm,LogoutButton,OrderDetail,OrdersTable,OrderStatusForm}.tsx` — admin utilities.

**Do not modify**

- Existing `*.test.ts` and `*.test.tsx` files, `vitest.config.ts`, application logic under `lib/`, API routes, Supabase migrations, Resend integration, Zod schemas, and `app/opengraph-image.tsx`.

---

### Task 1: Record the baseline and install the styling foundation

**Files:**
- Create: `postcss.config.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app/globals.css`

**Interfaces:**
- Produces Tailwind theme utilities for the exact final cascade values.
- Adds `@radix-ui/react-dialog` as the only runtime UI dependency.
- Leaves all existing component exports and application state untouched.

- [ ] **Step 1: Verify the clean implementation baseline**

Run:

```powershell
git status --short
npm test
npm run build
```

Expected: tests and build pass before migration; record any pre-existing failure instead of attributing it to the migration. Preserve the untracked `.worktrees/` entry.

- [ ] **Step 2: Capture visual baselines without adding repository artifacts**

Run `npm run dev`, open the routes below, and keep screenshots outside the repository at 1440×1000, 850×1000, 560×900, and 390×844:

- `/`
- `/checkout`
- `/faq`
- `/policies/delivery`
- `/policies/privacy`
- `/policies/returns`
- `/admin/login`

For `/`, also capture the mobile menu open, empty cart open, populated cart open, bundle options, gallery navigation, and the quick-purchase bar after scrolling. Record hover, focus-visible, invalid, disabled, coarse-pointer, and reduced-motion observations that screenshots do not convey.

- [ ] **Step 3: Install only the approved dependencies**

Run:

```powershell
npm install @radix-ui/react-dialog
npm install --save-dev tailwindcss @tailwindcss/postcss postcss
```

Inspect `package.json` and `package-lock.json`. Expected: no existing version changes; only `@radix-ui/react-dialog` is added to `dependencies`, and only `tailwindcss`, `@tailwindcss/postcss`, and `postcss` are added to `devDependencies`.

- [ ] **Step 4: Add the Tailwind v4 PostCSS configuration**

Create `postcss.config.mjs` exactly as:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

Do not create `tailwind.config.*`; Tailwind v4 configuration is CSS-first and belongs in `app/globals.css`.

- [ ] **Step 5: Add the Tailwind entry and exact theme tokens before the legacy rules**

Place this at the top of `app/globals.css` so the still-unported legacy rules continue to win until their consumers are migrated:

```css
@import "tailwindcss";

@theme {
  --color-shell: #0d1118;
  --color-panel: #18232d;
  --color-navy: #0d1118;
  --color-ink: #101820;
  --color-lime: #d9ff57;
  --color-orange: #58d7c8;
  --color-logo-cyan: #48ded8;
  --color-warm-white: #f4f2e9;
  --font-sans: Arial, Helvetica, sans-serif;
  --radius-brand: 16px;
  --shadow-brand: 0 18px 55px rgba(0, 0, 0, 0.28);
}
```

Use arbitrary utilities for exact values that are not repeated enough to justify a token.

- [ ] **Step 6: Verify the foundation before component conversion**

Run:

```powershell
npm test
npm run build
git diff --check
```

Expected: no application behavior change and no test/build regression.

- [ ] **Step 7: Commit the foundation checkpoint**

```powershell
git add package.json package-lock.json postcss.config.mjs app/globals.css
git commit -m "build: configure Tailwind and Radix dialog"
```

---

### Task 2: Port the document shell and shared UI building blocks

**Files:**
- Modify: `app/layout.tsx`
- Modify: `components/ui/MediaFrame.tsx`
- Modify: `components/ui/Price.tsx`
- Modify: `components/ui/Reveal.tsx`
- Modify: `components/ui/RotatingBadge.tsx`
- Modify: `components/ui/SectionHeading.tsx`
- Modify: `components/ui/Stars.tsx`
- Modify: `components/ui/VideoControl.tsx`
- Modify: `components/layout/AnnouncementBar.tsx`
- Modify: `components/layout/NewsletterForm.tsx`
- Modify: `components/layout/ScrollHeader.tsx`
- Modify: `components/layout/SiteFooter.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Preserve all component names, props, children, DOM content, aria attributes, and data-driven inline values.
- `Reveal` continues to accept `delay` and arbitrary caller `className` values.
- `MediaFrame` continues to accept `media`, `priority`, and caller `className` values.

- [ ] **Step 1: Move root document and skip-link presentation to utilities**

Give `<body>` the exact shell background, radial/linear background image, warm-white text, Arial stack, and horizontal clipping. Replace `.skip-link` with fixed-position, translated, white/navy, padded, rounded, focus-restored utilities. Preserve the `CartProvider`, skip-link, children, and `CartDrawer` order exactly.

- [ ] **Step 2: Port shared UI primitives with exact state variants**

Apply utilities that reproduce these contracts:

- `MediaFrame`: relative overflow container, `#0b2255` fallback, cover image, 32px bold fallback, 54px blue play badge; preserve inline aspect ratio/gradient.
- `Price`: flex row, 8px gap, `#247e73`, 13px `#8290a8` compare-at value.
- `Stars`: block, 10px vertical margin, weight 900, `#1c8f82`; keep count navy.
- `SectionHeading`: exact clamp sizes/line height/margins and orange eyebrow.
- `RotatingBadge`: exact `118px`, `right:-32px`, `top:-45px`, spin duration, mobile right offset, and reduced-motion stop.
- `Reveal`: opacity/30px translate transition, exact delay property, `data-[visible=true]` final state, and reduced-motion final state.
- `VideoControl`: exact 54px/46px responsive circle, position, panel background, border, lime icon, and focus ring.

Use template strings to merge the fixed utilities with caller-supplied `className`; do not add a class-merging dependency or new helper abstraction.

- [ ] **Step 3: Port announcement, scroll header, footer, and newsletter**

Preserve the announcement’s 36px final height, three-column desktop alignment, 10px typography, and single centered mobile message. Preserve the scroll header’s sticky z-index, hidden/shown data states, easing, drop shadow, will-change, and reduced-motion override. Preserve footer widths, five/two/one-column breakpoints, cyan/muted colors, pill newsletter control, search link states, borders, and exact 900/560px layout changes.

- [ ] **Step 4: Remove only the selectors whose consumers were ported**

Delete the root/body/skip-link and shared/layout selector blocks now represented by utilities, but retain the Tailwind import, `@theme`, required global document defaults, keyframes, and selectors for tasks not yet completed. Confirm the visual winner is the later night-theme declaration when duplicate legacy declarations exist.

- [ ] **Step 5: Verify the shared conversion**

Run `npm test`, `npm run build`, and `git diff --check`. Compare header/footer/shared media on `/`, `/checkout`, and `/admin/login` against the baseline at desktop and mobile widths.

- [ ] **Step 6: Commit the shared-shell checkpoint**

```powershell
git add app/layout.tsx app/globals.css components/ui components/layout/AnnouncementBar.tsx components/layout/NewsletterForm.tsx components/layout/ScrollHeader.tsx components/layout/SiteFooter.tsx
git commit -m "refactor: migrate shared styling to Tailwind"
```

---

### Task 3: Port all storefront sections and product presentation

**Files:**
- Modify: `components/sections/AwardsMarquee.tsx`
- Modify: `components/sections/BestSellers.tsx`
- Modify: `components/sections/BrandStory.tsx`
- Modify: `components/sections/FeaturedProduct.tsx`
- Modify: `components/sections/HeroSection.tsx`
- Modify: `components/sections/PressStrip.tsx`
- Modify: `components/sections/PromoBanner.tsx`
- Modify: `components/sections/SeoProductGuide.tsx`
- Modify: `components/sections/SocialFeed.tsx`
- Modify: `components/sections/Testimonials.tsx`
- Modify: `components/sections/TricksGrid.tsx`
- Modify: `components/sections/TrustMetrics.tsx`
- Modify: `components/store/ProductCard.tsx`
- Modify: `components/store/ProductGallery.tsx`
- Modify: `components/store/PurchasePanel.tsx`
- Modify: `components/cart/QuickPurchaseBar.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Preserve all exported props and all current media/cart/WhatsApp behavior.
- Keep native radios and selects in `PurchasePanel`.
- Keep native details/summary disclosure in `SeoProductGuide`.
- Keep only the data-driven product swatch inline style.

- [ ] **Step 1: Port the hero, press strip, trust metrics, and promotional banner**

Translate every winning declaration—including pseudo-element overlays—to utilities. Preserve the hero’s full-width 590–800px stage, exact banner filter, dual gradients, overlay/offer/spec rail geometry, 850/540px branches, lime CTA hover inversion, and icon translation. Preserve the 28s press marquee/pause/reduced-motion behavior, four/two-column trust grid, and promo media overlay/height/radius.

- [ ] **Step 2: Port featured product, gallery, and purchase panel**

Preserve the 1320px width, `1.1fr/.9fr` desktop split, 55px gap, 900px single-column switch, desktop sticky gallery, seven thumbnails, current-item lime border, 46px arrows, gallery entry animation, exact heading/benefit/stock/bundle/quantity/action styling, 560px form layout, and WhatsApp states. Replace `.selected` presentation with a conditional Tailwind string tied to the existing `bundle.id` condition; do not change selection logic or form markup.

- [ ] **Step 3: Port product cards, BestSellers, and quick purchase bar**

Preserve the single 440px BestSellers grid, product card radius/border/hover lift, image zoom, hover-video/coarse-pointer/reduced-motion behavior, action reveal, badge, swatches, WhatsApp styles, quick-bar visibility data state, safe-area bottom position, 900/560px branches, and exact transitions. Keep `QuickPurchaseBar.choose()` targeting the existing native radio input.

- [ ] **Step 4: Port the remaining maintained storefront sections**

Port `SocialFeed`, `AwardsMarquee`, `BrandStory`, `SeoProductGuide`, `Testimonials`, and `TricksGrid`, including all grid changes, nth-child positioning, group hover/focus relationships, pseudo-element gradients, reflected marquee, coarse-pointer fallbacks, and reduced-motion branches. Keep `details/summary` native and use Tailwind marker utilities. Port currently unmounted components too so no stylesheet rule is retained solely for dormant code.

- [ ] **Step 5: Remove converted storefront selectors and dead rules**

Delete all migrated storefront/product selector blocks from `app/globals.css`. Remove dead `.tabs` and any other selector with no JSX consumer instead of creating a Radix component for it. Keep only unported dialog, checkout, policy, and admin selectors plus global/keyframe definitions at this checkpoint.

- [ ] **Step 6: Verify storefront parity**

Run `npm test`, `npm run build`, and `git diff --check`. Compare `/` at all four baseline widths and verify hero, marquees, gallery, bundle/native selects, cart-opening actions, quick bar, hover/focus/coarse-pointer states, and reduced motion.

- [ ] **Step 7: Commit the storefront checkpoint**

```powershell
git add app/globals.css components/sections components/store components/cart/QuickPurchaseBar.tsx
git commit -m "refactor: migrate storefront styling to Tailwind"
```

---

### Task 4: Replace the custom mobile menu and cart drawer with Radix Dialog

**Files:**
- Modify: `components/layout/SiteHeader.tsx`
- Modify: `components/cart/CartDrawer.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Preserve `SiteHeader()` and `CartDrawer()` exports.
- Preserve `useCart()` ownership of `isOpen`, `openCart`, and `closeCart`.
- Preserve menu links, cart handlers, cart line rendering, totals, and checkout navigation.

- [ ] **Step 1: Convert the mobile menu to a controlled Radix Dialog**

Import `* as Dialog` from `@radix-ui/react-dialog`. Keep the existing `open` state and use:

```tsx
<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog.Trigger asChild>{/* existing menu button */}</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Content>{/* hidden title, close button, existing links */}</Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

Use `Dialog.Title` with Tailwind `sr-only`, `Dialog.Close asChild` for the existing X button, and preserve each link’s explicit `setOpen(false)`. Style `Dialog.Content` as the exact current fixed full-screen panel (`#101820`, z-index 100, centered links, same type/gaps) with no new overlay, animation, or visual affordance. Port the rest of the header to exact Tailwind utilities, including the 88/82px heights, 850px breakpoint, logo filter/widths, nav hover/focus pill, and cart badge.

- [ ] **Step 2: Convert the cart drawer to a controlled Radix Dialog**

Use `Dialog.Root open={isOpen} onOpenChange={(nextOpen) => { if (!nextOpen) closeCart(); }}` with `Dialog.Portal`, `Dialog.Overlay`, `Dialog.Content`, `Dialog.Title`, and `Dialog.Close asChild`. Remove the manual global Escape listener, conditional early return, custom backdrop mouse handler, and heading ref. Use `onOpenAutoFocus` only if needed to focus the title exactly as the current implementation does; do not add entrance/exit animation because none exists now.

Apply the current backdrop blur/color to `Dialog.Overlay` and the current fixed right-edge 520px cream drawer geometry to `Dialog.Content`. Port every empty/line/stepper/total/checkout/focus style to utilities without changing cart calculations or handlers.

- [ ] **Step 3: Verify Radix behavior and exact appearance**

At desktop and mobile widths, verify both dialogs by mouse and keyboard:

- Trigger/close controls have the same visible geometry.
- Escape and outside interaction close the active dialog.
- Focus stays inside while open and the background is inert.
- Mobile menu links close the menu and navigate to the same anchors.
- Cart empty, populated, quantity, remove, total, disabled checkout, and enabled checkout states are unchanged.
- Opening the cart from the header, product panel, and product card still works.

Run `npm test`, `npm run build`, and `git diff --check`.

- [ ] **Step 4: Remove the last header/cart selectors**

Delete the legacy `.site-header`, `.brand`, `.desktop-nav`, `.header-actions`, `.cart-*`, `.menu-button`, `.mobile-menu`, `.cart-backdrop`, `.cart-drawer`, `.mini-stepper`, and cart checkout selector blocks after confirming their JSX utilities are complete.

- [ ] **Step 5: Commit the Radix checkpoint**

```powershell
git add components/layout/SiteHeader.tsx components/cart/CartDrawer.tsx app/globals.css
git commit -m "refactor: replace custom dialogs with Radix"
```

---

### Task 5: Port checkout styling without changing form behavior

**Files:**
- Modify: `app/checkout/layout.tsx`
- Modify: `app/checkout/page.tsx`
- Modify: `components/checkout/CheckoutForm.tsx`
- Modify: `components/checkout/OrderSummary.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Preserve every field name, id, validation attribute, autocomplete value, aria relationship, focus ref, state update, payload, and submit flow.
- Keep province/city selects, address/payment radios, consent checkbox, and text controls native.

- [ ] **Step 1: Port the checkout shell, header, intro, and card layouts**

Preserve the light `#f3f7fc` shell, panel header, 1240px page width, header/logo/button geometry, 820/560px breakpoints, two-column form/summary grid, card borders/radii/shadows, and sticky-to-static summary transition.

- [ ] **Step 2: Port every field and validation state**

Move field spacing, labels, inputs, textarea, native select arrow gradients, disabled/hover/focus/invalid/aria-invalid states, error summary, error links, honeypot positioning, address-type pills, payment options, consent block, and submit button styles into utilities. Use the existing React conditions for `is-selected`/`is-disabled` styling; do not replace native controls or touch validation logic.

- [ ] **Step 3: Port order summary and checkout state variants**

Preserve item grids, quantity badge, totals, COD note, loading/empty/success cards, success top gradient, focus outline, order-number block, payment pill, next-step cards, support link, and all 560px stacking behavior.

- [ ] **Step 4: Remove checkout-only selectors and verify**

Delete each checkout selector whose last consumer was ported in this task. Keep only the specific `.checkout-*` rules still consumed by the not-yet-ported admin layout/login components; record those consumers beside the retained block so Task 6 can remove it immediately after the admin JSX is converted. Verify `/checkout` in hydrated empty-cart and populated-cart states without placing an order. Run `npm test`, `npm run build`, and `git diff --check`.

- [ ] **Step 5: Commit the checkout checkpoint**

```powershell
git add app/checkout components/checkout app/globals.css
git commit -m "refactor: migrate checkout styling to Tailwind"
```

---

### Task 6: Port policy and admin styling

**Files:**
- Modify: `components/policies/PolicyPage.tsx`
- Modify: `app/admin/layout.tsx`
- Modify: `app/admin/login/page.tsx`
- Modify: `app/admin/orders/page.tsx`
- Modify: `app/admin/orders/loading.tsx`
- Modify: `app/admin/orders/[orderNumber]/page.tsx`
- Modify: `components/admin/AdminDashboardHeader.tsx`
- Modify: `components/admin/AdminLoginForm.tsx`
- Modify: `components/admin/LogoutButton.tsx`
- Modify: `components/admin/OrderDetail.tsx`
- Modify: `components/admin/OrdersTable.tsx`
- Modify: `components/admin/OrderStatusForm.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Preserve policy content rendering and all admin component props, links, fetch calls, router refreshes, form values, status mappings, and privacy behavior.
- Keep admin status `<select>` native.

- [ ] **Step 1: Port policy/FAQ presentation**

Translate the policy shell/header/hero/card/table/list styles, gradients, typography, dividers, and responsive widths to utilities in `PolicyPage`. Because `/faq` uses the same component, verify FAQ content and all three policy routes.

- [ ] **Step 2: Port admin route shells and shared header**

Move admin page width/padding, dashboard header, back link, headings, loading state, provider-error state, and checkout-derived admin shell styles to utilities. Preserve 760px layout changes.

- [ ] **Step 3: Port admin orders list/table/card states**

Port desktop table and mobile card layouts, 760/480px switches, overflow behavior, hover rows, PII text selection, links, status/notification badges, and every `data-status`/`data-state` color through Tailwind data variants.

- [ ] **Step 4: Port order detail and forms**

Port the 960/760/480px detail grids, panels, definition lists, line items, record list, total, logout form, native status select, focus rings, disabled states, and error/success banners. Remove the static inline layout object from `AdminLoginForm` and replace it with `grid-cols-1`, `max-w-[520px]`, `mx-auto`, `mt-[30px]`, and `text-left` utilities; preserve all client logic.

- [ ] **Step 5: Remove policy/admin and retained shared selectors, then verify**

Delete the remaining `.policy-*`, `.admin-*`, and retained admin-consumed `.checkout-*` selector rules from `app/globals.css`. Verify `/faq`, every policy route, and `/admin/login` at desktop/mobile sizes. If authenticated admin data is already locally available, inspect list/detail/read-only states without changing an order. Run `npm test`, `npm run build`, and `git diff --check`.

- [ ] **Step 6: Commit the route checkpoint**

```powershell
git add app/admin components/admin components/policies/PolicyPage.tsx app/globals.css
git commit -m "refactor: migrate policy and admin styling to Tailwind"
```

---

### Task 7: Purge legacy CSS and complete parity verification

**Files:**
- Modify: `app/globals.css`
- Modify: only files listed in Tasks 2–6 if parity review identifies a migration defect.

**Interfaces:**
- Final `app/globals.css` is the Tailwind entry/configuration file, not a component stylesheet.
- No project behavior or public component interface changes.

- [ ] **Step 1: Reduce globals to Tailwind-owned global concerns**

Keep only:

- `@import "tailwindcss"`.
- `@theme` token declarations.
- Minimal document-level defaults that cannot live on a single JSX node.
- The existing named keyframes still referenced by Tailwind animation utilities: `press-marquee`, `tab-enter`, `gallery-in`, `badge-spin`, and `awards-move`.

Do not retain semantic component selectors or use `@apply` to recreate them.

- [ ] **Step 2: Prove old stylesheet code is gone**

Run:

```powershell
rg --files -g "*.css" -g "*.scss" -g "*.sass" -g "*.less"
rg -n "^\s*\.[A-Za-z_-]" app/globals.css
rg -n "@apply" app components
```

Expected: only `app/globals.css` exists; it has no legacy class-selector rules; `@apply` is absent.

- [ ] **Step 3: Audit dependency and scope boundaries**

Run:

```powershell
npm ls --depth=0
git diff -- package.json package-lock.json
git diff --name-only
```

Expected: the only new packages are the three Tailwind/PostCSS development dependencies and `@radix-ui/react-dialog`; no existing dependency version changes; no test/config, `lib/`, API, Supabase, Resend, Zod, SEO, or unrelated files appear in the diff.

- [ ] **Step 4: Complete side-by-side visual verification**

Compare the migrated routes and states against every baseline capture at 1440×1000, 850×1000, 560×900, and 390×844. Check geometry, wrapping, image crop, colors, gradients, borders, radii, shadows, font family/weight/size/line height/letter spacing, overflow, sticky/fixed positioning, and all hover/focus/selected/disabled/invalid states. Correct only confirmed migration differences.

- [ ] **Step 5: Complete interaction and accessibility verification**

Verify:

1. Mobile menu and cart are Radix dialogs with trapped focus, inert background, Escape/outside dismissal, preserved close buttons, and unchanged visuals.
2. Product gallery, bundle radios, native color selects, quantity controls, add-to-cart, WhatsApp links, cart quantity/removal, and checkout navigation behave unchanged.
3. Checkout validation/focus, native selects/radios/checkbox, admin login, and native FAQ disclosure behave unchanged.
4. Scroll header, quick-purchase bar, hover videos, reveal effects, marquees, and all reduced-motion/coarse-pointer fallbacks match the baseline.

- [ ] **Step 6: Run final automated verification**

Run:

```powershell
npm test
npm run build
git diff --check
git status --short
```

Expected: existing tests pass, production build succeeds, whitespace check is clean, and no unplanned files appear. After the planned checkpoint commits, the only remaining status entry is the pre-existing untracked `.worktrees/` directory.

- [ ] **Step 7: Commit the completed migration**

```powershell
git add app components package.json package-lock.json postcss.config.mjs docs/superpowers/specs/2026-09-10-full-project-tailwind-radix-migration-design.md docs/superpowers/plans/2026-09-10-full-project-tailwind-radix-migration.md
git commit -m "refactor: complete Tailwind and Radix migration"
```
