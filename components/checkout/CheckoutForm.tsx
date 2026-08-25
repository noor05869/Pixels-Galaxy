"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent, InvalidEvent } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { createCheckoutPayload } from "@/lib/orders/checkout-payload";
import { validateCheckoutFields } from "@/lib/orders/checkout-validation";
import type { CheckoutErrors, CheckoutFieldName, CheckoutFormValues } from "@/lib/orders/checkout-validation";
import { OrderSummary } from "./OrderSummary";

const initialFields: CheckoutFormValues = {
  customerName: "",
  phone: "",
  email: "",
  city: "",
  address: "",
  notes: "",
  consent: false,
  website: "",
};

const fieldDetails: Record<CheckoutFieldName, { id: string; label: string }> = {
  customerName: { id: "customer-name", label: "Full name" },
  phone: { id: "phone", label: "Pakistani phone number" },
  email: { id: "email", label: "Email" },
  city: { id: "city", label: "City" },
  address: { id: "address", label: "Delivery address" },
  notes: { id: "notes", label: "Order notes" },
  consent: { id: "consent", label: "Consent" },
};

const fieldOrder = Object.keys(fieldDetails) as CheckoutFieldName[];

export function CheckoutForm() {
  const { lines, isHydrated, clearCart } = useCart();
  const [fields, setFields] = useState(initialFields);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<CheckoutErrors>({});
  const [submissionError, setSubmissionError] = useState("");
  const [errorFocusVersion, setErrorFocusVersion] = useState(0);
  const [orderNumber, setOrderNumber] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLElement>(null);
  const submittingRef = useRef(false);
  const clearedRef = useRef(false);

  useEffect(() => {
    if (orderNumber) successRef.current?.focus();
  }, [orderNumber]);

  useEffect(() => {
    if (errorFocusVersion > 0) errorRef.current?.focus();
  }, [errorFocusVersion]);

  const showValidationErrors = (errors: CheckoutErrors) => {
    setFieldErrors(errors);
    setSubmissionError("");
    setErrorFocusVersion((current) => current + 1);
  };

  const updateField = (field: keyof CheckoutFormValues, value: string | boolean) => {
    setFields((current) => ({ ...current, [field]: value }));
    setSubmissionError("");
    if (field !== "website" && fieldErrors[field]) {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  };

  const handleInvalid = (event: InvalidEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateCheckoutFields(fields);
    if (Object.keys(errors).length > 0) showValidationErrors(errors);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const errors = validateCheckoutFields(fields);
    if (Object.keys(errors).length > 0) {
      showValidationErrors(errors);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setFieldErrors({});
    setSubmissionError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customerName: fields.customerName.trim(),
          phone: fields.phone.trim(),
          email: fields.email.trim() || undefined,
          city: fields.city.trim(),
          address: fields.address.trim(),
          notes: fields.notes.trim() || undefined,
          consent: fields.consent,
          website: fields.website,
          ...createCheckoutPayload(lines),
        }),
      });
      const result: unknown = await response.json().catch(() => null);

      if (
        response.status !== 201
        || !result
        || typeof result !== "object"
        || !("orderNumber" in result)
        || typeof result.orderNumber !== "string"
      ) {
        const message = response.status === 409
          ? "Your cart changed since this page loaded. Refresh the page, review the latest total, and try again."
          : result && typeof result === "object" && "error" in result && typeof result.error === "string" ? result.error
          : "We could not place your order. Please try again.";
        setSubmissionError(message);
        setErrorFocusVersion((current) => current + 1);
        return;
      }

      setOrderNumber(result.orderNumber);
      if (!clearedRef.current) {
        clearedRef.current = true;
        clearCart();
      }
    } catch {
      setSubmissionError("We could not reach the order service. Check your connection and try again.");
      setErrorFocusVersion((current) => current + 1);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const validationErrors = fieldOrder.filter((field) => fieldErrors[field]);
  const hasErrors = validationErrors.length > 0 || Boolean(submissionError);

  if (orderNumber) {
    return (
      <section className="checkout-state checkout-success" aria-labelledby="checkout-success-title" aria-live="polite" role="status" tabIndex={-1} ref={successRef}>
        <p className="checkout-kicker">THANK YOU</p>
        <h1 id="checkout-success-title">Order {orderNumber} confirmed</h1>
        <p>Your Cash on Delivery order is in. Pay the courier when your parcel arrives.</p>
        <p>Questions? Email <a href="mailto:hello@pixelsgalaxy.com">hello@pixelsgalaxy.com</a>.</p>
        <Link href="/#shop" className="checkout-primary-action">Return to store</Link>
      </section>
    );
  }

  if (!isHydrated) {
    return (
      <section className="checkout-state checkout-loading" aria-live="polite" aria-busy="true">
        <p className="checkout-kicker">YOUR ORDER</p>
        <h1>Loading your cart…</h1>
        <p>Checking your saved items.</p>
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <section className="checkout-state" aria-labelledby="empty-cart-title">
        <p className="checkout-kicker">YOUR ORDER</p>
        <h1 id="empty-cart-title">Your cart is empty</h1>
        <p>Choose a ZipString before starting checkout.</p>
        <Link href="/#shop" className="checkout-primary-action">Shop ZipString</Link>
      </section>
    );
  }

  return (
    <>
      <div className="checkout-intro">
        <p className="checkout-kicker">CASH ON DELIVERY</p>
        <h1>Checkout</h1>
        <p>Enter your delivery details. You will pay when your order arrives.</p>
      </div>
      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={handleSubmit} onInvalid={handleInvalid}>
          <div className="checkout-form-heading">
            <span>01</span>
            <div>
              <h2>Delivery details</h2>
              <p>Fields marked with * are required.</p>
            </div>
          </div>

          {hasErrors ? (
            <div className="checkout-error" id="checkout-error" role="alert" aria-labelledby="checkout-error-title" tabIndex={-1} ref={errorRef}>
              <strong id="checkout-error-title">
                {validationErrors.length > 1 ? `There are ${validationErrors.length} problems` : "There is a problem"}
              </strong>
              {submissionError ? <span>{submissionError}</span> : null}
              {validationErrors.length > 0 ? (
                <ul>
                  {validationErrors.map((field) => (
                    <li key={field}>
                      <a href={`#${fieldDetails[field].id}`} onClick={(event) => {
                        event.preventDefault();
                        document.getElementById(fieldDetails[field].id)?.focus();
                      }}>
                        {fieldDetails[field].label}: {fieldErrors[field]}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div className="checkout-field checkout-field-wide">
            <label htmlFor="customer-name">Full name *</label>
            <input id="customer-name" name="customerName" autoComplete="name" required maxLength={100} aria-invalid={fieldErrors.customerName ? true : undefined} aria-describedby={fieldErrors.customerName ? "customer-name-error" : undefined} value={fields.customerName} onChange={(event) => updateField("customerName", event.target.value)} />
            {fieldErrors.customerName ? <span className="checkout-field-error" id="customer-name-error">{fieldErrors.customerName}</span> : null}
          </div>

          <div className="checkout-field">
            <label htmlFor="phone">Pakistani phone number *</label>
            <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required pattern="(?:03[0-9]{9}|[+]923[0-9]{9}|00923[0-9]{9})" title="Use 03XXXXXXXXX, +923XXXXXXXXX, or 00923XXXXXXXXX" placeholder="03XXXXXXXXX" aria-invalid={fieldErrors.phone ? true : undefined} aria-describedby={fieldErrors.phone ? "phone-hint phone-error" : "phone-hint"} value={fields.phone} onChange={(event) => updateField("phone", event.target.value)} />
            <small id="phone-hint">Use 03XXXXXXXXX, +923XXXXXXXXX, or 00923XXXXXXXXX.</small>
            {fieldErrors.phone ? <span className="checkout-field-error" id="phone-error">{fieldErrors.phone}</span> : null}
          </div>

          <div className="checkout-field">
            <label htmlFor="email">Email <span>(optional)</span></label>
            <input id="email" name="email" type="email" inputMode="email" autoComplete="email" maxLength={254} aria-invalid={fieldErrors.email ? true : undefined} aria-describedby={fieldErrors.email ? "email-error" : undefined} value={fields.email} onChange={(event) => updateField("email", event.target.value)} />
            {fieldErrors.email ? <span className="checkout-field-error" id="email-error">{fieldErrors.email}</span> : null}
          </div>

          <div className="checkout-field checkout-field-wide">
            <label htmlFor="city">City *</label>
            <input id="city" name="city" autoComplete="address-level2" required maxLength={100} aria-invalid={fieldErrors.city ? true : undefined} aria-describedby={fieldErrors.city ? "city-error" : undefined} value={fields.city} onChange={(event) => updateField("city", event.target.value)} />
            {fieldErrors.city ? <span className="checkout-field-error" id="city-error">{fieldErrors.city}</span> : null}
          </div>

          <div className="checkout-field checkout-field-wide">
            <label htmlFor="address">Delivery address *</label>
            <textarea id="address" name="address" autoComplete="street-address" required maxLength={500} rows={4} aria-invalid={fieldErrors.address ? true : undefined} aria-describedby={fieldErrors.address ? "address-error" : undefined} value={fields.address} onChange={(event) => updateField("address", event.target.value)} />
            {fieldErrors.address ? <span className="checkout-field-error" id="address-error">{fieldErrors.address}</span> : null}
          </div>

          <div className="checkout-field checkout-field-wide">
            <label htmlFor="notes">Order notes <span>(optional)</span></label>
            <textarea id="notes" name="notes" maxLength={1000} rows={3} placeholder="Delivery instructions or anything else we should know" aria-invalid={fieldErrors.notes ? true : undefined} aria-describedby={fieldErrors.notes ? "notes-error" : undefined} value={fields.notes} onChange={(event) => updateField("notes", event.target.value)} />
            {fieldErrors.notes ? <span className="checkout-field-error" id="notes-error">{fieldErrors.notes}</span> : null}
          </div>

          <div className="checkout-honeypot" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" maxLength={0} value={fields.website} onChange={(event) => updateField("website", event.target.value)} />
          </div>

          <div className="checkout-consent-wrap">
            <label className="checkout-consent" htmlFor="consent">
              <input id="consent" type="checkbox" name="consent" required aria-invalid={fieldErrors.consent ? true : undefined} aria-describedby={fieldErrors.consent ? "consent-error" : undefined} checked={fields.consent} onChange={(event) => updateField("consent", event.target.checked)} />
              <span>I confirm these delivery details are correct and agree to be contacted about this order. *</span>
            </label>
            {fieldErrors.consent ? <span className="checkout-field-error" id="consent-error">{fieldErrors.consent}</span> : null}
          </div>

          <button className="checkout-submit" type="submit" disabled={submitting}>
            {submitting ? "PLACING ORDER…" : "PLACE CASH ON DELIVERY ORDER"}
          </button>
        </form>
        <OrderSummary lines={lines} />
      </div>
    </>
  );
}
