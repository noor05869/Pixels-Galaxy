# Pakistan Checkout Address and Payment Design

## Purpose

Improve the checkout delivery form for Pakistani customers while keeping Cash on Delivery (COD) as the only currently available payment method. The checkout must collect enough structured address information for fulfilment, persist it with the order, expose it to administrators, and include it in operational notifications.

## Scope

This change covers the checkout UI, local Pakistan location data, client and server validation, order API input, Supabase persistence, repository mappings, administrator views, notification content, and automated tests.

It does not integrate a payment gateway, bank account, RAAST account, geocoding service, address-autocomplete service, or third-party location API.

## Checkout Experience

### Delivery fields

The delivery form will collect these fields in this order:

1. Full name - required, existing field.
2. Email address - optional, existing field.
3. Pakistani phone number - required, existing normalization rules remain.
4. Street address - required, stored through the existing `address` field.
5. Province or territory - required.
6. City - required and dependent on the selected province or territory.
7. Postal code - optional.
8. Landmark - optional.
9. Address type - required, either `home` or `office`, defaulting to `home`.

The consent checkbox and honeypot remain in place.

### Province and city selection

The application will ship a local TypeScript dataset rather than call an external service during checkout. This prevents network availability, rate limits, or third-party changes from blocking an order.

The province selector will include:

- Punjab
- Sindh
- Khyber Pakhtunkhwa
- Balochistan
- Islamabad Capital Territory
- Gilgit-Baltistan
- Azad Jammu and Kashmir

Each entry will provide a curated list of major and commonly served cities. The city selector stays disabled until a province is selected. Changing the province clears an incompatible city selection.

Every province or territory will include an `Other city` option. Selecting it reveals a required text input for the customer's city. The submitted order stores the actual city name, never the literal value `Other city`.

No claim is made that the curated lists contain every locality in Pakistan.

### Payment method section

The payment section will use accessible radio-style cards:

- Cash on Delivery - selected and enabled.
- Bank Transfer - disabled and labelled `Coming soon`.
- Credit/Debit Card - disabled and labelled `Coming soon`.
- RAAST - disabled and labelled `Coming soon`.

Disabled options must use native disabled controls, remain readable, and not imply that payment details can be submitted. The order payload continues to derive `paymentMethod: "cod"` on the server; it will not trust a client-supplied payment method.

## Data Contracts

### Client form values

`CheckoutFormValues` will add:

- `province: string`
- `postalCode: string`
- `landmark: string`
- `addressType: "home" | "office"`
- `otherCity: string` for UI state when the `Other city` option is selected

The form submits the resolved city value. `otherCity` is not part of the order API contract.

### Order API input

`CheckoutInput` will add:

- `province: string`
- `postalCode?: string`
- `landmark?: string`
- `addressType: "home" | "office"`

Server validation will:

- Require a supported province or territory.
- Require a non-empty city up to 100 characters.
- Require a street address up to 500 characters.
- Accept an optional postal code containing 3-10 letters, digits, spaces, or hyphens.
- Accept an optional landmark up to 200 characters.
- Accept only `home` or `office` for address type.
- Preserve existing phone, cart, catalogue revision, consent, and honeypot rules.

The server remains the authority for `paymentMethod: "cod"`.

## Persistence

A forward-only Supabase migration will add nullable columns to the existing `orders` table:

- `province text`
- `postal_code text`
- `landmark text`
- `address_type text`

`address_type` will have a check constraint allowing `home` or `office` when present. Columns remain nullable at the database level so existing orders and deployments migrate safely. New API validation requires province and address type for newly placed orders.

Repository row types and mappings will convert snake_case database fields to camelCase domain fields. Existing order rows without new values will continue to load; admin UI and notifications will omit absent optional or legacy values gracefully.

## Admin and Notifications

The order detail page will show:

- Street address
- City
- Province
- Postal code when present
- Landmark when present
- Address type
- Payment method (`Cash on Delivery`)

The orders list keeps its current compact city column. Province does not need a new list column.

Email or operational notification text and HTML will include the same delivery fields, omitting optional values when absent. No bank, card, or RAAST information will be included.

## UI and Accessibility

The new controls will follow the existing checkout visual language and remain responsive at current breakpoints.

- Every control has a visible label.
- Required fields expose validation messages through `aria-describedby`.
- Province and city use native selects for keyboard and mobile compatibility.
- Address type uses a labelled radio group.
- Disabled payment controls use the native `disabled` state plus visible `Coming soon` text.
- Focus-on-error behavior includes every new required field.
- Colour is not the only indication of selected, invalid, or disabled state.

## Error Handling

Client-side validation gives immediate field-specific feedback, but the API repeats all validation before creating an order.

If a province changes, the city is reset before submission. If `Other city` is selected without a valid custom value, submission is blocked and focus moves to that input through the existing error-summary pattern.

Location data is bundled with the application, so there is no location-service loading or network error state.

## Testing

Implementation will follow test-driven development and cover:

1. Location dataset contains all seven province or territory groups, includes common cities, and supplies `Other city` for each group.
2. Client validation requires province, resolved city, street address, and address type while accepting valid optional values.
3. Server validation normalizes valid input and rejects unsupported provinces, invalid address types, and malformed postal codes.
4. The order service and repository persist and reload the new fields while remaining compatible with legacy nullable rows.
5. Notification text and HTML include required address details and conditionally include postal code and landmark.
6. Admin order details render the added fields and omit missing legacy values cleanly.
7. Checkout UI exposes dependent location controls, Home/Office selection, COD as selected, and all three unavailable payment methods as disabled.
8. The production build succeeds.

## Rollout

Apply the Supabase migration before deploying application code that sends the new columns. Because the new database columns are nullable, the migration is backward-compatible with the currently deployed checkout. After deployment, place a test COD order and confirm the new address values appear in Supabase, admin detail, and notifications.
