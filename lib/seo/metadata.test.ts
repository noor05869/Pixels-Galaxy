import { describe, expect, it } from "vitest";

import { rootMetadata } from "./metadata";

describe("root search and social metadata", () => {
  it("publishes current Pixels Galaxy branding without coming-soon copy", () => {
    expect(rootMetadata.title).toMatchObject({
      default: "Pixels Galaxy | Ku String Toys in Pakistan",
    });
    expect(JSON.stringify(rootMetadata).toLowerCase()).not.toContain("coming soon");
    expect(rootMetadata.icons).toMatchObject({ icon: "/brand/pixels-galaxy-icon.jpg" });
  });

  it("uses a large branded image for Open Graph and Twitter previews", () => {
    expect(rootMetadata.openGraph).toMatchObject({
      title: "Pixels Galaxy | Ku String Toys in Pakistan",
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    });
    expect(rootMetadata.twitter).toMatchObject({
      card: "summary_large_image",
      images: ["/opengraph-image"],
    });
  });
});
