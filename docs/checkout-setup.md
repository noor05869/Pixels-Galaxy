# COD checkout and order dashboard setup

This guide configures the Pixels Galaxy Cash on Delivery order system for production. Complete the steps in order. Use a non-production Supabase project and non-customer test data for the first end-to-end run.

## 1. Supabase

1. Create a Supabase project in the production region selected for the store.
2. In the Supabase SQL Editor, run every migration below in filename order:

   1. `supabase/migrations/202608250001_create_orders.sql`
   2. `supabase/migrations/202608250002_pessimistic_notification_state.sql`
   3. `supabase/migrations/202608250003_admin_login_rate_limit.sql`

   The first migration creates the order table, immutable item snapshot column, constraints, timestamp trigger, grants, and RLS configuration. The second makes notification bookkeeping fail-safe. The third creates the shared production admin-login throttle tables and RPC functions. Do not skip later migrations even when a newly provisioned base schema already appears to contain part of their final state.
3. Copy the project URL to `SUPABASE_URL`.
4. Create or copy a server-side Supabase secret key for `SUPABASE_SECRET_KEY`. It must be able to use the `service_role` privileges required by this application. Never expose this key through a `NEXT_PUBLIC_` variable, browser code, logs, or screenshots.

### Verify RLS

Run these read-only audits in the SQL Editor after all migrations:

```sql
with expected(table_name) as (
  values
    ('orders'),
    ('admin_login_attempts'),
    ('admin_login_trusted_clients')
)
select
  expected.table_name,
  tables.oid is not null as table_exists,
  tables.relrowsecurity as rls_enabled,
  tables.oid is not null and tables.relrowsecurity as matches_contract
from expected
left join pg_class as tables
  on tables.oid = to_regclass(format('public.%I', expected.table_name))
order by expected.table_name;
```

This must return three rows with `table_exists = true`, `rls_enabled = true`, and `matches_contract = true`.

Confirm separately that no RLS policies grant browser access:

```sql
select
  count(*) as policy_count,
  count(*) = 0 as matches_contract
from pg_policies
where schemaname = 'public'
  and tablename in (
    'orders',
    'admin_login_attempts',
    'admin_login_trusted_clients'
  );
```

This must return `policy_count = 0` and `matches_contract = true`.

### Verify exact table privileges

The following query explicitly checks the seven baseline table privileges, including all four DML privileges, and automatically adds any further table privileges supported by the connected PostgreSQL version (such as `MAINTAIN`). The lowercase lookup name `public` means PostgreSQL's `PUBLIC` pseudo-role; the display name keeps it distinct from the `public` schema.

```sql
with expected_roles(display_role, lookup_role, expected_allowed) as (
  values
    ('PUBLIC', 'public', false),
    ('anon', 'anon', false),
    ('authenticated', 'authenticated', false),
    ('service_role', 'service_role', true)
),
expected_tables(table_name) as (
  values
    ('orders'),
    ('admin_login_attempts'),
    ('admin_login_trusted_clients')
),
baseline_privileges(privilege_name) as (
  values
    ('SELECT'),
    ('INSERT'),
    ('UPDATE'),
    ('DELETE'),
    ('TRUNCATE'),
    ('REFERENCES'),
    ('TRIGGER')
),
expected_privileges(privilege_name) as (
  select privilege_name from baseline_privileges
  union
  select upper(privilege_type)
  from aclexplode(
    acldefault(
      'r',
      (select oid from pg_roles where rolname = current_user)
    )
  )
),
actual as (
  select
    roles.display_role,
    tables.table_name,
    privileges.privilege_name,
    roles.expected_allowed,
    has_table_privilege(
      roles.lookup_role,
      to_regclass(format('public.%I', tables.table_name)),
      privileges.privilege_name
    ) as actual_allowed
  from expected_roles as roles
  cross join expected_tables as tables
  cross join expected_privileges as privileges
)
select
  display_role as role_name,
  table_name,
  privilege_name,
  expected_allowed,
  actual_allowed,
  actual_allowed is not distinct from expected_allowed as matches_contract
from actual
order by table_name, role_name, privilege_name;
```

This must return at least 84 rows, all with `matches_contract = true`: `PUBLIC`, `anon`, and `authenticated` must have no table privilege, while `service_role` must have every listed privilege on all three tables. PostgreSQL versions with additional table privileges return more rows so those privileges are audited rather than silently omitted.

### Verify exact RPC privileges

Use the exact PostgreSQL function signatures so an overloaded or similarly named function cannot produce a false pass:

```sql
with expected_roles(display_role, lookup_role, expected_allowed) as (
  values
    ('PUBLIC', 'public', false),
    ('anon', 'anon', false),
    ('authenticated', 'authenticated', false),
    ('service_role', 'service_role', true)
),
expected_functions(function_signature) as (
  values
    ('public.reserve_admin_login_attempt(text)'),
    ('public.complete_admin_login_attempt(uuid,text)')
),
actual as (
  select
    roles.display_role,
    functions.function_signature,
    roles.expected_allowed,
    has_function_privilege(
      roles.lookup_role,
      to_regprocedure(functions.function_signature),
      'EXECUTE'
    ) as actual_allowed
  from expected_roles as roles
  cross join expected_functions as functions
)
select
  display_role as role_name,
  function_signature,
  expected_allowed,
  actual_allowed,
  actual_allowed is not distinct from expected_allowed as matches_contract
from actual
order by function_signature, role_name;
```

This must return eight rows, all with `matches_contract = true`: `PUBLIC`, `anon`, and `authenticated` must be denied `EXECUTE`, and `service_role` must be allowed for both exact signatures.

As a final negative check, use a Supabase client configured only with the project's anon/publishable key and verify that selecting `public.orders` is rejected. Do not use real customer data for this check.

## 2. Resend sending domain

1. Create a Resend account and add a dedicated sending subdomain of the production `.pk` domain, for example `orders.example.pk`.
2. At the DNS provider, publish the SPF and DKIM records exactly as Resend displays them. Avoid creating a second SPF TXT record at the same hostname; merge authorized senders when the DNS provider requires one SPF record.
3. Wait until Resend marks the domain verified. A DMARC policy is also recommended; choose it with whoever manages mail for the parent domain.
4. Create a restricted production API key and store it as `RESEND_API_KEY`.
5. Set `ORDER_FROM_EMAIL` to a sender on the verified subdomain, for example `Pixels Galaxy Orders <orders@orders.example.pk>`.
6. Set `ORDER_NOTIFICATION_EMAIL=support@pixelsgalaxy.com`, or the approved private business inbox that should receive new-order messages.

The notification subject is `New COD Order — <order number>`. Delivery failure does not delete or reject a saved order; the dashboard records the notification as failed so it can be followed up manually.

## 3. Administrator credentials

Generate the password hash from an interactive terminal:

```powershell
node scripts/hash-admin-password.mjs
```

The prompt is masked. The script rejects command-line password arguments and prints only the encoded `scrypt` hash. Store that output as `ADMIN_PASSWORD_HASH`; do not store the plaintext password.

Generate a separate session signing secret containing at least 32 random bytes:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Store the output as `ADMIN_SESSION_SECRET`. Do not reuse the administrator password, its hash, a Supabase key, or a Resend key. Rotating this value signs out every administrator session. Production sessions use an HTTP-only, Secure, SameSite=Strict cookie with an eight-hour maximum age.

## 4. Environment variables

Set all values in the deployment platform's production environment. Use `.env.local` only for local testing and never commit it.

| Variable | Scope | Production value and purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical HTTPS origin on the real production `.pk` domain, for example `https://www.example.pk`. Do not use a preview URL. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Public | Digits-only international number, currently `923324468116`. |
| `SUPABASE_URL` | Server | Supabase project URL. |
| `SUPABASE_SECRET_KEY` | Server secret | Secret/service-role-capable key used only by server code. |
| `RESEND_API_KEY` | Server secret | Restricted API key for the verified Resend sending domain. |
| `ORDER_NOTIFICATION_EMAIL` | Server | New-order recipient, currently `support@pixelsgalaxy.com`. |
| `ORDER_FROM_EMAIL` | Server | Display name and sender on the verified domain. |
| `ORDER_CLIENT_IP_HEADER` | Server security boundary | Name of an edge-overwritten header containing exactly one validated client IP for `/api/orders`, for example `x-vercel-forwarded-for` when that is the platform's trusted single-IP contract. |
| `ADMIN_CLIENT_IP_HEADER` | Server security boundary | Name of an edge-overwritten header containing exactly one validated client IP for `/api/admin/login`. It may match the order header only when the same trusted edge contract protects both routes. |
| `ADMIN_PASSWORD_HASH` | Server secret | Output from the masked hash script. |
| `ADMIN_SESSION_SECRET` | Server secret | Independent value generated from at least 32 random bytes. |

`NEXT_PUBLIC_*` values are embedded into browser-facing output and are not secrets. All other values are server-only.

### Trusted edge headers and direct-origin protection

The application trusts only the configured client-IP header name. Its value must be replaced by infrastructure you control, not appended to or passed through from the public request. Configure the CDN, reverse proxy, or hosting edge to:

1. remove any visitor-supplied header with that name;
2. write exactly one canonical IPv4 or IPv6 address;
3. block public access to the application origin except through that trusted edge; and
4. apply distributed rate limiting/WAF rules to `/api/orders` in addition to the application's bounded per-instance limiter.

The same direct-origin boundary protects the Supabase-backed production admin-login limiter from identity spoofing. If either header is missing or invalid, requests share a conservative fallback bucket and unrelated users can throttle one another. Do not treat raw, comma-separated forwarding chains as a trusted single client address.

## 5. Deploy

1. Confirm the production `.pk` domain and HTTPS certificate are active.
2. Apply all three Supabase migrations and complete the RLS/grant audit.
3. Verify the Resend sending subdomain and create the production API key.
4. Configure every environment variable above for the production deployment. Rebuild after changing any `NEXT_PUBLIC_*` value.
5. Configure trusted-header replacement, direct-origin blocking, and edge rate limits before enabling order submission.
6. Install and verify the exact lockfile dependency set:

   ```powershell
   npm ci
   npm test
   npm run build
   ```

7. Deploy the Next.js application with the platform's standard Node.js runtime, then run the end-to-end checklist below.

For a conventional Node host, run `npm start` only after `npm run build` and place it behind the HTTPS reverse proxy described above. Never bake production secrets into an image layer or upload `.env.local` as a public artifact.

## 6. Search indexing

Set `NEXT_PUBLIC_SITE_URL` to the final `.pk` HTTPS origin before building. Submit `https://<production-domain>.pk/sitemap.xml` to search engines only after deployment.

The sitemap contains only the public storefront root. It must not contain `/checkout`, `/admin/login`, `/admin/orders`, order-detail URLs, or any `/api/*` URL. Checkout metadata emits `noindex, nofollow`; the shared admin layout applies `noindex, nofollow` to login, list, and detail pages. Keep these controls in place when adding routes. Sitemap exclusion alone is not an access-control mechanism.

## 7. Production verification

Use a unique synthetic note and synthetic delivery details—never a real customer's information—for the first test order.

1. Add a product to the cart and open `/checkout`.
2. Trigger one client-side validation error and confirm focus and readable field guidance.
3. Submit one valid COD order.
4. Confirm the response shows a public number matching `PG-[A-Z0-9]{6}` and the cart clears only after the successful response.
5. In Supabase, verify one corresponding row, the server-calculated integer-paisa total, and the immutable item snapshot fields: product, bundle, quantity, unit price, and line total.
6. In `support@pixelsgalaxy.com`, verify the subject, customer/delivery fields, itemized totals, and dashboard link. If email fails, verify the saved order remains and its notification state is `failed`.
7. Sign in at `/admin/login`, verify newest-first list and detail views, and change the test order status to `confirmed`.
8. Log out, then verify `/admin/orders` redirects to login and protected admin APIs reject the old session.
9. Open one `Buy on WhatsApp` action without sending it. Decode its URL and verify destination `923324468116` plus the visible product, bundle, quantity, and PKR total. Confirm it contains no name, phone, email, or address.
10. At desktop and mobile widths, check the storefront, cart, checkout fields/errors/success state, admin login/list/detail, and WhatsApp actions for keyboard focus, horizontal overflow, unexpected console errors, and customer data in logs.

Real Supabase persistence, Resend delivery, and authenticated production admin flows are not verified until this checklist is run with valid test-provider credentials and a verified sending domain. Record any skipped check explicitly rather than treating a build or mocked unit test as provider verification.

## 8. Backups, privacy, and retention

Orders contain names, phone numbers, optional email addresses, and delivery addresses. Limit Supabase dashboard and inbox access to staff who need it, require multi-factor authentication on provider accounts, and never copy production rows into development fixtures, issue trackers, chat, analytics, or console logs.

Enable a backup schedule appropriate to order volume and the Supabase plan, document who can restore it, and test restoration to a restricted non-production project. Backups and exported SQL/CSV files contain the same personal data as the live table: encrypt them, restrict access, define their expiry, and delete obsolete copies securely. Confirm provider backup retention and restore guarantees instead of assuming point-in-time recovery is enabled.

Define and document a business retention period for completed, cancelled, and abandoned orders based on operational and applicable legal needs. Review it regularly and remove records and email copies when they are no longer required. The current dashboard intentionally has no delete function, so any approved deletion or data-subject request needs a separately authorized, audited database procedure that preserves required financial or operational records. Rotating or deleting live data does not automatically remove it from backups; account for backup expiry in the retention policy.
