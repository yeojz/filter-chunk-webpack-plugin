import { describe, expect, it } from "vitest";
import { createMatcher, createRuleMatcher } from "../../../src/matchers";
import type { Asset, Rule } from "../../../src/types";

describe("createMatcher", () => {
  const mockAsset = {} as Asset;

  it("creates matcher for glob string", () => {
    const matcher = createMatcher("*.map");
    expect(matcher("main.js.map", mockAsset)).toBe(true);
    expect(matcher("main.js", mockAsset)).toBe(false);
  });

  it("creates matcher for regex", () => {
    const matcher = createMatcher(/\.map$/);
    expect(matcher("main.js.map", mockAsset)).toBe(true);
    expect(matcher("main.js", mockAsset)).toBe(false);
  });

  it("creates matcher for function", () => {
    const matcher = createMatcher((name) => name.includes("vendor"));
    expect(matcher("vendor.js", mockAsset)).toBe(true);
    expect(matcher("main.js", mockAsset)).toBe(false);
  });

  it("throws for invalid pattern type", () => {
    expect(() => createMatcher(123 as unknown as string)).toThrow("Invalid pattern type");
  });
});

describe("createRuleMatcher", () => {
  const mockAsset = {} as Asset;

  it("matches single pattern", async () => {
    const rule: Rule = { patterns: "*.map" };
    const matcher = createRuleMatcher(rule);

    expect(await matcher("main.js.map", mockAsset)).toBe(true);
    expect(await matcher("main.js", mockAsset)).toBe(false);
  });

  it("matches any of multiple patterns (OR logic)", async () => {
    const rule: Rule = { patterns: ["*.map", "*.txt"] };
    const matcher = createRuleMatcher(rule);

    expect(await matcher("main.js.map", mockAsset)).toBe(true);
    expect(await matcher("readme.txt", mockAsset)).toBe(true);
    expect(await matcher("main.js", mockAsset)).toBe(false);
  });

  it("respects test option to scope matching", async () => {
    const rule: Rule = { patterns: "*.map", test: /^async-/ };
    const matcher = createRuleMatcher(rule);

    expect(await matcher("async-chunk.js.map", mockAsset)).toBe(true);
    expect(await matcher("main.js.map", mockAsset)).toBe(false);
  });

  it("supports mixed pattern types", async () => {
    const rule: Rule = {
      patterns: ["*.map", /\.LICENSE\.txt$/, (name) => name.includes("hot-update")],
    };
    const matcher = createRuleMatcher(rule);

    expect(await matcher("main.js.map", mockAsset)).toBe(true);
    expect(await matcher("vendor.LICENSE.txt", mockAsset)).toBe(true);
    expect(await matcher("main.hot-update.js", mockAsset)).toBe(true);
    expect(await matcher("main.js", mockAsset)).toBe(false);
  });
});
