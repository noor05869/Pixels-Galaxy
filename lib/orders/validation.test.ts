import { describe, expect, it } from "vitest";

import { parseCheckoutInput } from "./validation";
import { CATALOGUE_REVISION } from "./pricing";

const validInput = {
  customerName: "  Ayesha Khan  ",
  phone: "03324468116",
  email: "  ayesha@example.com  ",
  city: "  Lahore  ",
  address: "  House 42, Main Street  ",
  notes: "  Please call before delivery.  ",
  consent: true,
  website: "",
  expectedTotal: 899900,
  catalogueRevision: CATALOGUE_REVISION,
  items: [{ productId: "zipstring-original", bundleId: "one", quantity: 1 }],
};

describe("parseCheckoutInput", () => {
  it("accepts a valid Pakistani phone number and trims customer text", () => {
    expect(parseCheckoutInput(validInput)).toMatchObject({
      customerName: "Ayesha Khan",
      phone: "03324468116",
      email: "ayesha@example.com",
      city: "Lahore",
      address: "House 42, Main Street",
      notes: "Please call before delivery.",
    });
  });

  it("accepts a Pakistani phone number in international format", () => {
    expect(parseCheckoutInput({ ...validInput, phone: "+923324468116" }).phone).toBe("03324468116");
  });

  it("canonicalizes local and 0092 Pakistani phone formats", () => {
    expect(parseCheckoutInput({ ...validInput, phone: "00923324468116" }).phone).toBe("03324468116");
    expect(parseCheckoutInput(validInput).phone).toBe("03324468116");
  });

  it("normalizes empty optional text to undefined", () => {
    expect(parseCheckoutInput({ ...validInput, email: "  ", notes: "  ", website: "  " })).toMatchObject({
      email: undefined,
      notes: undefined,
      website: undefined,
    });
  });

  it.each([
    ["an empty customer name", { customerName: " " }],
    ["an invalid phone number", { phone: "0300123456" }],
    ["an invalid email address", { email: "not-an-email" }],
    ["a missing city", { city: " " }],
    ["a missing address", { address: " " }],
    ["missing consent", { consent: false }],
    ["a populated honeypot", { website: "spam" }],
    ["more than 20 cart lines", { items: Array.from({ length: 21 }, () => ({ productId: "zipstring-original", bundleId: "one", quantity: 1 })) }],
    ["a quantity below one", { items: [{ productId: "zipstring-original", bundleId: "one", quantity: 0 }] }],
    ["a quantity above 99", { items: [{ productId: "zipstring-original", bundleId: "one", quantity: 100 }] }],
    ["oversized notes", { notes: "n".repeat(1001) }],
    ["a missing expected total", { expectedTotal: undefined }],
    ["a missing catalogue revision", { catalogueRevision: undefined }],
  ])("rejects %s", (_reason, invalidFields) => {
    expect(() => parseCheckoutInput({ ...validInput, ...invalidFields })).toThrow();
  });
});
