import { describe, expect, it } from "vitest";

import { createOrderNumber } from "./order-number";

describe("createOrderNumber", () => {
  it("creates a six-character public order number", () => {
    expect(createOrderNumber()).toMatch(/^PG-[A-Z0-9]{6}$/);
  });

  it("does not use ambiguous characters", () => {
    expect(createOrderNumber()).not.toMatch(/[0O1I]/);
  });

  it("creates unique values across one thousand generated order numbers", () => {
    const orderNumbers = new Set(Array.from({ length: 1000 }, createOrderNumber));

    expect(orderNumbers).toHaveLength(1000);
  });
});
