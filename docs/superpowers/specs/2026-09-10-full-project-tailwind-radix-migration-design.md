# Full-Project Tailwind CSS and Radix UI Migration Design

## Purpose

Migrate the existing Next.js 15 App Router project from its single global selector stylesheet to Tailwind CSS utilities while preserving the rendered design and behavior exactly. Replace only the two custom modal-style primitives already present—the mobile navigation and cart drawer—with the unstyled Radix Dialog primitive.

## Scope

- Add Tailwind CSS v4, its PostCSS integration, and PostCSS.
- Add `@radix-ui/react-dialog` as the only Radix package.
- Port every selector in `app/globals.css` to Tailwind utilities in the existing React components, including currently unmounted but maintained components such as `BestSellers`, `PromoBanner`, `Testimonials`, and `TricksGrid`.
- Retain `app/globals.css` only as the Tailwind entry point, CSS-first theme configuration, global document defaults that cannot be represented on a single JSX node, and keyframe definitions used by Tailwind animation utilities.
- Preserve current copy, DOM ordering except for the wrappers required by Radix Dialog, component APIs, application logic, data flow, media, and responsive behavior.
- Use the existing test suite and build command for verification. Do not add, remove, or rewrite tests or test configuration.

## Current-State Inventory

- Styling is contained in `app/globals.css`; there are no CSS Modules or other stylesheet files.
- The stylesheet has overlapping historical declarations. The later “Sleek Night Lab” rules win in the cascade and therefore define the visual baseline where declarations conflict.
- Styled UI spans the root shell, storefront, cart, checkout, policy, and admin components.
- The only custom modal primitives are:
  - `components/layout/SiteHeader.tsx`: a conditionally rendered full-screen mobile menu with `role="dialog"`.
  - `components/cart/CartDrawer.tsx`: a custom overlay/drawer with manual Escape handling and outside-click dismissal.
- Product, checkout, and admin dropdowns are native `<select>` elements; bundle/address/payment choices are native inputs; FAQ disclosure is native `<details>/<summary>`. These are platform controls, not custom-built primitives, so they remain native.
- There are no implemented custom tooltips, tablists, or custom accordions. The `.tabs` rules in `app/globals.css` are dead CSS and will be removed, not replaced.

## Chosen Approach

Use Tailwind v4’s CSS-first configuration. `postcss.config.mjs` enables `@tailwindcss/postcss`; `app/globals.css` imports Tailwind and declares exact project tokens with `@theme`. Existing nonstandard breakpoints remain exact through arbitrary variants such as `max-[850px]:`, `max-[560px]:`, and `max-[480px]:` rather than being rounded to Tailwind defaults.

Component styles move directly to `className` utilities. Arbitrary values preserve nonstandard measurements, font weights, colors, shadows, gradients, transition curves, selector relationships, and pseudo-elements. Conditional state already represented in React becomes conditional utility strings; DOM state remains expressed with Tailwind data, aria, group, peer, motion, hover, and focus variants.

Radix Dialog is adopted directly in the two owning components rather than introducing a new design-system wrapper. This keeps the change local and prevents an unrelated component abstraction. Radix owns modal semantics, focus containment, Escape dismissal, outside-click dismissal, portal rendering, and body interaction locking; Tailwind owns every visual property.

## Alternatives Considered

1. Tailwind v3 with `tailwind.config.ts`: rejected because the current official Next.js integration is Tailwind v4 and the JavaScript configuration file would be unnecessary migration-only boilerplate.
2. A hybrid migration using semantic classes and `@apply`: rejected because it would preserve a second component styling layer and make it harder to prove the old CSS is gone.
3. Replacing native select, radio, checkbox, and details controls with Radix: rejected because those controls are not custom primitives today and replacement would add dependencies and behavior changes outside the request.

## Exact Visual Contract

The implementation must preserve the browser-computed result of the current cascade, including:

- Final palette: shell `#0d1118`, panel `#18232d`, navy `#0d1118`, ink `#101820`, lime `#d9ff57`, orange `#58d7c8`, logo cyan `#48ded8`, warm white `#f4f2e9`.
- Brand radius `16px`, brand shadow `0 18px 55px rgba(0,0,0,.28)`, Arial/Helvetica fallback stack, and the existing body gradient.
- Exact breakpoints at 960, 900, 850, 820, 760, 560, 540, and 480 pixels, plus coarse-pointer and reduced-motion branches.
- Existing keyframes and durations for press marquee, tab entry on the maintained product-grid component, gallery entry, rotating badge, awards marquee, reveal transitions, and media hover transitions.
- All current hover, focus-visible, disabled, selected, invalid, data-status, data-state, and aria-current styles.

## Intentional Inline-Style Exceptions

- `app/opengraph-image.tsx` remains inline-styled because Next.js `ImageResponse`/Satori rendering is separate from the browser Tailwind bundle.
- `components/ui/MediaFrame.tsx` keeps data-driven `aspectRatio` and gradient values inline.
- `components/ui/Reveal.tsx` keeps the data-driven `--reveal-delay` custom property inline.
- `components/store/ProductCard.tsx` keeps data-driven swatch colors inline.
- `components/admin/AdminLoginForm.tsx` loses its static inline layout object; those static values move to Tailwind utilities.

## Verification Contract

- Capture the unmodified UI before migration and compare the migrated UI at 1440×1000, 850×1000, 560×900, and 390×844.
- Verify `/`, `/checkout`, `/faq`, all three `/policies/*` routes, and `/admin/login`; inspect authenticated admin screens only if an existing local session/data source makes them available without changing external data.
- Exercise both dialogs, cart states, gallery controls, native form controls, validation/focus states, hover/focus states, quick-purchase visibility, coarse-pointer behavior, and reduced motion.
- Run the existing `npm test`, `npm run build`, and `git diff --check` commands.
- Confirm no new dependencies other than Tailwind/PostCSS and `@radix-ui/react-dialog`, no new tests/configuration, and no selector-based legacy component CSS remains.

