# Pixels Galaxy storefront

Pixels Galaxy is a Next.js storefront for ZipString products in Pakistan. It includes a Cash on Delivery checkout, server-authoritative PKR pricing, Supabase order storage, Resend order notifications, a protected single-admin order dashboard, and product-specific WhatsApp ordering.

## Local development

Requirements:

- Node.js and npm
- Provider credentials only when testing persistence, email, or the production admin-login limiter

Install dependencies and start the development server:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

The storefront is available at `http://localhost:3000`. Replace the placeholder values in `.env.local` before testing provider-backed flows. Never commit `.env.local` or production secrets.

## Commands

```powershell
npm run dev
npm test
npm run build
npm start
```

`npm test` runs the Vitest suite. `npm run build` performs the production Next.js build and TypeScript checks.

## Routes

- `/` — public storefront
- `/checkout` — Cash on Delivery checkout; `noindex, nofollow`
- `/admin/login` — administrator sign-in; `noindex, nofollow`
- `/admin/orders` and `/admin/orders/<order-number>` — protected order dashboard; `noindex, nofollow`
- `/api/orders` — order submission API
- `/api/admin/*` — protected administrator APIs

Only the public storefront belongs in the sitemap. Checkout, admin, order-detail, and API URLs are intentionally excluded.

## Production setup

Follow [docs/checkout-setup.md](docs/checkout-setup.md) before deployment. It covers all Supabase migrations, RLS verification, Resend SPF/DKIM setup, masked administrator password hashing, session-secret generation, trusted edge headers, direct-origin protection, deployment, backups, privacy, and the end-to-end verification checklist.

The browser sends only product IDs, bundle IDs, quantities, and checkout contact/delivery fields to this application. Prices and totals are recalculated from the server catalogue. Supabase and Resend credentials, the administrator hash, and the session signing secret must remain server-only.
