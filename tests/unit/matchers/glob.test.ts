import { describe, expect, it } from "vitest";
import { createGlobMatcher } from "../../../src/matchers/glob";

describe("createGlobMatcher", () => {
  it("matches simple wildcard pattern", () => {
    const matcher = createGlobMatcher("*.map");
    expect(matcher("main.js.map")).toBe(true);
    expect(matcher("styles.css.map")).toBe(true);
    expect(matcher("main.js")).toBe(false);
  });

  it("matches double wildcard pattern", () => {
    const matcher = createGlobMatcher("**/*.map");
    expect(matcher("main.js.map")).toBe(true);
    expect(matcher("assets/styles.css.map")).toBe(true);
    expect(matcher("deep/nested/file.map")).toBe(true);
    expect(matcher("main.js")).toBe(false);
  });

  it("matches specific file extension", () => {
    const matcher = createGlobMatcher("*.js");
    expect(matcher("main.js")).toBe(true);
    expect(matcher("vendor.js")).toBe(true);
    expect(matcher("main.js.map")).toBe(false);
    expect(matcher("styles.css")).toBe(false);
  });

  it("matches brace expansion", () => {
    const matcher = createGlobMatcher("*.{js,css}");
    expect(matcher("main.js")).toBe(true);
    expect(matcher("styles.css")).toBe(true);
    expect(matcher("image.png")).toBe(false);
  });

  it("matches character class", () => {
    const matcher = createGlobMatcher("chunk-[0-9].js");
    expect(matcher("chunk-0.js")).toBe(true);
    expect(matcher("chunk-9.js")).toBe(true);
    expect(matcher("chunk-a.js")).toBe(false);
  });
});
