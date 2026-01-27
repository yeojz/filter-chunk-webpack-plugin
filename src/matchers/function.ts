import type { Asset, MatcherFunction } from "../types";

export function createFunctionMatcher(
  fn: MatcherFunction
): (filename: string, asset: Asset) => boolean | Promise<boolean> {
  return (filename: string, asset: Asset) => fn(filename, asset);
}
