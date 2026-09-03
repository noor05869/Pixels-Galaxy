import { describe, expect, it } from "vitest";

import { paymentOptions } from "@/components/checkout/checkout-options";
import { citiesForProvince, pakistanProvinces, provinceNameForCode } from "@/lib/locations/pakistan";
import { validateCheckoutFields, type CheckoutFormValues } from "./checkout-validation";
import { parseCheckoutInput } from "./validation";

describe("Pakistan checkout flow", () => {
  it("collects a structured delivery address and enables only Cash on Delivery", () => {
    expect(pakistanProvinces).toHaveLength(7);
    expect(citiesForProvince("punjab")).toEqual(expect.arrayContaining(["Lahore", "Rawalpindi", "Faisalabad", "Other city"]));
    expect(citiesForProvince("sindh")).toEqual(expect.arrayContaining(["Karachi", "Hyderabad", "Other city"]));
    expect(pakistanProvinces.every((province) => province.cities.at(-1) === "Other city")).toBe(true);
    expect(provinceNameForCode("khyber-pakhtunkhwa")).toBe("Khyber Pakhtunkhwa");

    const fields: CheckoutFormValues = {
      customerName: "Ali Ahmed",
      phone: "03001234567",
      email: "ali@example.com",
      address: "House 12, Street 5, Block A",
      province: "punjab",
      city: "Other city",
      otherCity: "Sheikhupura",
      postalCode: "39350",
      landmark: "Near Central Market",
      addressType: "home",
      notes: "",
      consent: true,
      website: "",
    };

    expect(validateCheckoutFields(fields)).toEqual({});
    expect(validateCheckoutFields({ ...fields, province: "" }).province).toBe("Select your province or territory.");
    expect(validateCheckoutFields({ ...fields, otherCity: " " }).otherCity).toBe("Enter your city.");

    expect(parseCheckoutInput({
      customerName: fields.customerName,
      phone: fields.phone,
      email: fields.email,
      address: fields.address,
      province: fields.province,
      city: fields.otherCity,
      postalCode: fields.postalCode,
      landmark: fields.landmark,
      addressType: fields.addressType,
      notes: undefined,
      consent: true,
      website: "",
      expectedTotal: 199900,
      catalogueRevision: "test-revision",
      items: [{ productId: "ku-string", bundleId: "blue", quantity: 1 }],
    })).toMatchObject({
      province: "punjab",
      city: "Sheikhupura",
      postalCode: "39350",
      landmark: "Near Central Market",
      addressType: "home",
    });

    expect(paymentOptions).toEqual([
      { id: "cod", label: "Cash on Delivery", disabled: false },
      { id: "bank", label: "Bank Transfer", disabled: true },
      { id: "card", label: "Credit/Debit Card", disabled: true },
      { id: "raast", label: "RAAST", disabled: true },
    ]);
  });
});
