import { describe, expect, it } from "vitest";

import sitemap from "./sitemap";

describe("public sitemap", () => {
  it("lists every indexable public page and excludes private routes", () => {
    expect(sitemap().map((entry) => entry.url)).toEqual([
      "https://pixelsgalaxy.com/",
      "https://pixelsgalaxy.com/faq",
      "https://pixelsgalaxy.com/policies/delivery",
      "https://pixelsgalaxy.com/policies/privacy",
      "https://pixelsgalaxy.com/policies/returns",
    ]);
  });
});
