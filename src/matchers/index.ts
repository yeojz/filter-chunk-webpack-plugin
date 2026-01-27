import type { Asset, MatcherFunction, Pattern, Rule } from "../types";
import { createFunctionMatcher } from "./function";
import { createGlobMatcher } from "./glob";
import { createRegexMatcher } from "./regex";

type Matcher = (filename: string, asset: Asset) => boolean | Promise<boolean>;

export function createMatcher(pattern: Pattern): Matcher {
  if (typeof pattern === "string") {
    const globMatcher = createGlobMatcher(pattern);
    return (filename: string) => globMatcher(filename);
  }

  if (pattern instanceof RegExp) {
    const regexMatcher = createRegexMatcher(pattern);
    return (filename: string) => regexMatcher(filename);
  }

  if (typeof pattern === "function") {
    return createFunctionMatcher(pattern as MatcherFunction);
  }

  throw new Error(`Invalid pattern type: ${typeof pattern}`);
}

export function createRuleMatcher(rule: Rule): Matcher {
  const patterns = Array.isArray(rule.patterns) ? rule.patterns : [rule.patterns];
  const matchers = patterns.map(createMatcher);

  return async (filename: string, asset: Asset): Promise<boolean> => {
    if (rule.test && !rule.test.test(filename)) {
      return false;
    }

    for (const matcher of matchers) {
      if (await matcher(filename, asset)) {
        return true;
      }
    }
    return false;
  };
}
