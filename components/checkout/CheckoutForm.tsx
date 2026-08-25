"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent, InvalidEvent } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { toCheckoutPayload } from "@/lib/orders/checkout-payload";
import { OrderSummary } from "./OrderSummary";

type CheckoutFields = {
  customerName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  notes: string;
  consent: boolean;
  website: string;
};

const initialFields: CheckoutFields = {
  customerName: "",
  phone: "",
  email: "",
  city: "",
  address: "",
  notes: "",
  consent: false,
  website: "",
};

export function CheckoutForm() {
  const { lines, clearCart } = useCart();
  const [fields, setFields] = useState(initialFields);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);
  const clearedRef = useRef(false);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const updateField = (field: keyof CheckoutFields, value: string | boolean) => {
    setFields((current) => ({ ...current, [field]: value }));
  };

  const handleInvalid = (event: InvalidEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("Please review the highlighted field and try again.");
    requestAnimationFrame(() => errorRef.current?.focus());
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;

    submittingRef.current = true;
    setSubmitting(true);
    setError("");

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
          items: toCheckoutPayload(lines),
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
        const message = result && typeof result === "object" && "error" in result && typeof result.error === "string"
          ? result.error
          : "We could not place your order. Please try again.";
        setError(message);
        return;
      }

      setOrderNumber(result.orderNumber);
      if (!clearedRef.current) {
        clearedRef.current = true;
        clearCart();
      }
    } catch {
      setError("We could not reach the order service. Check your connection and try again.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (orderNumber) {
    return (
      <section className="checkout-state checkout-success" aria-labelledby="checkout-success-title">
        <p className="checkout-kicker">THANK YOU</p>
        <h1 id="checkout-success-title">Order {orderNumber} confirmed</h1>
        <p>Your Cash on Delivery order is in. Pay the courier when your parcel arrives.</p>
        <p>Questions? Email <a href="mailto:hello@pixelsgalaxy.com">hello@pixelsgalaxy.com</a>.</p>
        <Link href="/#shop" className="checkout-primary-action">Return to store</Link>
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

          {error ? (
            <div className="checkout-error" id="checkout-error" role="alert" tabIndex={-1} ref={errorRef}>
              <strong>There is a problem</strong>
              <span>{error}</span>
            </div>
          ) : null}

          <div className="checkout-field checkout-field-wide">
            <label htmlFor="customer-name">Full name *</label>
            <input id="customer-name" name="customerName" autoComplete="name" required maxLength={100} value={fields.customerName} onChange={(event) => updateField("customerName", event.target.value)} />
          </div>

          <div className="checkout-field">
            <label htmlFor="phone">Pakistani phone number *</label>
            <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required pattern="(?:03[0-9]{9}|[+]923[0-9]{9})" title="Use 03XXXXXXXXX or +923XXXXXXXXX" placeholder="03XXXXXXXXX" value={fields.phone} onChange={(event) => updateField("phone", event.target.value)} />
            <small>Use 03XXXXXXXXX or +923XXXXXXXXX.</small>
          </div>

          <div className="checkout-field">
            <label htmlFor="email">Email <span>(optional)</span></label>
            <input id="email" name="email" type="email" inputMode="email" autoComplete="email" maxLength={254} value={fields.email} onChange={(event) => updateField("email", event.target.value)} />
          </div>

          <div className="checkout-field checkout-field-wide">
            <label htmlFor="city">City *</label>
            <input id="city" name="city" autoComplete="address-level2" required maxLength={100} value={fields.city} onChange={(event) => updateField("city", event.target.value)} />
          </div>

          <div className="checkout-field checkout-field-wide">
            <label htmlFor="address">Delivery address *</label>
            <textarea id="address" name="address" autoComplete="street-address" required maxLength={500} rows={4} value={fields.address} onChange={(event) => updateField("address", event.target.value)} />
          </div>

          <div className="checkout-field checkout-field-wide">
            <label htmlFor="notes">Order notes <span>(optional)</span></label>
            <textarea id="notes" name="notes" maxLength={1000} rows={3} placeholder="Delivery instructions or anything else we should know" value={fields.notes} onChange={(event) => updateField("notes", event.target.value)} />
          </div>

          <div className="checkout-honeypot" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" maxLength={0} value={fields.website} onChange={(event) => updateField("website", event.target.value)} />
          </div>

          <label className="checkout-consent">
            <input type="checkbox" name="consent" required checked={fields.consent} onChange={(event) => updateField("consent", event.target.checked)} />
            <span>I confirm these delivery details are correct and agree to be contacted about this order. *</span>
          </label>

          <button className="checkout-submit" type="submit" disabled={submitting}>
            {submitting ? "PLACING ORDER…" : "PLACE CASH ON DELIVERY ORDER"}
          </button>
        </form>
        <OrderSummary lines={lines} />
      </div>
    </>
  );
}
