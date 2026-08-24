# COD Checkout and Order Dashboard Design

Date: 2026-08-25
Status: Approved architecture; awaiting specification review

## Objective

Add a production-oriented Cash on Delivery checkout to the existing ZipString storefront. Customers can submit delivery details, the business receives a new-order email, orders remain available in a small protected dashboard, and shoppers can alternatively start an order through WhatsApp.

The first release intentionally excludes online payments, customer accounts, inventory management, courier integrations, invoices, discount codes, and a general-purpose commerce admin system.

## Architecture

The existing Next.js application remains the only application. Next.js pages and route handlers provide the checkout, order API, admin login, and order dashboard. Supabase Postgres provides persistent order storage. Resend sends transactional email notifications.

All privileged database and email operations run on the server. Supabase secret credentials and the Resend API key must never enter client bundles. The browser sends checkout data only to the site's own `/api/orders` endpoint.

## Customer Checkout

The cart drawer's checkout button links to `/checkout` when the cart contains items. The checkout page contains:

- order summary with product, bundle, quantity, line total, and PKR grand total;
- full name;
- phone/WhatsApp number;
- optional email address;
- city;
- complete delivery address;
- optional order notes;
- a fixed Cash on Delivery payment option;
- a required privacy acknowledgement;
- submit button and clear validation feedback.

The customer may return to shopping without losing the cart. On successful order creation, the page displays the generated order number, confirms Cash on Delivery, clears the cart, and prevents accidental duplicate resubmission from the same rendered success state.

The checkout and success experiences use English interface copy, consistent with the storefront. They are responsive and keyboard accessible. Checkout and admin routes use `noindex` metadata.

## Order Creation API

`POST /api/orders` accepts customer fields and cart identifiers. It must not accept the browser's calculated total as authoritative.

The server performs the following sequence:

1. Enforce JSON content type and a conservative request-size limit.
2. Validate required fields, lengths, formats, item count, and quantities.
3. Reject the honeypot field when populated.
4. Apply basic per-client rate limiting suitable for a single deployment instance, with the deployment platform or edge firewall recommended for stronger distributed protection.
5. Resolve every product and bundle from the server-side catalogue.
6. Recalculate line totals and the PKR grand total from trusted catalogue prices.
7. Generate a non-sequential public order number such as `PG-A7K3Q9` while retaining an internal UUID primary key.
8. Insert the order and its immutable item snapshot into Supabase.
9. Attempt to send the business notification through Resend.
10. Record notification success or failure without deleting an otherwise valid order.
11. Return only the public order number and success state to the customer.

Expected responses use structured JSON and appropriate status codes: validation failure, throttling, catalogue conflict, server failure, or success. Internal credentials and provider errors are never returned to the browser.

## Data Model

The initial `orders` table stores:

- internal UUID;
- unique public order number;
- creation and update timestamps;
- customer name;
- normalized phone number;
- optional customer email;
- city;
- delivery address;
- optional notes;
- payment method fixed to `cod`;
- currency fixed to `PKR`;
- total amount in paisa;
- order status;
- immutable item snapshot as validated JSON;
- email notification status and optional sanitized failure note.

Allowed order statuses are `new`, `confirmed`, `shipped`, `completed`, and `cancelled`. The item snapshot stores product ID, product name, selected bundle ID and label, quantity, unit price, and line total so historical orders do not change when catalogue content changes.

Row Level Security is enabled. Public and authenticated browser roles receive no direct table access. Only server-side code using the Supabase secret key reads or writes orders.

## Email Notification

After persistence succeeds, Resend sends an HTML and plain-text email to `hello@pixelsgalaxy.com` with subject `New COD Order — <order number>`.

The message includes the public order number, timestamp, customer delivery details, itemized order, PKR total, payment method, and dashboard link. It must escape customer-provided content before inserting it into HTML.

An email failure does not tell the customer that their order failed. The saved order is returned as successful and marked `failed` for notification status so it remains visible in the dashboard.

## Admin Authentication

The first release supports one business administrator and does not implement staff accounts or password recovery.

`/admin/login` accepts an administrator password. The password is represented by a slow password hash stored in an environment variable, not hardcoded or stored in the database. The server compares hashes safely and sets a signed, HTTP-only, secure, same-site session cookie with a finite lifetime. The signing secret is stored separately in an environment variable.

Repeated failed logins are throttled. Protected pages and admin API routes validate the session on every request. Logout expires the session cookie. Admin and checkout pages must not expose secrets in HTML, logs, or client JavaScript.

## Order Dashboard

`/admin/orders` shows newest orders first with order number, date, customer, city, phone, total, notification state, and order status. A detail view displays the full delivery information, notes, and itemized order.

The administrator can change an order to one of the allowed statuses. Status mutation occurs through a protected server endpoint that validates both the admin session and the requested transition value. The first release does not delete orders or edit customer-submitted data.

Empty, loading, unauthorized, and provider-error states have explicit messages. Customer information is not cached publicly. Admin pages include `noindex, nofollow` metadata.

## WhatsApp Ordering

The featured purchase panel and product cards expose a `Buy on WhatsApp` action. The phone number is centralized as `923324468116`, the international form of `03324468116`, so it can be replaced later in one location.

The generated `wa.me` link includes only non-sensitive shopping context: product name, selected bundle, quantity, and current PKR total. It does not include a customer's name, phone, email, or address. The customer chooses whether to send the prefilled message in WhatsApp.

## Privacy and Security

The checkout collects only information needed to deliver and contact the customer. It never asks for card details, bank credentials, passwords, or CNIC numbers.

The UI explains that submitted details are used to process and deliver the order. Production must use HTTPS. Logs must not contain full addresses, complete request bodies, credentials, or session tokens. Validation occurs on both client and server, with the server as the authority.

The Supabase secret key, Resend API key, administrator password hash, and session signing secret are server-only environment variables. Supabase RLS remains enabled even though server operations use the secret key. Environment examples contain placeholders only.

## Configuration and Setup

The implementation documents these required values:

- `NEXT_PUBLIC_SITE_URL`;
- `NEXT_PUBLIC_WHATSAPP_NUMBER=923324468116`;
- `SUPABASE_URL`;
- `SUPABASE_SECRET_KEY`;
- `RESEND_API_KEY`;
- `ORDER_NOTIFICATION_EMAIL=hello@pixelsgalaxy.com`;
- `ORDER_FROM_EMAIL`, using a verified sending domain;
- `ADMIN_PASSWORD_HASH`;
- `ADMIN_SESSION_SECRET`.

A SQL migration creates the order table, constraints, indexes, timestamp update behavior, grants, and RLS configuration. Setup documentation explains Supabase project creation, SQL application, Resend domain verification, key placement, and administrator password-hash generation.

## Failure Handling

- Invalid customer data stays on the checkout page with field-level guidance.
- A changed or unavailable catalogue item asks the customer to review the cart.
- A database failure does not clear the cart and does not show an order number.
- An email failure preserves the saved order and flags notification failure internally.
- An unauthorized dashboard request redirects to login or returns HTTP 401 for APIs.
- A stale or invalid admin status update leaves the order unchanged.
- A missing production configuration produces a controlled server error without exposing secret names or values to customers.

## Verification

Although the project currently avoids a broad unit-test suite, this checkout handles personal data and order totals, so verification must cover the risky boundaries:

- production build and TypeScript compilation;
- server rejection of invalid customer fields, empty carts, unknown products, invalid bundles, and manipulated prices;
- trusted server-side total calculation;
- successful Supabase persistence using a configured test project;
- preserved order when Resend notification fails;
- authentication rejection, successful login, cookie protection, logout, and protected-route enforcement;
- dashboard list, detail, and allowed status changes;
- WhatsApp number and URL-encoded message contents;
- desktop and mobile checkout layout, keyboard flow, validation messages, success state, and no browser console errors.

External email and database verification can only be completed after valid Supabase and Resend credentials are configured. Until then, the application must compile and expose an explicit setup state rather than pretending that orders were delivered.

