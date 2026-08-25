export type CheckoutFormValues = {
  customerName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  notes: string;
  consent: boolean;
  website: string;
};

export type CheckoutFieldName = Exclude<keyof CheckoutFormValues, "website">;
export type CheckoutErrors = Partial<Record<CheckoutFieldName, string>>;

const pakistanPhone = /^(?:03\d{9}|\+923\d{9})$/;
const emailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCheckoutFields(fields: CheckoutFormValues): CheckoutErrors {
  const errors: CheckoutErrors = {};
  const customerName = fields.customerName.trim();
  const phone = fields.phone.trim();
  const email = fields.email.trim();
  const city = fields.city.trim();
  const address = fields.address.trim();
  const notes = fields.notes.trim();

  if (!customerName) errors.customerName = "Enter your full name.";
  else if (customerName.length > 100) errors.customerName = "Full name must be 100 characters or fewer.";

  if (!phone) errors.phone = "Enter a Pakistani phone number.";
  else if (!pakistanPhone.test(phone)) errors.phone = "Use 03XXXXXXXXX or +923XXXXXXXXX.";

  if (email.length > 254) errors.email = "Email must be 254 characters or fewer.";
  else if (email && !emailAddress.test(email)) errors.email = "Enter a valid email address or leave this field blank.";

  if (!city) errors.city = "Enter your city.";
  else if (city.length > 100) errors.city = "City must be 100 characters or fewer.";

  if (!address) errors.address = "Enter your delivery address.";
  else if (address.length > 500) errors.address = "Delivery address must be 500 characters or fewer.";

  if (notes.length > 1000) errors.notes = "Order notes must be 1,000 characters or fewer.";
  if (!fields.consent) errors.consent = "Confirm your delivery details before placing the order.";

  return errors;
}
