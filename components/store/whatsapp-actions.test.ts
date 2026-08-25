import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CartProvider } from "../cart/CartProvider";
import { featuredProduct, products } from "../../lib/storefront/content";

import { ProductCard } from "./ProductCard";
import { PurchasePanel } from "./PurchasePanel";

function renderWithCart(component: ReactNode) {
  return renderToStaticMarkup(createElement(CartProvider, null, component));
}

function readOnlyLink(markup: string): URL {
  const match = markup.match(/href="(https:\/\/wa\.me\/[^"]+)"/);
  expect(match?.[1]).toBeDefined();
  return new URL(match![1]);
}

describe("storefront WhatsApp actions", () => {
  it("offers the featured product's selected bundle, quantity, and total", () => {
    const markup = renderWithCart(createElement(PurchasePanel, { product: featuredProduct }));
    const link = readOnlyLink(markup);

    expect(link.origin + link.pathname).toBe("https://wa.me/923324468116");
    expect(link.searchParams.get("text")).toBe(
      "Hi Pixels Galaxy! I want to order ZipString Original. Bundle: 1 ZIPSTRING. Quantity: 1. Total: Rs 8,999.",
    );
    expect(markup).toContain('aria-label="Buy ZipString Original on WhatsApp"');
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('rel="noopener noreferrer"');
    expect(markup).toContain("ADD TO CART");
  });

  it("offers a product card's default trusted price without replacing its action", () => {
    const product = products.find((candidate) => candidate.id === "zipstring-glow")!;
    const markup = renderWithCart(createElement(ProductCard, { product }));
    const link = readOnlyLink(markup);

    expect(link.searchParams.get("text")).toBe(
      "Hi Pixels Galaxy! I want to order ZipString Glow. Bundle: Standard. Quantity: 1. Total: Rs 6,999.",
    );
    expect(markup).toContain('aria-label="Buy ZipString Glow on WhatsApp"');
    expect(markup).toContain("ADD TO CART");
  });
});
