import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { HeroSection } from "./HeroSection";

describe("HeroSection", () => {
  it("presents the two-piece offer with free Pakistan-wide delivery", () => {
    const markup = renderToStaticMarkup(createElement(HeroSection));

    expect(markup).toContain("MORE MAGIC, TOGETHER");
    expect(markup).toContain("PICK ANY 2");
    expect(markup).toContain("PKR 3,500");
    expect(markup).toContain("FREE DELIVERY");
    expect(markup).toContain("CHOOSE YOUR COLOURS");
    expect(markup).toContain('href="#featured"');
    expect(markup).toContain('ku-string-bundle-hero.png');
    expect(markup).not.toContain('main-banner-video.mp4');
  });
});
