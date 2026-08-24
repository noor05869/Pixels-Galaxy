# Pixels Galaxy Storefront Design

## Objective

Rebuild the existing Pixels Galaxy site as a close, responsive adaptation of the ZipString storefront supplied by the user. The result should preserve the reference site's page order, dense media-led composition, ecommerce interactions, and energetic visual rhythm while using Pixels Galaxy branding. This phase delivers the storefront experience only; payment processing, a production product database, and order management remain later phases.

## Brand and visual direction

- Use the existing Pixels Galaxy logo and name throughout the site.
- Reproduce the reference site's electric-blue page shell, bright-cyan section panels, rounded containers, bold white display typography, dark navy supporting text, and neon green/orange accents.
- Match the reference site's overall spacing, section proportions, media density, card geometry, and responsive behavior closely enough that it feels like the same design system adapted for Pixels Galaxy.
- Do not display the ZipString logo or imply that Pixels Galaxy is ZipString.
- Temporary reference media may be used where practical. All media and copy must be centralized so the user can replace them later without changing component implementations.

## Architecture

Replace the current static HTML/CSS page with a Next.js App Router application written in TypeScript. Use reusable components, server-rendered markup by default, and client components only for interactive controls. Store all initial catalog, testimonial, metric, navigation, and media information in local typed data files.

The storefront should be structured around focused sections rather than one monolithic page component. Shared primitives should cover buttons, media cards, product cards, icons, and section headings where reuse improves consistency.

## Page structure

The home page will follow the reference site's sequence:

1. Slim announcement bar with social links, shipping message, and region display.
2. Responsive header with Pixels Galaxy logo, primary navigation, search affordance, account affordance, and cart badge.
3. Cinematic hero with temporary image/video media, bold headline, CTA, guarantee line, and play affordance.
4. Press-logo strip and four credibility metrics.
5. Bright-cyan best-sellers panel with category tabs and responsive product cards.
6. Full-width promotional media banner with overlaid headline and CTA.
7. Featured-product area with media gallery, thumbnails, review summary, benefits, stock state, bundle options, quantity controls, add-to-cart action, and share affordances.
8. Tricks/demo section with an asymmetric responsive media grid that matches the density and energy of the reference.
9. Staggered testimonial cards with star ratings.
10. Social-feed panel with follow CTA and media cards.
11. Brand-story section with media, supporting copy, and CTA.
12. Newsletter signup and multi-column footer with shop, support, social, policy, and regional information.

On mobile, sections will be deliberately recomposed for small screens. Navigation becomes a menu, galleries become horizontal or paginated controls where useful, product purchasing controls remain easy to reach, and grids retain visual variety without causing horizontal overflow.

## Data and content model

Local TypeScript data modules will define:

- navigation items and footer link groups;
- announcement and trust metrics;
- product cards, prices, reviews, badges, variants, bundle offers, and product media;
- demo/trick media items;
- customer testimonials;
- social-feed items; and
- brand-story and newsletter copy.

Each media entry will support a source URL or local asset, alt text, an optional poster, and a fallback treatment. Product and content components must consume these data structures without embedding replaceable marketing content in component logic.

## Interactions

- The mobile navigation opens and closes accessibly.
- Best-seller tabs switch between locally defined product groups.
- Product and demo media expose clear play affordances; temporary unsupported videos fall back to posters rather than leaving broken frames.
- The featured-product gallery changes the active media from thumbnail controls.
- Bundle selection updates the selected offer and associated quantity.
- Quantity can be increased or decreased within sensible limits.
- Add to cart creates or updates a cart line and opens a lightweight cart drawer.
- Cart state persists in browser storage and the header badge reflects total quantity.
- The cart drawer supports quantity updates and item removal. Checkout is visibly disabled or labelled as coming in the commerce phase so the site never suggests that a payment was processed.
- Newsletter submission performs client-side validation and shows a non-deceptive local success state; it does not transmit email addresses in this phase.
- Motion respects the user's reduced-motion preference.

## SEO and accessibility

- Provide page metadata, title template, description, canonical URL configuration, Open Graph metadata, and social preview defaults.
- Add `robots.txt` and `sitemap.xml` through Next.js metadata routes.
- Include JSON-LD for the organization, website, and featured product using the local product data. Values must be clearly editable before deployment.
- Use a single descriptive page-level heading and semantic section headings.
- Preserve keyboard access, focus visibility, button semantics, labelled controls, descriptive image alternatives, and sufficient contrast.
- Include a skip link and make navigation, tabs, galleries, cart controls, and forms understandable to assistive technology.

## Performance

- Render static, semantic content on the server and limit hydration to interactive islands.
- Use `next/image` or appropriately sized native media, explicit dimensions, responsive `sizes`, and lazy loading below the fold.
- Prioritize only the logo and primary hero visual.
- Use a controlled font strategy and avoid loading unnecessary weights.
- Avoid autoplaying heavy below-the-fold video. Load video sources only after user intent when feasible.
- Keep dependencies small and avoid large carousel or animation packages when native CSS and concise components are sufficient.
- Prevent layout shifts with stable media aspect ratios and reserved dimensions.

## Failure handling

- Broken or unavailable remote media displays a branded gradient/poster fallback with useful alt text.
- Empty product groups and incomplete optional data do not crash the page.
- Cart persistence handles malformed or unavailable browser storage by reverting to an empty cart.
- Newsletter validation explains invalid input without implying an external subscription occurred.
- Interactive controls remain usable when animation or video playback is unavailable.

## Verification

No unit-test suite will be added in this phase, per the user's request. Completion requires:

- a successful production build;
- manual desktop and mobile review in a browser;
- checks for overflow, broken media fallbacks, and layout shifts;
- verification of navigation, tabs, gallery controls, bundle and quantity selection, cart persistence, cart editing, and newsletter validation;
- review of console errors and warnings; and
- inspection of metadata, semantic heading order, JSON-LD, sitemap, and robots output.

## Out of scope

- Stripe or any other payment processor;
- database-backed products or orders;
- account authentication;
- real search results;
- inventory synchronization;
- newsletter-provider integration;
- production regional pricing or currency conversion;
- order confirmation email; and
- copying or presenting ZipString's logo as Pixels Galaxy branding.

## Acceptance criteria

The result is accepted when the home page is recognizably a close Pixels Galaxy adaptation of the supplied ZipString storefront on desktop and mobile; all defined storefront interactions work without a backend; temporary content is centralized and replaceable; the production build succeeds; SEO essentials are present; and no control falsely claims to complete checkout, search, account access, or newsletter subscription.
