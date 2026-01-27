import type { Compilation, Compiler, sources } from "webpack";

export type Asset = sources.Source;

export type MatcherFunction = (filename: string, asset: Asset) => boolean | Promise<boolean>;

export type Pattern = string | RegExp | MatcherFunction;

export interface Rule {
  label?: string;
  patterns: Pattern | Pattern[];
  test?: RegExp;
}

export interface PluginOptions {
  rules?: Rule[];
  debug?: boolean;
}

export interface ResolvedOptions {
  rules: Rule[];
  debug: boolean;
}

export type { Compilation, Compiler };
