# Pakistan Checkout Address and Payments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add structured Pakistan delivery fields and a clear payment-method selector where Cash on Delivery is the only enabled option.

**Architecture:** Bundle a typed province/city catalogue with the application and keep location-selection logic in a small pure module. Extend the existing checkout contract end-to-end through client validation, server validation, domain types, Supabase persistence, notifications, and admin display; keep payment authority server-side and fixed to COD.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.9, Zod 4, Supabase PostgreSQL, Vitest 4, Resend

**Spec:** `docs/superpowers/specs/2026-09-03-pakistan-checkout-address-and-payments-design.md`

## Global Constraints

- Cash on Delivery is the only enabled payment method.
- Bank Transfer, Credit/Debit Card, and RAAST must use native disabled controls and show `Coming soon`.
- Do not add a runtime third-party location API or a payment integration.
- Province and address type are required for all newly submitted orders.
- Database columns are nullable for compatibility with existing stored orders.
- Changing province clears an incompatible city selection.
- `Other city` reveals a required custom input and the API receives the resolved city name.
- Preserve existing phone normalization, cart validation, catalogue revision, consent, and honeypot behavior.
- Preserve unrelated working-tree changes, including the policy-page work already present.

## File Structure

- `lib/locations/pakistan.ts`: typed local province and major-city catalogue plus lookup helpers.
- `lib/locations/pakistan.test.ts`: catalogue completeness and lookup behavior.
- `lib/orders/checkout-validation.ts`: browser-form value types and client validation.
- `lib/orders/checkout-validation.test.ts`: field-level client validation coverage.
- `lib/orders/types.ts`: API, domain, and stored-order address contracts.
- `lib/orders/validation.ts`: authoritative Zod validation and normalization.
- `lib/orders/validation.test.ts`: server input validation coverage.
- `supabase/migrations/202609030001_add_order_delivery_fields.sql`: backward-compatible columns and address-type constraint.
- `lib/orders/repository.ts`: database row mappings.
- `lib/orders/repository.test.ts`: insert/load/legacy mapping coverage.
- `lib/orders/service.ts`: transfers validated address fields into new orders.
- `lib/orders/service.test.ts`: end-to-end service mapping coverage.
- `lib/orders/notification.ts`: text and HTML delivery details.
- `lib/orders/notification.test.ts`: notification content coverage.
- `components/admin/OrderDetail.tsx`: administrator delivery details.
- `components/admin/admin-components.test.ts`: rendered admin delivery fields.
- `components/checkout/CheckoutForm.tsx`: dependent selectors, address fields, address type, and payment cards.
- `components/checkout/checkout-form-contract.test.ts`: source-independent form contract via exported configuration and server-rendered markup where supported.
- `app/globals.css`: checkout field, radio-card, disabled-state, and responsive styling.

---

### Task 1: Pakistan Province and City Catalogue

**Files:**
- Create: `lib/locations/pakistan.ts`
- Create: `lib/locations/pakistan.test.ts`

**Interfaces:**
- Produces: `ProvinceCode`, `PakistanProvince`, `pakistanProvinces`, `isProvinceCode(value)`, `citiesForProvince(code)`, and `provinceNameForCode(code)`.
- Consumes: No project modules.

- [ ] **Step 1: Write the failing catalogue tests**

```ts
import { describe, expect, it } from "vitest";
import { citiesForProvince, isProvinceCode, pakistanProvinces } from "./pakistan";

describe("Pakistan checkout locations", () => {
  it("publishes all supported province and territory groups", () => {
    expect(pakistanProvinces.map(({ code, name }) => ({ code, name }))).toEqual([
      { code: "punjab", name: "Punjab" },
      { code: "sindh", name: "Sindh" },
      { code: "khyber-pakhtunkhwa", name: "Khyber Pakhtunkhwa" },
      { code: "balochistan", name: "Balochistan" },
      { code: "islamabad", name: "Islamabad Capital Territory" },
      { code: "gilgit-baltistan", name: "Gilgit-Baltistan" },
      { code: "azad-kashmir", name: "Azad Jammu and Kashmir" },
    ]);
  });

  it("includes common cities and an Other city escape hatch", () => {
    expect(citiesForProvince("punjab")).toEqual(expect.arrayContaining(["Lahore", "Rawalpindi", "Faisalabad", "Other city"]));
    expect(citiesForProvince("sindh")).toEqual(expect.arrayContaining(["Karachi", "Hyderabad", "Other city"]));
    expect(pakistanProvinces.every((province) => province.cities.at(-1) === "Other city")).toBe(true);
  });

  it("rejects unsupported province values", () => {
    expect(isProvinceCode("punjab")).toBe(true);
    expect(isProvinceCode("other")).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npx vitest run lib/locations/pakistan.test.ts`

Expected: FAIL because `./pakistan` does not exist.

- [ ] **Step 3: Implement the typed local catalogue**

Create literal province entries with common cities. Each `cities` array must end with `Other city`. Export helpers with these signatures:

```ts
export type ProvinceCode = typeof pakistanProvinces[number]["code"];
export type PakistanProvince = typeof pakistanProvinces[number];
export function isProvinceCode(value: string): value is ProvinceCode;
export function citiesForProvince(code: ProvinceCode | ""): readonly string[];
export function provinceNameForCode(code: ProvinceCode): string;
```

Use a simple `find` lookup and return `[]` for the empty selection.

- [ ] **Step 4: Run the catalogue tests and verify GREEN**

Run: `npx vitest run lib/locations/pakistan.test.ts`

Expected: 3 tests PASS.

- [ ] **Step 5: Commit the catalogue**

```bash
git add lib/locations/pakistan.ts lib/locations/pakistan.test.ts
git commit -m "feat: add Pakistan checkout locations"
```

---

### Task 2: Client Delivery-Field Validation

**Files:**
- Modify: `lib/orders/checkout-validation.ts`
- Modify: `lib/orders/checkout-validation.test.ts`

**Interfaces:**
- Consumes: `ProvinceCode` and `isProvinceCode` from `lib/locations/pakistan.ts`.
- Produces: extended `CheckoutFormValues`, `CheckoutFieldName`, `CheckoutErrors`, and existing `validateCheckoutFields(fields)`.

- [ ] **Step 1: Extend test fixtures and write failing validation cases**

Use this valid base fixture:

```ts
const validFields: CheckoutFormValues = {
  customerName: "Ali Ahmed",
  phone: "03001234567",
  email: "ali@example.com",
  address: "House 12, Street 5, Block A",
  province: "punjab",
  city: "Lahore",
  otherCity: "",
  postalCode: "54000",
  landmark: "Near Central Market",
  addressType: "home",
  notes: "",
  consent: true,
  website: "",
};
```

Add focused tests asserting:

```ts
expect(validateCheckoutFields({ ...validFields, province: "" }).province).toBe("Select your province or territory.");
expect(validateCheckoutFields({ ...validFields, city: "" }).city).toBe("Select your city.");
expect(validateCheckoutFields({ ...validFields, city: "Other city", otherCity: " " }).otherCity).toBe("Enter your city.");
expect(validateCheckoutFields({ ...validFields, postalCode: "12@" }).postalCode).toBe("Enter a valid postal code or leave it blank.");
expect(validateCheckoutFields({ ...validFields, addressType: "" }).addressType).toBe("Choose Home or Office.");
expect(validateCheckoutFields(validFields)).toEqual({});
```

- [ ] **Step 2: Run the client validation tests and verify RED**

Run: `npx vitest run lib/orders/checkout-validation.test.ts`

Expected: FAIL because the new properties and messages are not implemented.

- [ ] **Step 3: Extend types and validation minimally**

Add fields to `CheckoutFormValues`:

```ts
province: ProvinceCode | "";
city: string;
otherCity: string;
postalCode: string;
landmark: string;
addressType: "home" | "office" | "";
```

Validate province with `isProvinceCode`, require `city`, require `otherCity` only when city is `Other city`, constrain postal code with `/^[A-Za-z0-9 -]{3,10}$/`, constrain landmark to 200 characters, and require the address type union. Keep existing rules unchanged.

- [ ] **Step 4: Run client validation tests and verify GREEN**

Run: `npx vitest run lib/orders/checkout-validation.test.ts`

Expected: all tests PASS.

- [ ] **Step 5: Commit client validation**

```bash
git add lib/orders/checkout-validation.ts lib/orders/checkout-validation.test.ts
git commit -m "feat: validate structured delivery fields"
```

---

### Task 3: Server Contract and Database Migration

**Files:**
- Modify: `lib/orders/types.ts`
- Modify: `lib/orders/validation.ts`
- Modify: `lib/orders/validation.test.ts`
- Create: `supabase/migrations/202609030001_add_order_delivery_fields.sql`

**Interfaces:**
- Consumes: `ProvinceCode` and `isProvinceCode` from Task 1.
- Produces: extended `CheckoutInput` and `NewOrder` with required `province`/`addressType`, and a legacy-compatible `StoredOrder` where those two fields may be absent.

- [ ] **Step 1: Write failing server-validation tests**

Extend the valid API input with:

```ts
province: "punjab",
postalCode: "54000",
landmark: "Near Central Market",
addressType: "home",
```

Assert the parsed object retains trimmed values. Add table cases for unsupported `province`, invalid `addressType`, and `postalCode: "@@"`. Add a case proving blank postal code and landmark become `undefined`.

- [ ] **Step 2: Run server-validation tests and verify RED**

Run: `npx vitest run lib/orders/validation.test.ts`

Expected: FAIL because the schema and types do not include the new fields.

- [ ] **Step 3: Extend domain types and Zod validation**

Add to `CheckoutInput` and `NewOrder`:

```ts
province: ProvinceCode;
postalCode?: string;
landmark?: string;
addressType: "home" | "office";
```

Override the legacy-sensitive fields when defining `StoredOrder` so rows created before the migration remain representable:

```ts
export type StoredOrder = Omit<NewOrder, "status" | "notificationState" | "province" | "addressType"> & {
  province?: ProvinceCode;
  addressType?: "home" | "office";
  id: string;
  status: OrderStatus;
  notificationState: NotificationState;
  notificationFailure?: string;
  createdAt: string;
  updatedAt: string;
};
```

In `validation.ts`, define:

```ts
province: z.string().trim().refine(isProvinceCode),
postalCode: optionalText(10).pipe(z.string().regex(/^[A-Za-z0-9 -]{3,10}$/).optional()),
landmark: optionalText(200),
addressType: z.enum(["home", "office"]),
```

- [ ] **Step 4: Add the backward-compatible migration**

```sql
alter table public.orders
  add column if not exists province text,
  add column if not exists postal_code text,
  add column if not exists landmark text,
  add column if not exists address_type text;

alter table public.orders
  drop constraint if exists orders_address_type_check;

alter table public.orders
  add constraint orders_address_type_check
  check (address_type is null or address_type in ('home', 'office'));
```

- [ ] **Step 5: Run validation tests and TypeScript**

Run: `npx vitest run lib/orders/validation.test.ts && npx tsc --noEmit`

Expected: validation tests PASS; TypeScript reports downstream missing-field errors that Tasks 4-5 will resolve. Record those errors; do not weaken the new types.

- [ ] **Step 6: Commit the contract and migration**

```bash
git add lib/orders/types.ts lib/orders/validation.ts lib/orders/validation.test.ts supabase/migrations/202609030001_add_order_delivery_fields.sql
git commit -m "feat: extend order delivery contract"
```

---

### Task 4: Persistence, Service, Notifications, and Admin Display

**Files:**
- Modify: `lib/orders/repository.ts`
- Modify: `lib/orders/repository.test.ts`
- Modify: `lib/orders/service.ts`
- Modify: `lib/orders/service.test.ts`
- Modify: `lib/orders/notification.ts`
- Modify: `lib/orders/notification.test.ts`
- Modify: `components/admin/OrderDetail.tsx`
- Modify: `components/admin/admin-components.test.ts`
- Modify fixtures in: `app/admin/orders/orders-pages.test.ts`, `app/api/admin/orders/status-route.test.ts`, and other tests TypeScript identifies.

**Interfaces:**
- Consumes: extended order types from Task 3.
- Produces: durable and operational handling of all new address fields.

- [ ] **Step 1: Write failing repository mapping tests**

Extend `NewOrderRow` expectations with:

```ts
province: "punjab",
postal_code: "54000",
landmark: "Near Central Market",
address_type: "home",
```

Add a legacy-row test with all four database values `null`, asserting the returned order omits province/postalCode/landmark/addressType instead of throwing.

- [ ] **Step 2: Run repository tests and verify RED**

Run: `npx vitest run lib/orders/repository.test.ts`

Expected: FAIL on missing row mappings.

- [ ] **Step 3: Implement nullable row mappings**

Add nullable fields to `OrderRow`. `toOrderRow()` maps camelCase values to snake_case. `toStoredOrder()` conditionally spreads each non-null value so legacy rows remain readable.

- [ ] **Step 4: Write and run failing service tests**

Update the valid service request and assert the repository receives:

```ts
expect.objectContaining({
  province: "punjab",
  city: "Lahore",
  postalCode: "54000",
  landmark: "Near Central Market",
  addressType: "home",
  paymentMethod: "cod",
})
```

Run: `npx vitest run lib/orders/service.test.ts`

Expected: FAIL because `service.ts` does not transfer the new fields.

- [ ] **Step 5: Transfer validated fields in the service**

Copy required fields directly and conditionally spread optional fields, following the existing email/notes pattern. Do not accept or copy a client payment method; retain `paymentMethod: "cod"`.

- [ ] **Step 6: Write failing notification and admin tests**

Assert text and HTML contain `Province: Punjab`, `Postal code: 54000`, `Landmark: Near Central Market`, and `Address type: Home`. Add a fixture without optional/legacy fields and assert no `undefined` or empty `<dd>` appears. Assert `OrderDetail` renders Province and Address type and conditionally renders Postal code and Landmark.

- [ ] **Step 7: Implement notification and admin rendering**

Add required delivery rows and conditional optional rows to both notification formats. Capitalize address type for display. Add corresponding `<dl>` entries to `OrderDetail`.

- [ ] **Step 8: Run the operational tests**

Run: `npx vitest run lib/orders/repository.test.ts lib/orders/service.test.ts lib/orders/notification.test.ts components/admin/admin-components.test.ts app/admin/orders/orders-pages.test.ts app/api/admin/orders/status-route.test.ts`

Expected: all selected tests PASS.

- [ ] **Step 9: Commit persistence and operations**

```bash
git add lib/orders/repository.ts lib/orders/repository.test.ts lib/orders/service.ts lib/orders/service.test.ts lib/orders/notification.ts lib/orders/notification.test.ts components/admin/OrderDetail.tsx components/admin/admin-components.test.ts app/admin/orders/orders-pages.test.ts app/api/admin/orders/status-route.test.ts
git commit -m "feat: persist and display delivery details"
```

---

### Task 5: Checkout Form and Payment Cards

**Files:**
- Modify: `components/checkout/CheckoutForm.tsx`
- Create: `components/checkout/checkout-options.ts`
- Create: `components/checkout/checkout-options.test.ts`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `pakistanProvinces`, `citiesForProvince`, `CheckoutFormValues`, and `validateCheckoutFields`.
- Produces: exported `paymentOptions`, form UI state, and the resolved API payload.

- [ ] **Step 1: Write failing payment-option contract tests**

```ts
import { describe, expect, it } from "vitest";
import { paymentOptions } from "./checkout-options";

describe("checkout payment options", () => {
  it("enables only Cash on Delivery", () => {
    expect(paymentOptions).toEqual([
      { id: "cod", label: "Cash on Delivery", disabled: false },
      { id: "bank", label: "Bank Transfer", disabled: true },
      { id: "card", label: "Credit/Debit Card", disabled: true },
      { id: "raast", label: "RAAST", disabled: true },
    ]);
  });
});
```

- [ ] **Step 2: Run the payment test and verify RED**

Run: `npx vitest run components/checkout/checkout-options.test.ts`

Expected: FAIL because `checkout-options.ts` does not exist.

- [ ] **Step 3: Add immutable payment configuration**

Export `paymentOptions` with the exact four entries above and `as const`. This keeps rendering data separate from the large form component and makes the disabled contract testable without browser mocks.

- [ ] **Step 4: Extend initial state, labels, and payload resolution**

Initialize province/city/custom city/postal code/landmark/address type. Add every new required field to `fieldDetails` and error ordering. Before fetch, resolve:

```ts
const resolvedCity = fields.city === "Other city" ? fields.otherCity.trim() : fields.city.trim();
```

Submit `province`, `city: resolvedCity`, optional trimmed postal code/landmark, and `addressType`. Do not submit a payment method.

- [ ] **Step 5: Render dependent address controls**

Use native `<select>` controls. Province options come from `pakistanProvinces`; city options come from `citiesForProvince(fields.province)`. Disable city while no province is selected. On province change, set both `city` and `otherCity` to empty strings. Render the custom city input only for `Other city`.

- [ ] **Step 6: Render address type and payment controls**

Render Home/Office in a fieldset with native radios. Render payment options in a separate fieldset. COD has `defaultChecked`/checked state and disabled options have native `disabled` plus a visible `Coming soon` badge. Payment controls do not update the order payload.

- [ ] **Step 7: Add checkout styling**

Add focused classes for select controls, paired city/postal fields, address-type pills, payment cards, selected COD state, and disabled payment state. At the existing mobile breakpoint, collapse paired fields to one column. Preserve visible focus indicators and use opacity plus text/borders—not colour alone—for disabled state.

- [ ] **Step 8: Run form-adjacent tests and TypeScript**

Run: `npx vitest run components/checkout/checkout-options.test.ts lib/orders/checkout-validation.test.ts && npx tsc --noEmit`

Expected: tests PASS and TypeScript exits 0.

- [ ] **Step 9: Commit the checkout UI**

```bash
git add components/checkout/CheckoutForm.tsx components/checkout/checkout-options.ts components/checkout/checkout-options.test.ts app/globals.css
git commit -m "feat: add structured checkout and payment choices"
```

---

### Task 6: Full Regression and Deployment Verification

**Files:**
- Modify only files required to resolve failures caused by Tasks 1-5.

**Interfaces:**
- Consumes: all earlier task outputs.
- Produces: a release-ready checkout change and an exact migration rollout note.

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`

Expected: all tests related to checkout, order creation, repository mapping, notifications, admin rendering, locations, and policies PASS. If unrelated pre-existing failures remain, compare them with the baseline and report them without modifying unrelated code.

- [ ] **Step 2: Run a clean TypeScript check**

Run: `npx tsc --noEmit`

Expected: exit 0.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: exit 0 and static/dynamic routes generated successfully.

- [ ] **Step 4: Verify the migration contract manually**

Review `supabase/migrations/202609030001_add_order_delivery_fields.sql` and confirm it only adds nullable columns plus the nullable address-type constraint. Confirm no destructive table rebuild, data rewrite, or removal exists.

- [ ] **Step 5: Verify checkout behavior in a desktop and mobile browser**

On a cart with one item, confirm province changes reset city; each province offers common cities and `Other city`; custom city is required only when selected; Home defaults selected; COD is enabled; Bank Transfer, Credit/Debit Card, and RAAST are disabled and labelled `Coming soon`; validation summary focuses the correct control; mobile layout does not overflow.

- [ ] **Step 6: Confirm the working tree contains only planned implementation changes**

Run: `git status --short && git diff --check`

Expected: no whitespace errors; every checkout-related change belongs to a file named in Tasks 1-5; pre-existing policy-page changes remain preserved and unmodified unless they overlap `app/globals.css` or `lib/storefront/content.ts`.

- [ ] **Step 7: Record rollout order in the handoff**

State explicitly: apply `202609030001_add_order_delivery_fields.sql` to Supabase first, deploy application code second, then place one test COD order and verify Supabase, admin detail, and notification values.
