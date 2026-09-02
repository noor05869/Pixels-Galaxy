import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

describe("Night Lab theme contrast", () => {
  it("uses the logo cyan for text on dark supporting sections", () => {
    expect(css).toContain("--logo-cyan:#48ded8");
    expect(css).toContain(".social-feed h2,.social-feed h2 em{color:var(--logo-cyan)}");
    expect(css).toContain(".awards-marquee{color:var(--logo-cyan)}");
    expect(css).toContain("footer{color:var(--logo-cyan)}");
    expect(css).toContain(".story em{color:var(--logo-cyan)}");
  });
});
