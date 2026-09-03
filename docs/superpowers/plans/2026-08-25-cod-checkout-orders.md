# COD Checkout and Order Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Cash on Delivery checkout that persists trusted orders in Supabase, emails the business through Resend, exposes a protected order dashboard, and offers product-specific WhatsApp ordering.

**Architecture:** The browser submits cart identifiers and delivery fields to a Next.js route handler. Server-only modules validate the request, resolve trusted catalogue pricing, persist an immutable order snapshot through Supabase, and then attempt a Resend notification. Signed HTTP-only cookies protect server-rendered admin routes and status mutations.

**Tech Stack:** Next.js App Router, React, TypeScript, Supabase Postgres/REST, Resend, Node `crypto`, Vitest

**Spec:** `docs/superpowers/specs/2026-08-25-cod-checkout-orders-design.md`

## Global Constraints

- Payment method is Cash on Delivery only; never collect card, bank, password, or CNIC data.
- Currency is `PKR`; all stored and calculated money values use integer paisa.
- Server catalogue data is authoritative for product, bundle, quantity, and total calculations.
- Supabase and Resend secrets remain server-only and must never use a `NEXT_PUBLIC_` prefix.
- Customer-facing checkout copy stays English; existing testimonial copy remains unchanged.
- The WhatsApp destination is centralized as `923324468116`.
- Checkout and admin routes are `noindex`; admin routes also use `nofollow`.
- A database failure must preserve the cart. An email failure must preserve the saved order.
- No order deletion, customer-data editing, online payment, inventory, courier, customer-account, or discount-code functionality is in scope.

---

### Task 1: Add dependencies, configuration contracts, and order types

**Files:**
- Modify: `package.json`
- Create: `.env.example`
- Create: `lib/config/server.ts`
- Create: `lib/config/public.ts`
- Create: `lib/orders/types.ts`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: `getServerConfig(): ServerConfig`, `whatsappNumber: string`, and shared `OrderStatus`, `CheckoutInput`, `TrustedOrderItem`, `NewOrder`, and `StoredOrder` types.
- Consumes: existing `CartLine` and storefront product types.

- [ ] **Step 1: Install runtime and verification dependencies**

Run:

```powershell
npm install @supabase/supabase-js resend zod
npm install -D vitest
```

Add scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Define exact environment configuration**

Create `.env.example` with non-secret example values:

```dotenv
NEXT_PUBLIC_SITE_URL=https://example.pk
NEXT_PUBLIC_WHATSAPP_NUMBER=923324468116
SUPABASE_URL=https://project-ref.supabase.co
SUPABASE_SECRET_KEY=sb_secret_replace_me
RESEND_API_KEY=re_replace_me
ORDER_NOTIFICATION_EMAIL=support@pixelsgalaxy.com
ORDER_FROM_EMAIL=Pixels Galaxy Orders <orders@example.pk>
ADMIN_PASSWORD_HASH=scrypt$replace_salt$replace_hash
ADMIN_SESSION_SECRET=replace_with_at_least_32_random_bytes
```

`lib/config/public.ts` exports:

```ts
export const whatsappNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "923324468116";
```

`lib/config/server.ts` parses server variables lazily so builds can succeed before provider setup. `getServerConfig()` throws `Server configuration is incomplete` without listing values. Use this exact contract:

```ts
export type ServerConfig = {
  siteUrl: string; supabaseUrl: string; supabaseSecretKey: string;
  resendApiKey: string; notificationEmail: string; fromEmail: string;
  adminPasswordHash: string; adminSessionSecret: string;
};
export function getServerConfig(): ServerConfig;
```

- [ ] **Step 3: Define stable order contracts**

Use these status and item shapes:

```ts
export const orderStatuses = ["new", "confirmed", "shipped", "completed", "cancelled"] as const;
export type OrderStatus = (typeof orderStatuses)[number];
export type CheckoutCartItem = { productId: string; bundleId: string; quantity: number };
export type CheckoutInput = {
  customerName: string; phone: string; email?: string; city: string;
  address: string; notes?: string; consent: true; website?: string;
  items: CheckoutCartItem[];
};
export type TrustedOrderItem = {
  productId: string; productName: string; bundleId: string; bundleLabel: string;
  quantity: number; unitPrice: number; lineTotal: number;
};
export type NotificationState = "pending" | "sent" | "failed";
export type NewOrder = {
  orderNumber: string; customerName: string; phone: string; email?: string;
  city: string; address: string; notes?: string; paymentMethod: "cod";
  currency: "PKR"; total: number; status: "new"; items: TrustedOrderItem[];
  notificationState: "pending";
};
export type StoredOrder = Omit<NewOrder, "status" | "notificationState"> & {
  id: string; status: OrderStatus; notificationState: NotificationState;
  notificationFailure?: string; createdAt: string; updatedAt: string;
};
```

- [ ] **Step 4: Run type/build verification**

Run: `npm run build`

Expected: exit code 0 without requiring real Supabase or Resend credentials.

- [ ] **Step 5: Commit**

```powershell
git add package.json package-lock.json .env.example lib/config lib/orders/types.ts vitest.config.ts
git commit -m "chore: prepare checkout service configuration"
```

---

### Task 2: Build server-authoritative validation and pricing

**Files:**
- Create: `lib/orders/validation.ts`
- Create: `lib/orders/pricing.ts`
- Create: `lib/orders/order-number.ts`
- Test: `lib/orders/validation.test.ts`
- Test: `lib/orders/pricing.test.ts`
- Test: `lib/orders/order-number.test.ts`

**Interfaces:**
- Consumes: `products` from `lib/storefront/content.ts` and order contracts from Task 1.
- Produces: `parseCheckoutInput(value: unknown): CheckoutInput`, `priceOrder(items: CheckoutCartItem[]): { items: TrustedOrderItem[]; total: number }`, and `createOrderNumber(): string`.

- [ ] **Step 1: Write failing validation tests**

Cover a valid Pakistani phone plus rejection of empty name, invalid phone, invalid email, missing city/address, false consent, non-empty honeypot, more than 20 lines, quantity outside 1–99, and oversized notes.

```ts
expect(() => parseCheckoutInput({ ...validInput, consent: false })).toThrow();
expect(() => parseCheckoutInput({ ...validInput, website: "spam" })).toThrow();
expect(parseCheckoutInput(validInput).phone).toBe("03324468116");
```

- [ ] **Step 2: Run tests and confirm red state**

Run: `npm test -- lib/orders/validation.test.ts`

Expected: FAIL because `parseCheckoutInput` does not exist.

- [ ] **Step 3: Implement the Zod checkout schema**

Trim text, cap lengths, accept `03XXXXXXXXX` and `+923XXXXXXXXX`, normalize optional empty strings to `undefined`, require literal consent, and reject any populated `website` honeypot.

- [ ] **Step 4: Write failing trusted-pricing tests**

```ts
expect(priceOrder([{ productId: "zipstring-original", bundleId: "one", quantity: 2 }]).total)
  .toBe(1799800);
expect(() => priceOrder([{ productId: "unknown", bundleId: "one", quantity: 1 }])).toThrow("Cart item is unavailable");
expect(() => priceOrder([{ productId: "zipstring-original", bundleId: "fake", quantity: 1 }])).toThrow("Cart item is unavailable");
```

- [ ] **Step 5: Implement catalogue resolution and integer totals**

For products with bundles, resolve the exact bundle and use its unit price. For products without bundles, accept only `bundleId: "card"` and use `product.price`. Reject duplicate product/bundle lines and non-safe-integer totals.

- [ ] **Step 6: Write and implement order-number tests**

Assert `/^PG-[A-Z0-9]{6}$/`, no ambiguous characters `0O1I`, and uniqueness across 1,000 generated values. Implement with `crypto.randomBytes` and alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`.

- [ ] **Step 7: Run focused and complete tests**

Run:

```powershell
npm test -- lib/orders/validation.test.ts lib/orders/pricing.test.ts lib/orders/order-number.test.ts
npm test
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```powershell
git add lib/orders
git commit -m "feat: validate and price COD orders on server"
```

---

### Task 3: Add persistent Supabase order storage

**Files:**
- Create: `supabase/migrations/202608250001_create_orders.sql`
- Create: `lib/orders/repository.ts`
- Test: `lib/orders/repository.test.ts`

**Interfaces:**
- Consumes: `NewOrder`, `StoredOrder`, `OrderStatus`, and `getServerConfig()`.
- Produces: `createOrder(order: NewOrder): Promise<StoredOrder>`, `listOrders(): Promise<StoredOrder[]>`, `getOrderByNumber(orderNumber: string): Promise<StoredOrder | null>`, `updateOrderStatus(orderNumber: string, status: OrderStatus): Promise<StoredOrder>`, and `setNotificationState(id: string, state: "sent" | "failed", failureNote?: string): Promise<void>`.

- [ ] **Step 1: Write the SQL migration**

Create `public.orders` with UUID primary key, unique public order number, constrained status/payment/currency/notification values, non-negative integer total, `jsonb` items, customer fields, timestamps, and an index on `(created_at desc)`. Enable RLS, revoke public/anon/authenticated access, and grant server-role access only. Add a trigger that updates `updated_at`.

- [ ] **Step 2: Write failing repository adapter tests**

Inject a minimal `OrdersDataSource` interface rather than importing a live client in tests. Verify database row mapping, newest-first ordering request, null detail behavior, valid status update, and sanitized notification failure capped at 300 characters.

- [ ] **Step 3: Implement the server-only repository**

Create the Supabase client inside server-only code using `SUPABASE_URL` and `SUPABASE_SECRET_KEY`. Add `import "server-only"`. Convert between camelCase application values and snake_case database columns in focused mapping functions.

- [ ] **Step 4: Run repository tests**

Run: `npm test -- lib/orders/repository.test.ts`

Expected: all repository tests pass without network access.

- [ ] **Step 5: Commit**

```powershell
git add supabase/migrations lib/orders/repository.ts lib/orders/repository.test.ts
git commit -m "feat: persist COD orders in Supabase"
```

---

### Task 4: Create order notification and checkout API

**Files:**
- Create: `lib/orders/notification.ts`
- Create: `lib/orders/rate-limit.ts`
- Create: `lib/orders/service.ts`
- Create: `app/api/orders/route.ts`
- Test: `lib/orders/notification.test.ts`
- Test: `lib/orders/service.test.ts`
- Test: `app/api/orders/route.test.ts`

**Interfaces:**
- Consumes: Tasks 1–3 validation, pricing, numbering, repository, and configuration.
- Produces: `sendOrderNotification(order: StoredOrder): Promise<void>`, `submitOrder(value: unknown): Promise<{ orderNumber: string }>`, and `POST(request: Request): Promise<Response>`.

- [ ] **Step 1: Write failing notification-rendering tests**

Verify subject `New COD Order — PG-ABC234`, recipient configuration, plain-text content, complete item totals, dashboard URL, and HTML escaping of `<script>` in names/notes.

- [ ] **Step 2: Implement Resend notification**

Build the message from escaped order data. Keep `Resend` initialization server-only and lazy. Throw a sanitized `Order notification failed` error on provider failure.

- [ ] **Step 3: Write failing orchestration tests**

Use injected repository/notifier dependencies. Verify:

- persistence occurs before notification;
- database failure prevents notification and rejects submission;
- notification failure marks the order `failed` but still returns its order number;
- successful notification marks it `sent`.

- [ ] **Step 4: Implement `submitOrder`**

Compose validation, trusted pricing, order number generation, persistence, and best-effort notification exactly in the specified order. Do not log request bodies or full provider errors.

- [ ] **Step 5: Write failing route tests**

Test non-JSON request `415`, body over 32 KB `413`, invalid input `400`, throttled client `429`, provider configuration/storage failure `503`, and successful response `201` with `{ orderNumber }`.

- [ ] **Step 6: Implement route and basic throttle**

Use a bounded in-memory map keyed by a hashed forwarded IP, permitting five attempts per ten minutes and pruning expired entries. Document that hosting-level rate limiting is required for distributed production enforcement.

- [ ] **Step 7: Run API verification**

Run:

```powershell
npm test -- lib/orders/notification.test.ts lib/orders/service.test.ts app/api/orders/route.test.ts
npm test
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```powershell
git add lib/orders app/api/orders
git commit -m "feat: accept and notify COD orders"
```

---

### Task 5: Build the customer checkout experience

**Files:**
- Create: `app/checkout/layout.tsx`
- Create: `app/checkout/page.tsx`
- Create: `components/checkout/CheckoutForm.tsx`
- Create: `components/checkout/OrderSummary.tsx`
- Modify: `components/cart/CartProvider.tsx`
- Modify: `components/cart/CartDrawer.tsx`
- Modify: `app/globals.css`
- Test: `lib/orders/checkout-payload.test.ts`
- Create: `lib/orders/checkout-payload.ts`

**Interfaces:**
- Consumes: current cart context and `POST /api/orders`.
- Produces: `clearCart(): void`, `toCheckoutPayload(lines: CartLine[]): CheckoutCartItem[]`, `/checkout`, and accessible customer form components.

- [ ] **Step 1: Write failing cart-payload tests**

Verify that browser display fields and prices are omitted:

```ts
expect(toCheckoutPayload([line])).toEqual([
  { productId: line.productId, bundleId: line.bundleId, quantity: line.quantity }
]);
```

- [ ] **Step 2: Implement payload conversion and cart clearing**

Add `clearCart` to `CartValue` and remove the persisted cart only after confirmed success. Keep the checkout payload limited to identifiers and quantity.

- [ ] **Step 3: Build noindex checkout shell and order summary**

Set checkout metadata robots to `{ index: false, follow: false }`. Reuse `Price`, product images, and existing brand styling. Empty carts show a link back to `/#shop` instead of a form.

- [ ] **Step 4: Build form state and client validation**

Use native labelled controls plus matching client constraints for name, Pakistani phone, optional email, city, address, notes, consent, and hidden honeypot. Submit JSON to `/api/orders`, preserve values on failure, focus the first error summary, and disable only while submitting.

- [ ] **Step 5: Build success state**

Show `Order <number> confirmed`, COD explanation, business contact email, and return-to-store action. Clear the cart once when the API returns `201`.

- [ ] **Step 6: Enable cart checkout navigation**

Replace the disabled cart button with a `/checkout` link/button when lines exist. Keep it disabled for an empty cart and close the drawer before navigation.

- [ ] **Step 7: Style and manually inspect responsive behavior**

Add `.checkout-*` rules for a two-column desktop layout and one-column mobile layout. Verify labels, focus indicators, error text, summary readability, and no horizontal overflow at 390 px and 1440 px.

- [ ] **Step 8: Verify and commit**

Run:

```powershell
npm test -- lib/orders/checkout-payload.test.ts
npm run build
```

Then commit:

```powershell
git add app/checkout components/checkout components/cart lib/orders/checkout-payload* app/globals.css
git commit -m "feat: add Cash on Delivery checkout"
```

---

### Task 6: Implement secure single-admin sessions

**Files:**
- Create: `lib/admin/password.ts`
- Create: `lib/admin/session.ts`
- Create: `lib/admin/auth.ts`
- Create: `scripts/hash-admin-password.mjs`
- Create: `app/api/admin/login/route.ts`
- Create: `app/api/admin/logout/route.ts`
- Create: `app/admin/layout.tsx`
- Create: `app/admin/login/page.tsx`
- Create: `components/admin/AdminLoginForm.tsx`
- Test: `lib/admin/password.test.ts`
- Test: `lib/admin/session.test.ts`
- Test: `app/api/admin/login/route.test.ts`

**Interfaces:**
- Produces: `verifyPassword(password: string, encodedHash: string): Promise<boolean>`, `createAdminSession(): Promise<string>`, `verifyAdminSession(token: string): Promise<boolean>`, `requireAdmin(): Promise<void>`, login/logout routes, and `/admin/login`.

- [ ] **Step 1: Write failing password and session tests**

Verify correct/wrong passwords, malformed hashes, signed-token tampering, expiry, and constant-length signature comparisons. Use `scrypt` with a random 16-byte salt and encode as `scrypt$<salt-base64url>$<hash-base64url>`.

- [ ] **Step 2: Implement password hash utility and script**

The script accepts a password through a masked prompt, never a command-line argument, and prints only the encoded hash. Runtime comparison uses Node `crypto.scrypt` and `timingSafeEqual`.

- [ ] **Step 3: Implement signed session tokens**

Use an HMAC-SHA256 token containing issued-at and expiry timestamps, signed with `ADMIN_SESSION_SECRET`. Set cookie `pg_admin` as `httpOnly`, `sameSite: "strict"`, `secure` in production, path `/`, and maximum age eight hours.

- [ ] **Step 4: Write and implement login-route tests**

Cover malformed body, wrong password, throttling after five failures per fifteen minutes, successful secure cookie, and logout expiration. Never distinguish missing configuration from incorrect credentials in the public response.

- [ ] **Step 5: Build login UI and admin noindex layout**

The login form posts to the API, displays a generic failure, and redirects to `/admin/orders` on success. Admin layout exports `robots: { index: false, follow: false }`.

- [ ] **Step 6: Verify and commit**

Run:

```powershell
npm test -- lib/admin/password.test.ts lib/admin/session.test.ts app/api/admin/login/route.test.ts
npm test
npm run build
```

Then commit:

```powershell
git add lib/admin scripts/hash-admin-password.mjs app/api/admin app/admin components/admin
git commit -m "feat: protect the order dashboard"
```

---

### Task 7: Build order dashboard and status updates

**Files:**
- Create: `app/admin/orders/page.tsx`
- Create: `app/admin/orders/[orderNumber]/page.tsx`
- Create: `components/admin/OrdersTable.tsx`
- Create: `components/admin/OrderDetail.tsx`
- Create: `components/admin/OrderStatusForm.tsx`
- Create: `app/api/admin/orders/[orderNumber]/status/route.ts`
- Modify: `app/globals.css`
- Test: `app/api/admin/orders/status-route.test.ts`

**Interfaces:**
- Consumes: `requireAdmin`, `listOrders`, `getOrderByNumber`, `updateOrderStatus`, and `orderStatuses`.
- Produces: protected dashboard pages and `PATCH /api/admin/orders/:orderNumber/status`.

- [ ] **Step 1: Write failing status-route tests**

Cover missing session `401`, malformed order number `400`, invalid status `400`, missing order `404`, repository failure `503`, and valid update `200`.

- [ ] **Step 2: Implement protected status mutation**

Validate the session first, then order number `/^PG-[A-Z0-9]{6}$/`, then status against `orderStatuses`. Return only the updated public order fields.

- [ ] **Step 3: Build protected server-rendered order list**

Call `requireAdmin()` before querying. Display newest first with order number, created date in `en-PK`, customer, city, phone, PKR total, notification state, and status. Add explicit empty and provider-error states.

- [ ] **Step 4: Build protected order detail**

Show customer delivery information, optional notes, immutable line items, total, payment `Cash on Delivery`, email-notification state, timestamps, and status form. Return `notFound()` for an absent valid order.

- [ ] **Step 5: Add safe status interaction**

`OrderStatusForm` submits only an allowed status, reports errors without discarding the selected value, and refreshes server data after success. Include logout in the dashboard header.

- [ ] **Step 6: Style responsive admin views**

Use cards below 760 px instead of forcing a wide table. Keep phone and address selectable, maintain visible focus states, and avoid printing customer data to console.

- [ ] **Step 7: Verify and commit**

Run:

```powershell
npm test -- app/api/admin/orders/status-route.test.ts
npm test
npm run build
```

Then commit:

```powershell
git add app/admin/orders app/api/admin/orders components/admin app/globals.css
git commit -m "feat: add protected COD order dashboard"
```

---

### Task 8: Add product-specific WhatsApp buying

**Files:**
- Create: `lib/whatsapp/order-link.ts`
- Test: `lib/whatsapp/order-link.test.ts`
- Modify: `components/store/PurchasePanel.tsx`
- Modify: `components/store/ProductCard.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `whatsappNumber`, product/bundle IDs, quantities, and trusted display prices.
- Produces: `createWhatsAppOrderLink(input): string` and visible `Buy on WhatsApp` actions.

- [ ] **Step 1: Write failing link tests**

```ts
expect(createWhatsAppOrderLink({
  productName: "ZipString Original", bundleLabel: "2 ZIPSTRING",
  quantity: 2, total: 1699800
})).toBe(
  "https://wa.me/923324468116?text=" + encodeURIComponent(
    "Hi Pixels Galaxy! I want to order ZipString Original. Bundle: 2 ZIPSTRING. Quantity: 2. Total: Rs 16,998."
  )
);
```

Also verify the configured number is digits-only and no customer personal fields are accepted by the function type.

- [ ] **Step 2: Implement the centralized link builder**

Format PKR with `en-PK`, maximum zero decimals, and URL-encode the complete message. Reject non-positive quantity/total.

- [ ] **Step 3: Add featured-product WhatsApp action**

Generate the link from the currently selected bundle and quantity. Open it in a new tab with `rel="noopener noreferrer"` and an accessible label naming the product.

- [ ] **Step 4: Add product-card WhatsApp action**

Use the card product's default price and quantity one. Keep the existing add/view behavior and avoid covering video controls on small screens.

- [ ] **Step 5: Verify and commit**

Run:

```powershell
npm test -- lib/whatsapp/order-link.test.ts
npm test
npm run build
```

Manually confirm the generated URL begins `https://wa.me/923324468116` and its decoded text contains the visible product and PKR amount.

Then commit:

```powershell
git add lib/whatsapp components/store app/globals.css
git commit -m "feat: add WhatsApp product ordering"
```

---

### Task 9: Document provider setup and run end-to-end verification

**Files:**
- Create: `docs/checkout-setup.md`
- Create: `README.md`
- Modify: `app/sitemap.ts`

**Interfaces:**
- Consumes: all previous tasks and environment contracts.
- Produces: reproducible Supabase, Resend, administrator, deployment, and verification instructions.

- [ ] **Step 1: Write exact setup documentation**

Document:

1. create Supabase project;
2. apply `supabase/migrations/202608250001_create_orders.sql` in SQL Editor;
3. verify that RLS is enabled and anon/authenticated roles cannot select orders;
4. create Resend account, verify a sending subdomain using SPF/DKIM, and create API key;
5. generate admin hash with `node scripts/hash-admin-password.mjs`;
6. generate at least 32 random bytes for `ADMIN_SESSION_SECRET`;
7. populate hosting environment variables;
8. set `NEXT_PUBLIC_SITE_URL` to the production `.pk` domain;
9. deploy and submit only public storefront URLs in the sitemap.

- [ ] **Step 2: Ensure private routes are excluded from sitemap**

Keep `/checkout`, `/admin/login`, `/admin/orders`, and all APIs out of `app/sitemap.ts`. Confirm their metadata emits `noindex`.

- [ ] **Step 3: Run automated verification**

Run:

```powershell
npm test
npm run build
git diff --check
```

Expected: zero failing tests, production build exit code 0, and no whitespace errors.

- [ ] **Step 4: Run configured integration verification**

With a test Supabase project and verified Resend domain:

1. submit one COD order with a unique note;
2. verify the returned `PG-XXXXXX` order number;
3. verify the cart clears only after success;
4. verify the Supabase row and immutable item snapshot;
5. verify the email subject and contents at `support@pixelsgalaxy.com`;
6. log in to `/admin/login`;
7. verify list/detail display and update status to `confirmed`;
8. log out and verify dashboard access is rejected;
9. decode one WhatsApp URL and verify number, product, quantity, and price.

- [ ] **Step 5: Run visual browser verification**

At desktop and mobile widths, inspect storefront, cart, checkout form, field errors, success state, admin login, order list, order detail, and WhatsApp buttons. Confirm keyboard focus, no horizontal overflow, no unexpected console errors, and no customer data in console logs.

- [ ] **Step 6: Commit documentation and final integration changes**

```powershell
git add docs/checkout-setup.md README.md app/sitemap.ts
git commit -m "docs: add COD order system setup"
```

- [ ] **Step 7: Request final code review**

Review the full branch against `docs/superpowers/specs/2026-08-25-cod-checkout-orders-design.md`, specifically checking server-authoritative totals, secret isolation, session protection, personal-data handling, email-failure behavior, and private-route indexing.
