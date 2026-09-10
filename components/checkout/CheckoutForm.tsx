"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent, InvalidEvent } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { createCheckoutPayload } from "@/lib/orders/checkout-payload";
import { validateCheckoutFields } from "@/lib/orders/checkout-validation";
import type { CheckoutErrors, CheckoutFieldName, CheckoutFormValues } from "@/lib/orders/checkout-validation";
import { citiesForProvince, pakistanProvinces, type ProvinceCode } from "@/lib/locations/pakistan";
import { paymentOptions } from "./checkout-options";
import { OrderSummary } from "./OrderSummary";

const initialFields: CheckoutFormValues = {
  customerName: "",
  phone: "",
  email: "",
  province: "",
  city: "",
  otherCity: "",
  address: "",
  postalCode: "",
  landmark: "",
  addressType: "home",
  notes: "",
  consent: false,
  website: "",
};

const fieldDetails: Record<CheckoutFieldName, { id: string; label: string }> = {
  customerName: { id: "customer-name", label: "Full name" },
  phone: { id: "phone", label: "Pakistani phone number" },
  email: { id: "email", label: "Email" },
  province: { id: "province", label: "Province / territory" },
  city: { id: "city", label: "City" },
  otherCity: { id: "other-city", label: "Other city" },
  address: { id: "address", label: "Street address" },
  postalCode: { id: "postal-code", label: "Postal code" },
  landmark: { id: "landmark", label: "Landmark" },
  addressType: { id: "address-type-home", label: "Address type" },
  notes: { id: "notes", label: "Order notes" },
  consent: { id: "consent", label: "Consent" },
};

const fieldOrder = Object.keys(fieldDetails) as CheckoutFieldName[];
const kickerClass = "mb-2.5 mt-0 text-xs font-[1000] tracking-[.18em] text-[#087998]";
const stateClass = "mx-auto my-[clamp(20px,6vw,70px)] max-w-[780px] rounded-[20px] border border-[#d9e3ef] bg-white p-[clamp(34px,6vw,70px)] text-center shadow-[0_12px_35px_rgba(6,27,67,.08)] max-[560px]:px-5 max-[560px]:py-9 [&>h1]:m-0 [&>h1]:text-[clamp(46px,7vw,78px)] [&>h1]:leading-[.92] [&>h1]:tracking-[-.045em] [&>h1]:uppercase max-[560px]:[&>h1]:text-[42px] [&>p]:mx-auto [&>p]:mt-[18px] [&>p]:max-w-[620px] [&>p]:font-[700] [&>p]:leading-[1.65] [&>p]:text-[#486080]";
const primaryActionClass = "mt-7 inline-flex min-w-[210px] items-center justify-center rounded-full border-0 bg-lime px-6 py-[17px] text-center font-[1000] text-navy outline-offset-4 hover:bg-[#0bda8f] focus-visible:outline-4 focus-visible:outline-navy focus-visible:shadow-[0_0_0_7px_#fff]";
const formHeadingClass = "col-span-full flex items-start gap-3.5 border-b border-[#dce5f0] pb-[22px] max-[560px]:col-span-1 [&>span]:grid [&>span]:size-[38px] [&>span]:shrink-0 [&>span]:place-items-center [&>span]:rounded-full [&>span]:bg-navy [&>span]:text-xs [&>span]:font-[1000] [&>span]:text-white [&_h2]:m-0 [&_h2]:text-[clamp(25px,3vw,34px)] [&_h2]:leading-none [&_h2]:uppercase [&_p]:mb-0 [&_p]:mt-2 [&_p]:text-[13px] [&_p]:text-[#65758d]";
const fieldClass = "flex min-w-0 flex-col gap-2 [&>label]:text-[13px] [&>label]:font-[900] [&>label_span]:font-[600] [&>label_span]:text-[#6b7a90] [&>small]:text-xs [&>small]:leading-[1.45] [&>small]:text-[#687a91]";
const wideFieldClass = "col-span-full max-[560px]:col-span-1";
const controlClass = "w-full min-w-0 rounded-[10px] border-2 border-[#cfdbe9] bg-white px-3.5 py-[13px] leading-[1.35] text-ink outline-offset-2 transition-[border-color,box-shadow] duration-150 hover:border-[#99aec7] focus-visible:border-navy focus-visible:outline-[3px] focus-visible:outline-[#1672d8] invalid:focus:border-[#c8323e] aria-[invalid=true]:border-[#c8323e]";
const selectClass = `${controlClass} appearance-none bg-[linear-gradient(45deg,transparent_50%,#61738d_50%),linear-gradient(135deg,#61738d_50%,transparent_50%)] bg-[length:5px_5px] bg-[position:calc(100%_-_19px)_50%,calc(100%_-_14px)_50%] bg-no-repeat pr-[38px] disabled:cursor-not-allowed disabled:bg-[#f5f7fa] disabled:text-[#8794a6] disabled:hover:border-[#cfdbe9]`;
const fieldErrorClass = "text-xs font-[800] leading-[1.4] text-[#a21f2a]";

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
          province: fields.province,
          city: (fields.city === "Other city" ? fields.otherCity : fields.city).trim(),
          address: fields.address.trim(),
          postalCode: fields.postalCode.trim() || undefined,
          landmark: fields.landmark.trim() || undefined,
          addressType: fields.addressType,
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
  const cityOptions = fields.province ? citiesForProvince(fields.province) : [];

  if (orderNumber) {
    return (
      <section className={`${stateClass} relative max-w-[880px] overflow-hidden border-2 border-t-0 border-[#d4e1ed] p-[clamp(34px,5vw,62px)] shadow-[0_18px_50px_rgba(6,27,67,.12)] before:absolute before:inset-x-0 before:top-0 before:h-2 before:bg-[linear-gradient(90deg,#d9ff57,#5de9ff,#d9ff57)] before:content-[''] focus:outline-4 focus:outline-navy focus:outline-offset-[5px] max-[560px]:px-[18px] max-[560px]:pb-8 max-[560px]:pt-[38px] max-[560px]:[&>h1]:text-[42px] [&>h1]:text-[clamp(40px,6vw,66px)]`} aria-labelledby="checkout-success-title" aria-live="polite" role="status" tabIndex={-1} ref={successRef}>
        <div className="mx-auto mb-[21px] grid size-[72px] place-items-center rounded-full bg-[#e7fff5] text-[#078d62] shadow-[0_0_0_9px_#f3fffa] max-[560px]:size-[62px] [&_svg]:size-[38px] max-[560px]:[&_svg]:size-8" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><path d="m6.5 12.5 3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <p className={`${kickerClass} !mb-[15px] !text-[#087998]`}>THANK YOU FOR YOUR ORDER</p>
        <h1 id="checkout-success-title">Order confirmed</h1>
        <div className="mx-auto mb-[13px] mt-[26px] flex w-max max-w-full items-center justify-center gap-3.5 rounded-[13px] border-2 border-dashed border-[#a9bed3] bg-[#f5f9fd] px-[18px] py-[13px] text-[#526b89] max-[560px]:w-full max-[560px]:flex-col max-[560px]:gap-[5px] max-[560px]:px-3 [&_span]:text-[11px] [&_span]:font-[900] [&_span]:uppercase [&_span]:tracking-[.1em] [&_strong]:[overflow-wrap:anywhere] [&_strong]:text-[clamp(18px,3vw,25px)] [&_strong]:tracking-[.06em] [&_strong]:text-navy">
          <span>Order number</span>
          <strong>{orderNumber}</strong>
        </div>
        <div className="inline-flex items-center gap-[7px] rounded-full bg-[#e8fff6] px-[13px] py-2 text-[11px] font-[1000] uppercase tracking-[.05em] text-[#167354] [&_span]:text-xs [&_span]:text-[#0cc584]"><span aria-hidden="true">●</span> Cash on Delivery</div>
        <p className="!mt-[18px] !text-[15px]">We’ve received your order and will prepare it for delivery.</p>
        <ol className="mt-[30px] grid list-none grid-cols-3 gap-2.5 p-0 text-left max-[560px]:grid-cols-1 [&_li]:flex [&_li]:items-start [&_li]:gap-[11px] [&_li]:rounded-[13px] [&_li]:border [&_li]:border-[#dce6f0] [&_li]:bg-[#f9fbfd] [&_li]:p-4 max-[560px]:[&_li]:p-3.5 [&_li>span]:grid [&_li>span]:size-[27px] [&_li>span]:shrink-0 [&_li>span]:place-items-center [&_li>span]:rounded-full [&_li>span]:bg-navy [&_li>span]:text-[11px] [&_li>span]:font-[1000] [&_li>span]:text-white [&_strong]:block [&_strong]:text-[13px] [&_strong]:leading-[1.25] [&_small]:mt-[5px] [&_small]:block [&_small]:text-[11px] [&_small]:leading-[1.45] [&_small]:text-[#687b93]" aria-label="What happens next">
          <li><span>1</span><div><strong>Order received</strong><small>Your details have been saved securely.</small></div></li>
          <li><span>2</span><div><strong>We prepare your parcel</strong><small>Our team may contact you to confirm delivery.</small></div></li>
          <li><span>3</span><div><strong>Pay on delivery</strong><small>Pay the courier when your parcel arrives.</small></div></li>
        </ol>
        <div className="mt-[30px] flex flex-col items-center gap-[18px]">
          <Link href="/#featured" className={`${primaryActionClass} !mt-0`}>Continue shopping</Link>
          <a href="mailto:support@pixelsgalaxy.com" className="text-[13px] font-[850] text-[#075ebf] underline underline-offset-[3px] outline-offset-4 focus-visible:outline-[3px] focus-visible:outline-navy">Need help? Contact support</a>
        </div>
      </section>
    );
  }

  if (!isHydrated) {
    return (
      <section className={`${stateClass} min-h-[300px]`} aria-live="polite" aria-busy="true">
        <p className={`${kickerClass} !mb-[15px]`}>YOUR ORDER</p>
        <h1>Loading your cart…</h1>
        <p>Checking your saved items.</p>
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <section className={stateClass} aria-labelledby="empty-cart-title">
        <p className={`${kickerClass} !mb-[15px]`}>YOUR ORDER</p>
        <h1 id="empty-cart-title">Your cart is empty</h1>
        <p>Choose a Ku string colour before starting checkout.</p>
        <Link href="/#featured" className={primaryActionClass}>Shop Ku string</Link>
      </section>
    );
  }

  return (
    <>
      <div className="mb-9 max-w-[720px] max-[560px]:mb-[25px]">
        <p className={kickerClass}>CASH ON DELIVERY</p>
        <h1 className="m-0 text-[clamp(46px,7vw,78px)] leading-[.92] tracking-[-.045em] uppercase max-[560px]:text-[42px]">Checkout</h1>
        <p className="mb-0 mt-[18px] max-w-[620px] font-[700] leading-[1.65] text-[#486080]">Enter your delivery details. You will pay when your order arrives.</p>
      </div>
      <div className="grid grid-cols-[minmax(0,1.12fr)_minmax(340px,.78fr)] items-start gap-7 max-[820px]:grid-cols-1">
        <form className="relative grid grid-cols-2 gap-[22px] rounded-[20px] border border-[#d9e3ef] bg-white p-[clamp(24px,4vw,42px)] shadow-[0_12px_35px_rgba(6,27,67,.08)] max-[560px]:grid-cols-1 max-[560px]:gap-[18px] max-[560px]:px-[18px] max-[560px]:py-[22px]" onSubmit={handleSubmit} onInvalid={handleInvalid}>
          <div className={formHeadingClass}>
            <span>01</span>
            <div>
              <h2>Delivery address</h2>
              <p>Fields marked with * are required.</p>
            </div>
          </div>

          {hasErrors ? (
            <div className="col-span-full flex flex-col gap-[5px] rounded-[10px] border-2 border-[#c8323e] bg-[#fff2f3] px-4 py-3.5 leading-[1.4] text-[#83151f] focus:outline-[3px] focus:outline-[#c8323e] focus:outline-offset-3 max-[560px]:col-span-1 [&_a]:underline [&_a]:underline-offset-2 [&_a]:outline-offset-4 [&_a]:focus-visible:outline-[3px] [&_a]:focus-visible:outline-[#83151f] [&_strong]:text-sm [&>span]:text-[13px] [&_ul]:mt-[7px] [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-1.5 [&_ul]:pl-5 [&_ul]:text-[13px]" id="checkout-error" role="alert" aria-labelledby="checkout-error-title" tabIndex={-1} ref={errorRef}>
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

          <div className={`${fieldClass} ${wideFieldClass}`}>
            <label htmlFor="customer-name">Full name *</label>
            <input className={controlClass} id="customer-name" name="customerName" autoComplete="name" required maxLength={100} aria-invalid={fieldErrors.customerName ? true : undefined} aria-describedby={fieldErrors.customerName ? "customer-name-error" : undefined} value={fields.customerName} onChange={(event) => updateField("customerName", event.target.value)} />
            {fieldErrors.customerName ? <span className={fieldErrorClass} id="customer-name-error">{fieldErrors.customerName}</span> : null}
          </div>

          <div className={fieldClass}>
            <label htmlFor="phone">Pakistani phone number *</label>
            <input className={controlClass} id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required pattern="(?:03[0-9]{9}|[+]923[0-9]{9}|00923[0-9]{9})" title="Use 03XXXXXXXXX, +923XXXXXXXXX, or 00923XXXXXXXXX" placeholder="03XXXXXXXXX" aria-invalid={fieldErrors.phone ? true : undefined} aria-describedby={fieldErrors.phone ? "phone-hint phone-error" : "phone-hint"} value={fields.phone} onChange={(event) => updateField("phone", event.target.value)} />
            <small id="phone-hint">Use 03XXXXXXXXX, +923XXXXXXXXX, or 00923XXXXXXXXX.</small>
            {fieldErrors.phone ? <span className={fieldErrorClass} id="phone-error">{fieldErrors.phone}</span> : null}
          </div>

          <div className={fieldClass}>
            <label htmlFor="email">Email <span>(optional)</span></label>
            <input className={controlClass} id="email" name="email" type="email" inputMode="email" autoComplete="email" maxLength={254} aria-invalid={fieldErrors.email ? true : undefined} aria-describedby={fieldErrors.email ? "email-error" : undefined} value={fields.email} onChange={(event) => updateField("email", event.target.value)} />
            {fieldErrors.email ? <span className={fieldErrorClass} id="email-error">{fieldErrors.email}</span> : null}
          </div>

          <div className={`${fieldClass} ${wideFieldClass}`}>
            <label htmlFor="address">Street address *</label>
            <input className={controlClass} id="address" name="address" autoComplete="street-address" required maxLength={500} placeholder="e.g. House 12, Street 5, Block A" aria-invalid={fieldErrors.address ? true : undefined} aria-describedby={fieldErrors.address ? "address-error" : undefined} value={fields.address} onChange={(event) => updateField("address", event.target.value)} />
            {fieldErrors.address ? <span className={fieldErrorClass} id="address-error">{fieldErrors.address}</span> : null}
          </div>

          <div className={`${fieldClass} ${wideFieldClass}`}>
            <label htmlFor="province">Province / territory *</label>
            <select className={selectClass} id="province" name="province" autoComplete="address-level1" required aria-invalid={fieldErrors.province ? true : undefined} aria-describedby={fieldErrors.province ? "province-error" : undefined} value={fields.province} onChange={(event) => {
              const province = event.target.value as ProvinceCode | "";
              setFields((current) => ({ ...current, province, city: "", otherCity: "" }));
              setFieldErrors((current) => ({ ...current, province: undefined, city: undefined, otherCity: undefined }));
            }}>
              <option value="">Select province or territory</option>
              {pakistanProvinces.map((province) => <option key={province.code} value={province.code}>{province.name}</option>)}
            </select>
            {fieldErrors.province ? <span className={fieldErrorClass} id="province-error">{fieldErrors.province}</span> : null}
          </div>

          <div className={fieldClass}>
            <label htmlFor="city">City *</label>
            <select className={selectClass} id="city" name="city" autoComplete="address-level2" required disabled={!fields.province} aria-invalid={fieldErrors.city ? true : undefined} aria-describedby={fieldErrors.city ? "city-error" : undefined} value={fields.city} onChange={(event) => updateField("city", event.target.value)}>
              <option value="">{fields.province ? "Select city" : "Select province first"}</option>
              {cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
            {fieldErrors.city ? <span className={fieldErrorClass} id="city-error">{fieldErrors.city}</span> : null}
          </div>

          <div className={fieldClass}>
            <label htmlFor="postal-code">Postal code <span>(optional)</span></label>
            <input className={controlClass} id="postal-code" name="postalCode" inputMode="numeric" autoComplete="postal-code" maxLength={10} placeholder="e.g. 75500" aria-invalid={fieldErrors.postalCode ? true : undefined} aria-describedby={fieldErrors.postalCode ? "postal-code-error" : undefined} value={fields.postalCode} onChange={(event) => updateField("postalCode", event.target.value)} />
            {fieldErrors.postalCode ? <span className={fieldErrorClass} id="postal-code-error">{fieldErrors.postalCode}</span> : null}
          </div>

          {fields.city === "Other city" ? <div className={`${fieldClass} ${wideFieldClass}`}>
            <label htmlFor="other-city">Enter city *</label>
            <input className={controlClass} id="other-city" name="otherCity" maxLength={100} required aria-invalid={fieldErrors.otherCity ? true : undefined} aria-describedby={fieldErrors.otherCity ? "other-city-error" : undefined} value={fields.otherCity} onChange={(event) => updateField("otherCity", event.target.value)} />
            {fieldErrors.otherCity ? <span className={fieldErrorClass} id="other-city-error">{fieldErrors.otherCity}</span> : null}
          </div> : null}

          <div className={`${fieldClass} ${wideFieldClass}`}>
            <label htmlFor="landmark">Landmark <span>(optional)</span></label>
            <input className={controlClass} id="landmark" name="landmark" maxLength={200} placeholder="e.g. Near City Hospital" aria-invalid={fieldErrors.landmark ? true : undefined} aria-describedby={fieldErrors.landmark ? "landmark-error" : undefined} value={fields.landmark} onChange={(event) => updateField("landmark", event.target.value)} />
            {fieldErrors.landmark ? <span className={fieldErrorClass} id="landmark-error">{fieldErrors.landmark}</span> : null}
          </div>

          <fieldset className="col-span-full m-0 border-0 p-0 max-[560px]:col-span-1">
            <legend className="mb-2 text-[13px] font-[900]">Address type *</legend>
            <div className="flex flex-wrap gap-2.5">
              {(["home", "office"] as const).map((type) => <label key={type} className={`flex cursor-pointer items-center gap-2 rounded-full border-2 px-4 py-[9px] text-[13px] font-[850] ${fields.addressType === type ? "border-navy bg-[#eef5fd]" : "border-[#d3deea]"}`}>
                <input className="accent-navy outline-offset-2 focus-visible:outline-[3px] focus-visible:outline-[#1672d8]" id={`address-type-${type}`} type="radio" name="addressType" value={type} checked={fields.addressType === type} onChange={() => updateField("addressType", type)} />
                <span>{type === "home" ? "Home" : "Office"}</span>
              </label>)}
            </div>
            {fieldErrors.addressType ? <span className={fieldErrorClass}>{fieldErrors.addressType}</span> : null}
          </fieldset>

          <div className={`${fieldClass} ${wideFieldClass}`}>
            <label htmlFor="notes">Order notes <span>(optional)</span></label>
            <textarea className={`${controlClass} resize-y`} id="notes" name="notes" maxLength={1000} rows={3} placeholder="Delivery instructions or anything else we should know" aria-invalid={fieldErrors.notes ? true : undefined} aria-describedby={fieldErrors.notes ? "notes-error" : undefined} value={fields.notes} onChange={(event) => updateField("notes", event.target.value)} />
            {fieldErrors.notes ? <span className={fieldErrorClass} id="notes-error">{fieldErrors.notes}</span> : null}
          </div>

          <div className="absolute left-[-10000px] size-px overflow-hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" maxLength={0} value={fields.website} onChange={(event) => updateField("website", event.target.value)} />
          </div>

          <div className="col-span-full grid gap-[7px] max-[560px]:col-span-1">
            <label className="flex cursor-pointer items-start gap-[11px] rounded-[10px] bg-[#eef5fd] p-[15px] text-[13px] font-[700] leading-[1.5] text-[#334d70]" htmlFor="consent">
              <input className="mt-px size-[19px] shrink-0 accent-navy outline-offset-2 focus-visible:outline-[3px] focus-visible:outline-[#1672d8]" id="consent" type="checkbox" name="consent" required aria-invalid={fieldErrors.consent ? true : undefined} aria-describedby={fieldErrors.consent ? "consent-error" : undefined} checked={fields.consent} onChange={(event) => updateField("consent", event.target.checked)} />
              <span>I confirm these delivery details are correct and agree to be contacted about this order. *</span>
            </label>
            {fieldErrors.consent ? <span className={`${fieldErrorClass} pl-[15px]`} id="consent-error">{fieldErrors.consent}</span> : null}
          </div>

          <section className="col-span-full mt-1 grid gap-[18px] border-t border-[#dce5f0] pt-6 max-[560px]:col-span-1" aria-labelledby="payment-heading">
            <div className={`${formHeadingClass} !pb-[18px]`}>
              <span>02</span>
              <div><h2 id="payment-heading">Payment method</h2><p>Choose how you want to pay.</p></div>
            </div>
            <div className="grid gap-2.5">
              {paymentOptions.map((option) => <label key={option.id} className={`grid grid-cols-[auto_1fr_auto] items-center gap-[11px] rounded-[11px] border-2 px-4 py-[15px] text-[13px] font-[850] ${option.id === "cod" ? "border-[#0cae78] bg-[#effcf7]" : "border-[#d4dfeb]"}${option.disabled ? " cursor-not-allowed bg-[#f6f8fb] text-[#7d8999]" : ""}`}>
                <input className="m-0 size-[18px] accent-[#0cae78] outline-offset-2 focus-visible:outline-[3px] focus-visible:outline-[#1672d8]" type="radio" name="paymentMethod" checked={option.id === "cod"} disabled={option.disabled} readOnly />
                <span>{option.label}</span>
                {option.disabled ? <small className="rounded-full bg-[#e8edf3] px-[9px] py-[5px] text-[10px] font-[900] uppercase tracking-[.05em] text-[#66758a]">Coming soon</small> : null}
              </label>)}
            </div>
          </section>

          <button className="col-span-full inline-flex min-h-[54px] w-full cursor-pointer items-center justify-center rounded-full border-0 bg-lime px-6 py-[17px] text-center font-[1000] text-navy outline-offset-4 enabled:hover:bg-[#0bda8f] focus-visible:outline-4 focus-visible:outline-navy focus-visible:shadow-[0_0_0_7px_#fff] disabled:cursor-wait disabled:opacity-[.65] max-[560px]:col-span-1" type="submit" disabled={submitting}>
            {submitting ? "PLACING ORDER…" : "PLACE CASH ON DELIVERY ORDER"}
          </button>
        </form>
        <OrderSummary lines={lines} />
      </div>
    </>
  );
}
