import { describe, expect, it } from "vitest";

import { validateCheckoutFields } from "./checkout-validation";

const validFields = {
  customerName: "Ayesha Khan",
  phone: "03324468116",
  email: "ayesha@example.pk",
  city: "Lahore",
  address: "12 Main Boulevard",
  notes: "Call on arrival",
  consent: true,
  website: "",
};

describe("validateCheckoutFields", () => {
  it("rejects required text that is empty after trimming", () => {
    expect(validateCheckoutFields({
      ...validFields,
      customerName: "   ",
      city: "\t",
      address: "  \n ",
    })).toEqual({
      customerName: "Enter your full name.",
      city: "Enter your city.",
      address: "Enter your delivery address.",
    });
  });

  it("returns actionable errors for invalid contact details and consent", () => {
    expect(validateCheckoutFields({
      ...validFields,
      phone: "0321",
      email: "not-an-email",
      consent: false,
    })).toEqual({
      phone: "Use 03XXXXXXXXX or +923XXXXXXXXX.",
      email: "Enter a valid email address or leave this field blank.",
      consent: "Confirm your delivery details before placing the order.",
    });
  });

  it("accepts required text with surrounding whitespace", () => {
    expect(validateCheckoutFields({
      ...validFields,
      customerName: "  Ayesha Khan  ",
      city: "  Lahore ",
      address: "  12 Main Boulevard  ",
    })).toEqual({});
  });
});
