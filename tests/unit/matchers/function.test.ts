import { describe, expect, it } from "vitest";
import { createFunctionMatcher } from "../../../src/matchers/function";
import type { Asset, MatcherFunction } from "../../../src/types";

describe("createFunctionMatcher", () => {
  const mockAsset = {} as Asset;

  it("calls the provided function with filename and asset", () => {
    let calledWith: { filename: string; asset: Asset } | null = null;
    const fn: MatcherFunction = (filename, asset) => {
      calledWith = { filename, asset };
      return true;
    };

    const matcher = createFunctionMatcher(fn);
    matcher("test.js", mockAsset);

    expect(calledWith).toEqual({ filename: "test.js", asset: mockAsset });
  });

  it("returns sync function result", () => {
    const fn: MatcherFunction = (filename) => filename.includes("vendor");

    const matcher = createFunctionMatcher(fn);
    expect(matcher("vendor.js", mockAsset)).toBe(true);
    expect(matcher("main.js", mockAsset)).toBe(false);
  });

  it("returns async function result", async () => {
    const fn: MatcherFunction = async (filename) => {
      return filename.endsWith(".map");
    };

    const matcher = createFunctionMatcher(fn);
    expect(await matcher("main.js.map", mockAsset)).toBe(true);
    expect(await matcher("main.js", mockAsset)).toBe(false);
  });

  it("supports complex filtering logic", () => {
    const fn: MatcherFunction = (filename) => {
      return filename.startsWith("chunk-") && filename.endsWith(".js");
    };

    const matcher = createFunctionMatcher(fn);
    expect(matcher("chunk-vendors.js", mockAsset)).toBe(true);
    expect(matcher("chunk-main.js", mockAsset)).toBe(true);
    expect(matcher("main.js", mockAsset)).toBe(false);
    expect(matcher("chunk-vendors.css", mockAsset)).toBe(false);
  });
});
