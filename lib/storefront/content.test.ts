import { describe, expect, it } from "vitest";

import { featuredProduct, products, siteContent, trustMetrics } from "./content";

describe("authoritative Ku string catalogue", () => {
  it("publishes the approved product identity, price, and colour variants", () => {
    expect(products).toHaveLength(1);
    expect(featuredProduct).toMatchObject({
      id: "ku-string",
      name: "Ku string",
      price: 199_900,
    });
    expect(featuredProduct.bundles).toEqual([
      expect.objectContaining({ id: "blue", label: "BLUE", quantity: 1, unitPrice: 199_900 }),
      expect.objectContaining({ id: "green", label: "GREEN", quantity: 1, unitPrice: 199_900 }),
      expect.objectContaining({ id: "pink", label: "PINK", quantity: 1, unitPrice: 199_900 }),
      expect.objectContaining({ id: "pick-any-two", label: "PICK ANY 2 COLOURS", quantity: 2, unitPrice: 175_000, compareAt: 199_900 }),
    ]);
    expect(featuredProduct.description).toContain("ages 3+");
  });

  it("uses only verified storefront claims", () => {
    expect(siteContent.announcement).toContain("FREE DELIVERY");
    expect(siteContent.press).toEqual(expect.arrayContaining(["502 PIECES IN STOCK", "AGES 3+", "3-DAY ISSUE REPORTING"]));
    expect(featuredProduct.benefits).toContainEqual({ title: "FREE DELIVERY", text: "Included with the two-piece bundle across Pakistan." });
    expect(trustMetrics.map((metric) => metric.value)).toEqual([
      "3 DAYS",
      "502",
      "PAKISTAN",
      "COD",
    ]);
  });

  it("answers the questions Pakistan shoppers need before ordering", () => {
    expect(siteContent).toMatchObject({
      seo: {
        heading: "Buy a String Shooter Toy in Pakistan",
        features: expect.arrayContaining([
          expect.objectContaining({ title: "Glow-in-the-dark flying string" }),
          expect.objectContaining({ title: "Cash on Delivery in Pakistan" }),
        ]),
        faqs: expect.arrayContaining([
          expect.objectContaining({ question: "What is a string shooter toy?" }),
          expect.objectContaining({ question: "How much is Ku String in Pakistan?" }),
          expect.objectContaining({ question: "Where does Pixels Galaxy deliver?" }),
        ]),
      },
    });
    expect(featuredProduct.description).toContain("glow-in-the-dark string shooter");
  });

  it("opens the product gallery with its demo video and retains the complete local photo set", () => {
    expect(featuredProduct.media.map(({ type, src, poster }) => ({ type, src, poster }))).toEqual([
      { type: "video", src: "/videos/v1.mp4", poster: "/photos/p-1.webp" },
      { type: "image", src: "/photos/p-1.webp", poster: undefined },
      { type: "image", src: "/photos/p-2.jpg", poster: undefined },
      { type: "image", src: "/photos/p-3.jpg", poster: undefined },
      { type: "image", src: "/photos/p-4.jpg", poster: undefined },
      { type: "image", src: "/photos/p-5.jpg", poster: undefined },
      { type: "image", src: "/photos/p-6.jpg", poster: undefined },
    ]);
  });
});
