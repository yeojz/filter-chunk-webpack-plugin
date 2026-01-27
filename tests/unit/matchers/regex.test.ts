import { describe, expect, it } from "vitest";
import { createRegexMatcher } from "../../../src/matchers/regex";

describe("createRegexMatcher", () => {
  it("matches file extension pattern", () => {
    const matcher = createRegexMatcher(/\.map$/);
    expect(matcher("main.js.map")).toBe(true);
    expect(matcher("styles.css.map")).toBe(true);
    expect(matcher("main.js")).toBe(false);
  });

  it("matches LICENSE files", () => {
    const matcher = createRegexMatcher(/\.LICENSE\.txt$/);
    expect(matcher("vendor.js.LICENSE.txt")).toBe(true);
    expect(matcher("main.LICENSE.txt")).toBe(true);
    expect(matcher("LICENSE.txt")).toBe(false);
  });

  it("respects case sensitivity", () => {
    const matcher = createRegexMatcher(/\.MAP$/);
    expect(matcher("main.js.MAP")).toBe(true);
    expect(matcher("main.js.map")).toBe(false);
  });

  it("supports case insensitive flag", () => {
    const matcher = createRegexMatcher(/\.map$/i);
    expect(matcher("main.js.map")).toBe(true);
    expect(matcher("main.js.MAP")).toBe(true);
  });

  it("matches partial filename", () => {
    const matcher = createRegexMatcher(/vendor/);
    expect(matcher("vendor.js")).toBe(true);
    expect(matcher("chunk-vendors.js")).toBe(true);
    expect(matcher("main.js")).toBe(false);
  });
});
