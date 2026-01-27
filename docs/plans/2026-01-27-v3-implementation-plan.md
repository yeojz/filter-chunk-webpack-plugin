# filter-chunk-webpack-plugin v3.0.0 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Modernize the webpack plugin from ground up with TypeScript, webpack 5, and enhanced features.

**Architecture:** Rule-based filtering pipeline using picomatch for globs, with support for regex and custom functions. Async hooks for webpack 5 compatibility. Dual ESM/CJS output via tsup.

**Tech Stack:** TypeScript 5, webpack 5, Vitest, Turbo, Biome, tsup, picomatch

---

## Task 1: Clean Slate - Remove Old Source Files

**Files:**
- Delete: `src/index.js`
- Delete: `src/index.spec.js`
- Delete: `src/usage.spec.js`

**Step 1: Remove old source files**

```bash
rm -f src/index.js src/index.spec.js src/usage.spec.js
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove old v2 source files"
```

---

## Task 2: Setup package.json

**Files:**
- Modify: `package.json`

**Step 1: Replace package.json with new configuration**

```json
{
  "name": "filter-chunk-webpack-plugin",
  "version": "3.0.0-alpha.0",
  "description": "Webpack plugin that filters chunks from output",
  "type": "module",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist"
  ],
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "biome check src tests",
    "lint:fix": "biome check --write src tests",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist coverage .turbo"
  },
  "peerDependencies": {
    "webpack": "^5.0.0"
  },
  "dependencies": {
    "picomatch": "^4.0.2"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "@types/node": "^22.10.7",
    "@types/picomatch": "^3.0.1",
    "css-loader": "^7.1.2",
    "css-minimizer-webpack-plugin": "^7.0.0",
    "mini-css-extract-plugin": "^2.9.2",
    "tsup": "^8.3.5",
    "turbo": "^2.3.4",
    "typescript": "^5.7.3",
    "vitest": "^2.1.8",
    "webpack": "^5.97.1"
  },
  "keywords": [
    "webpack",
    "plugin",
    "filter",
    "chunk",
    "assets"
  ],
  "author": "Gerald Yeo <contact@fusedthought.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/yeojz/filter-chunk-webpack-plugin.git"
  },
  "bugs": {
    "url": "https://github.com/yeojz/filter-chunk-webpack-plugin/issues"
  },
  "homepage": "https://github.com/yeojz/filter-chunk-webpack-plugin#readme"
}
```

**Step 2: Commit**

```bash
git add package.json
git commit -m "chore: update package.json for v3"
```

---

## Task 3: Setup TypeScript Configuration

**Files:**
- Create: `tsconfig.json`

**Step 1: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["node"],
    "noEmit": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests", "fixtures"]
}
```

**Step 2: Commit**

```bash
git add tsconfig.json
git commit -m "chore: add TypeScript configuration"
```

---

## Task 4: Setup tsup Configuration

**Files:**
- Create: `tsup.config.ts`

**Step 1: Create tsup.config.ts**

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".js" : ".cjs",
  }),
});
```

**Step 2: Commit**

```bash
git add tsup.config.ts
git commit -m "chore: add tsup build configuration"
```

---

## Task 5: Setup Biome Configuration

**Files:**
- Create: `biome.json`
- Delete: `.eslintrc.json`

**Step 1: Create biome.json**

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "semicolons": "always"
    }
  }
}
```

**Step 2: Remove old ESLint config**

```bash
rm -f .eslintrc.json
```

**Step 3: Commit**

```bash
git add biome.json
git add -A
git commit -m "chore: replace ESLint with Biome"
```

---

## Task 6: Setup Vitest Configuration

**Files:**
- Create: `vitest.config.ts`

**Step 1: Create vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts"],
    },
  },
});
```

**Step 2: Commit**

```bash
git add vitest.config.ts
git commit -m "chore: add Vitest configuration"
```

---

## Task 7: Setup Turbo Configuration

**Files:**
- Create: `turbo.json`

**Step 1: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["build"]
    }
  }
}
```

**Step 2: Commit**

```bash
git add turbo.json
git commit -m "chore: add Turbo task configuration"
```

---

## Task 8: Update .gitignore

**Files:**
- Modify: `.gitignore`

**Step 1: Replace .gitignore content**

```
# Dependencies
node_modules/

# Build output
dist/

# Test output
coverage/
.spec_output/

# Turbo
.turbo/

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Misc
.env
.env.local
```

**Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: update .gitignore for v3 tooling"
```

---

## Task 9: Install Dependencies

**Step 1: Remove old lock file and node_modules**

```bash
rm -rf node_modules package-lock.json yarn.lock
```

**Step 2: Install dependencies**

```bash
npm install
```

**Step 3: Verify installation**

```bash
npm ls --depth=0
```

Expected: All packages listed without errors

**Step 4: Commit lock file**

```bash
git add package-lock.json
git commit -m "chore: install v3 dependencies"
```

---

## Task 10: Create Types

**Files:**
- Create: `src/types.ts`

**Step 1: Create src/types.ts**

```ts
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
```

**Step 2: Commit**

```bash
git add src/types.ts
git commit -m "feat: add TypeScript type definitions"
```

---

## Task 11: Write Glob Matcher Tests

**Files:**
- Create: `tests/unit/matchers/glob.test.ts`

**Step 1: Create test file**

```ts
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
```

**Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/matchers/glob.test.ts
```

Expected: FAIL - Cannot find module '../../../src/matchers/glob'

**Step 3: Commit failing test**

```bash
mkdir -p tests/unit/matchers
git add tests/unit/matchers/glob.test.ts
git commit -m "test: add glob matcher unit tests (red)"
```

---

## Task 12: Implement Glob Matcher

**Files:**
- Create: `src/matchers/glob.ts`

**Step 1: Create src/matchers/glob.ts**

```ts
import picomatch from "picomatch";

export function createGlobMatcher(pattern: string): (filename: string) => boolean {
  const isMatch = picomatch(pattern);
  return (filename: string) => isMatch(filename);
}
```

**Step 2: Run test to verify it passes**

```bash
npm test -- tests/unit/matchers/glob.test.ts
```

Expected: PASS - All tests pass

**Step 3: Commit**

```bash
mkdir -p src/matchers
git add src/matchers/glob.ts
git commit -m "feat: implement glob matcher (green)"
```

---

## Task 13: Write Regex Matcher Tests

**Files:**
- Create: `tests/unit/matchers/regex.test.ts`

**Step 1: Create test file**

```ts
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
```

**Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/matchers/regex.test.ts
```

Expected: FAIL - Cannot find module '../../../src/matchers/regex'

**Step 3: Commit failing test**

```bash
git add tests/unit/matchers/regex.test.ts
git commit -m "test: add regex matcher unit tests (red)"
```

---

## Task 14: Implement Regex Matcher

**Files:**
- Create: `src/matchers/regex.ts`

**Step 1: Create src/matchers/regex.ts**

```ts
export function createRegexMatcher(pattern: RegExp): (filename: string) => boolean {
  return (filename: string) => pattern.test(filename);
}
```

**Step 2: Run test to verify it passes**

```bash
npm test -- tests/unit/matchers/regex.test.ts
```

Expected: PASS - All tests pass

**Step 3: Commit**

```bash
git add src/matchers/regex.ts
git commit -m "feat: implement regex matcher (green)"
```

---

## Task 15: Write Function Matcher Tests

**Files:**
- Create: `tests/unit/matchers/function.test.ts`

**Step 1: Create test file**

```ts
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
```

**Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/matchers/function.test.ts
```

Expected: FAIL - Cannot find module '../../../src/matchers/function'

**Step 3: Commit failing test**

```bash
git add tests/unit/matchers/function.test.ts
git commit -m "test: add function matcher unit tests (red)"
```

---

## Task 16: Implement Function Matcher

**Files:**
- Create: `src/matchers/function.ts`

**Step 1: Create src/matchers/function.ts**

```ts
import type { Asset, MatcherFunction } from "../types";

export function createFunctionMatcher(
  fn: MatcherFunction
): (filename: string, asset: Asset) => boolean | Promise<boolean> {
  return (filename: string, asset: Asset) => fn(filename, asset);
}
```

**Step 2: Run test to verify it passes**

```bash
npm test -- tests/unit/matchers/function.test.ts
```

Expected: PASS - All tests pass

**Step 3: Commit**

```bash
git add src/matchers/function.ts
git commit -m "feat: implement function matcher (green)"
```

---

## Task 17: Write Matcher Factory Tests

**Files:**
- Create: `tests/unit/matchers/index.test.ts`

**Step 1: Create test file**

```ts
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
```

**Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/matchers/index.test.ts
```

Expected: FAIL - Cannot find module '../../../src/matchers'

**Step 3: Commit failing test**

```bash
git add tests/unit/matchers/index.test.ts
git commit -m "test: add matcher factory unit tests (red)"
```

---

## Task 18: Implement Matcher Factory

**Files:**
- Create: `src/matchers/index.ts`

**Step 1: Create src/matchers/index.ts**

```ts
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
```

**Step 2: Run test to verify it passes**

```bash
npm test -- tests/unit/matchers/index.test.ts
```

Expected: PASS - All tests pass

**Step 3: Commit**

```bash
git add src/matchers/index.ts
git commit -m "feat: implement matcher factory (green)"
```

---

## Task 19: Write Logger Tests

**Files:**
- Create: `tests/unit/logger.test.ts`

**Step 1: Create test file**

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Logger } from "../../src/logger";

describe("Logger", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("filtered", () => {
    it("does not log when debug is false", () => {
      const logger = new Logger(false);
      logger.filtered("main.js.map", "sourcemaps");

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("logs with label when debug is true", () => {
      const logger = new Logger(true);
      logger.filtered("main.js.map", "sourcemaps");

      expect(consoleSpy).toHaveBeenCalledWith("[FilterChunk] Filtered: main.js.map (label: sourcemaps)");
    });

    it("logs with index fallback when no label", () => {
      const logger = new Logger(true);
      logger.filtered("main.js.map", "[0]");

      expect(consoleSpy).toHaveBeenCalledWith("[FilterChunk] Filtered: main.js.map (label: [0])");
    });
  });

  describe("summary", () => {
    it("does not log summary when debug is false and no webpack logger", () => {
      const logger = new Logger(false);
      logger.summary(5, 2);

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("logs summary when debug is true", () => {
      const logger = new Logger(true);
      logger.filtered("a.map", "maps");
      logger.filtered("b.map", "maps");
      logger.summary(5, 2);

      expect(consoleSpy).toHaveBeenCalledWith("[FilterChunk] Filtered 2 of 5 assets (3 remaining)");
    });

    it("logs grouped files by label when debug is true", () => {
      const logger = new Logger(true);
      logger.filtered("a.map", "sourcemaps");
      logger.filtered("b.map", "sourcemaps");
      logger.filtered("c.LICENSE.txt", "licenses");
      logger.summary(5, 3);

      expect(consoleSpy).toHaveBeenCalledWith("[FilterChunk] Filtered assets:");
      expect(consoleSpy).toHaveBeenCalledWith("  sourcemaps:");
      expect(consoleSpy).toHaveBeenCalledWith("    - a.map");
      expect(consoleSpy).toHaveBeenCalledWith("    - b.map");
      expect(consoleSpy).toHaveBeenCalledWith("  licenses:");
      expect(consoleSpy).toHaveBeenCalledWith("    - c.LICENSE.txt");
    });
  });

  describe("webpack logger integration", () => {
    it("logs to webpack logger when provided", () => {
      const webpackLogger = {
        info: vi.fn(),
      };
      const logger = new Logger(false);
      logger.setWebpackLogger(webpackLogger as unknown as ReturnType<typeof Logger.prototype.setWebpackLogger>);
      logger.summary(5, 2);

      expect(webpackLogger.info).toHaveBeenCalledWith("Filtered 2 of 5 assets (3 remaining)");
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/logger.test.ts
```

Expected: FAIL - Cannot find module '../../src/logger'

**Step 3: Commit failing test**

```bash
mkdir -p tests/unit
git add tests/unit/logger.test.ts
git commit -m "test: add logger unit tests (red)"
```

---

## Task 20: Implement Logger

**Files:**
- Create: `src/logger.ts`

**Step 1: Create src/logger.ts**

```ts
interface WebpackLogger {
  info(message: string): void;
}

interface FilteredEntry {
  filename: string;
  label: string;
}

export class Logger {
  private debug: boolean;
  private webpackLogger: WebpackLogger | null = null;
  private filteredEntries: FilteredEntry[] = [];

  constructor(debug: boolean) {
    this.debug = debug;
  }

  setWebpackLogger(logger: WebpackLogger): void {
    this.webpackLogger = logger;
  }

  filtered(filename: string, label: string): void {
    this.filteredEntries.push({ filename, label });

    if (this.debug) {
      console.log(`[FilterChunk] Filtered: ${filename} (label: ${label})`);
    }
  }

  summary(total: number, removed: number): void {
    const kept = total - removed;
    const message = `Filtered ${removed} of ${total} assets (${kept} remaining)`;

    if (this.webpackLogger) {
      this.webpackLogger.info(message);
    }

    if (this.debug) {
      console.log(`[FilterChunk] ${message}`);

      if (this.filteredEntries.length > 0) {
        console.log("[FilterChunk] Filtered assets:");

        const grouped = this.groupByLabel();
        for (const [label, files] of Object.entries(grouped)) {
          console.log(`  ${label}:`);
          for (const file of files) {
            console.log(`    - ${file}`);
          }
        }
      }
    }
  }

  private groupByLabel(): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};
    for (const entry of this.filteredEntries) {
      if (!grouped[entry.label]) {
        grouped[entry.label] = [];
      }
      grouped[entry.label].push(entry.filename);
    }
    return grouped;
  }
}
```

**Step 2: Run test to verify it passes**

```bash
npm test -- tests/unit/logger.test.ts
```

Expected: PASS - All tests pass

**Step 3: Commit**

```bash
git add src/logger.ts
git commit -m "feat: implement logger with debug and webpack stats support (green)"
```

---

## Task 21: Write Plugin Unit Tests

**Files:**
- Create: `tests/unit/plugin.test.ts`

**Step 1: Create test file**

```ts
import { describe, expect, it } from "vitest";
import { FilterChunkWebpackPlugin } from "../../src/plugin";

describe("FilterChunkWebpackPlugin", () => {
  describe("constructor", () => {
    it("creates plugin with default options", () => {
      const plugin = new FilterChunkWebpackPlugin();
      expect(plugin).toBeInstanceOf(FilterChunkWebpackPlugin);
    });

    it("creates plugin with custom rules", () => {
      const plugin = new FilterChunkWebpackPlugin({
        rules: [{ patterns: "*.map" }],
      });
      expect(plugin).toBeInstanceOf(FilterChunkWebpackPlugin);
    });

    it("creates plugin with debug enabled", () => {
      const plugin = new FilterChunkWebpackPlugin({
        debug: true,
      });
      expect(plugin).toBeInstanceOf(FilterChunkWebpackPlugin);
    });

    it("throws if rules is not an array", () => {
      expect(() => {
        new FilterChunkWebpackPlugin({
          rules: "*.map" as unknown as [],
        });
      }).toThrow("rules must be an array");
    });

    it("throws if rule patterns is missing", () => {
      expect(() => {
        new FilterChunkWebpackPlugin({
          rules: [{}] as unknown as [],
        });
      }).toThrow("each rule must have patterns");
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/plugin.test.ts
```

Expected: FAIL - Cannot find module '../../src/plugin'

**Step 3: Commit failing test**

```bash
git add tests/unit/plugin.test.ts
git commit -m "test: add plugin constructor unit tests (red)"
```

---

## Task 22: Implement Plugin Class

**Files:**
- Create: `src/plugin.ts`

**Step 1: Create src/plugin.ts**

```ts
import type { Compilation, Compiler, PluginOptions, ResolvedOptions, Rule } from "./types";
import { Logger } from "./logger";
import { createRuleMatcher } from "./matchers";

const PLUGIN_NAME = "FilterChunkWebpackPlugin";

function resolveOptions(options: PluginOptions): ResolvedOptions {
  if (options.rules !== undefined && !Array.isArray(options.rules)) {
    throw new Error("rules must be an array");
  }

  if (options.rules) {
    for (const rule of options.rules) {
      if (!rule.patterns) {
        throw new Error("each rule must have patterns");
      }
    }
  }

  return {
    rules: options.rules ?? [],
    debug: options.debug ?? false,
  };
}

export class FilterChunkWebpackPlugin {
  private options: ResolvedOptions;

  constructor(options: PluginOptions = {}) {
    this.options = resolveOptions(options);
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation: Compilation) => {
      const logger = new Logger(this.options.debug);
      logger.setWebpackLogger(compilation.getLogger(PLUGIN_NAME));

      const ruleMatchers = this.options.rules.map((rule, index) => ({
        matcher: createRuleMatcher(rule),
        label: rule.label ?? `[${index}]`,
      }));

      compilation.hooks.processAssets.tapAsync(
        {
          name: PLUGIN_NAME,
          stage: compilation.constructor.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        async (assets, callback) => {
          const filenames = Object.keys(assets);
          const toRemove: Array<{ filename: string; label: string }> = [];

          for (const filename of filenames) {
            const asset = assets[filename];
            for (const { matcher, label } of ruleMatchers) {
              if (await matcher(filename, asset)) {
                toRemove.push({ filename, label });
                break;
              }
            }
          }

          for (const { filename, label } of toRemove) {
            compilation.deleteAsset(filename);
            logger.filtered(filename, label);
          }

          logger.summary(filenames.length, toRemove.length);
          callback();
        }
      );
    });
  }
}
```

**Step 2: Run test to verify it passes**

```bash
npm test -- tests/unit/plugin.test.ts
```

Expected: PASS - All tests pass

**Step 3: Commit**

```bash
git add src/plugin.ts
git commit -m "feat: implement plugin class with webpack 5 hooks (green)"
```

---

## Task 23: Create Main Entry Point

**Files:**
- Create: `src/index.ts`

**Step 1: Create src/index.ts**

```ts
export { FilterChunkWebpackPlugin } from "./plugin";
export type { PluginOptions, Rule, Pattern, MatcherFunction } from "./types";
```

**Step 2: Verify build works**

```bash
npm run build
```

Expected: Build succeeds, dist/ contains index.js, index.cjs, index.d.ts

**Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: add main entry point with exports"
```

---

## Task 24: Setup Test Fixtures

**Files:**
- Create: `fixtures/basic/index.js`
- Create: `fixtures/with-css/index.js`
- Create: `fixtures/with-css/styles.css`
- Create: `fixtures/with-assets/index.js`
- Create: `fixtures/with-assets/styles.css`
- Keep: `fixtures/test.png`
- Keep: `fixtures/test.svg`

**Step 1: Create basic fixture**

```bash
mkdir -p fixtures/basic
```

`fixtures/basic/index.js`:
```js
console.log("basic entry");
export const basic = true;
```

**Step 2: Create with-css fixture**

```bash
mkdir -p fixtures/with-css
```

`fixtures/with-css/index.js`:
```js
import "./styles.css";
console.log("with-css entry");
export const withCss = true;
```

`fixtures/with-css/styles.css`:
```css
body {
  background: #fff;
}
```

**Step 3: Create with-assets fixture**

```bash
mkdir -p fixtures/with-assets
```

`fixtures/with-assets/index.js`:
```js
import "./styles.css";
import png from "../test.png";
import svg from "../test.svg";
console.log("with-assets entry", png, svg);
export const withAssets = true;
```

`fixtures/with-assets/styles.css`:
```css
body {
  background: url("../test.png");
}
```

**Step 4: Clean up old fixtures**

```bash
rm -f fixtures/app.js fixtures/style.css
```

**Step 5: Commit**

```bash
git add fixtures/
git commit -m "test: reorganize fixtures for v3 testing"
```

---

## Task 25: Write Integration Tests

**Files:**
- Create: `tests/integration/plugin.test.ts`

**Step 1: Create test file**

```ts
import path from "node:path";
import { describe, expect, it } from "vitest";
import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { FilterChunkWebpackPlugin } from "../../src";

function runWebpack(
  fixture: string,
  plugins: webpack.WebpackPluginInstance[] = []
): Promise<{ assets: string[]; stats: webpack.Stats }> {
  return new Promise((resolve, reject) => {
    const compiler = webpack({
      mode: "production",
      entry: path.resolve(__dirname, `../../fixtures/${fixture}/index.js`),
      output: {
        path: path.resolve(__dirname, `../../.spec_output/${fixture}`),
        filename: "[name].js",
        clean: true,
      },
      module: {
        rules: [
          {
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader, "css-loader"],
          },
          {
            test: /\.(png|svg)$/,
            type: "asset/resource",
            generator: {
              filename: "assets/[name][ext]",
            },
          },
        ],
      },
      plugins: [new MiniCssExtractPlugin(), ...plugins],
      devtool: "source-map",
    });

    compiler.run((err, stats) => {
      if (err) return reject(err);
      if (!stats) return reject(new Error("No stats"));
      if (stats.hasErrors()) return reject(new Error(stats.toString()));

      const assets = Object.keys(stats.compilation.assets);
      resolve({ assets, stats });
    });
  });
}

describe("FilterChunkWebpackPlugin Integration", () => {
  it("outputs all assets when no rules provided", async () => {
    const { assets } = await runWebpack("basic", [new FilterChunkWebpackPlugin()]);

    expect(assets).toContain("main.js");
    expect(assets).toContain("main.js.map");
  });

  it("filters source maps with glob pattern", async () => {
    const { assets } = await runWebpack("basic", [
      new FilterChunkWebpackPlugin({
        rules: [{ patterns: "*.map" }],
      }),
    ]);

    expect(assets).toContain("main.js");
    expect(assets).not.toContain("main.js.map");
  });

  it("filters source maps with regex pattern", async () => {
    const { assets } = await runWebpack("basic", [
      new FilterChunkWebpackPlugin({
        rules: [{ patterns: /\.map$/ }],
      }),
    ]);

    expect(assets).toContain("main.js");
    expect(assets).not.toContain("main.js.map");
  });

  it("filters with function pattern", async () => {
    const { assets } = await runWebpack("basic", [
      new FilterChunkWebpackPlugin({
        rules: [{ patterns: (name) => name.endsWith(".map") }],
      }),
    ]);

    expect(assets).toContain("main.js");
    expect(assets).not.toContain("main.js.map");
  });

  it("filters CSS and source maps with multiple rules", async () => {
    const { assets } = await runWebpack("with-css", [
      new FilterChunkWebpackPlugin({
        rules: [{ patterns: "*.map" }, { patterns: "*.css" }],
      }),
    ]);

    expect(assets).toContain("main.js");
    expect(assets).not.toContain("main.js.map");
    expect(assets).not.toContain("main.css");
    expect(assets).not.toContain("main.css.map");
  });

  it("filters assets with scoped test option", async () => {
    const { assets } = await runWebpack("with-css", [
      new FilterChunkWebpackPlugin({
        rules: [{ patterns: "*.map", test: /\.css/ }],
      }),
    ]);

    expect(assets).toContain("main.js");
    expect(assets).toContain("main.js.map");
    expect(assets).toContain("main.css");
    expect(assets).not.toContain("main.css.map");
  });

  it("filters image assets", async () => {
    const { assets } = await runWebpack("with-assets", [
      new FilterChunkWebpackPlugin({
        rules: [{ patterns: "**/*.{png,svg}" }],
      }),
    ]);

    expect(assets).toContain("main.js");
    expect(assets).toContain("main.css");
    expect(assets.some((a) => a.endsWith(".png"))).toBe(false);
    expect(assets.some((a) => a.endsWith(".svg"))).toBe(false);
  });
});
```

**Step 2: Run integration tests**

```bash
npm test -- tests/integration/plugin.test.ts
```

Expected: All tests pass

**Step 3: Commit**

```bash
mkdir -p tests/integration
git add tests/integration/plugin.test.ts
git commit -m "test: add integration tests with real webpack builds"
```

---

## Task 26: Write E2E Tests

**Files:**
- Create: `tests/e2e/output.test.ts`

**Step 1: Create test file**

```ts
import fs from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { FilterChunkWebpackPlugin } from "../../src";

const OUTPUT_DIR = path.resolve(__dirname, "../../.spec_output/e2e");

function runWebpack(plugins: webpack.WebpackPluginInstance[]): Promise<webpack.Stats> {
  return new Promise((resolve, reject) => {
    const compiler = webpack({
      mode: "production",
      entry: path.resolve(__dirname, "../../fixtures/with-assets/index.js"),
      output: {
        path: OUTPUT_DIR,
        filename: "[name].js",
        clean: true,
      },
      module: {
        rules: [
          {
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader, "css-loader"],
          },
          {
            test: /\.(png|svg)$/,
            type: "asset/resource",
            generator: {
              filename: "assets/[name][ext]",
            },
          },
        ],
      },
      plugins: [new MiniCssExtractPlugin(), ...plugins],
      devtool: "source-map",
    });

    compiler.run((err, stats) => {
      if (err) return reject(err);
      if (!stats) return reject(new Error("No stats"));
      if (stats.hasErrors()) return reject(new Error(stats.toString()));
      resolve(stats);
    });
  });
}

describe("E2E: Build Output Verification", () => {
  beforeAll(async () => {
    await runWebpack([
      new FilterChunkWebpackPlugin({
        rules: [
          { label: "sourcemaps", patterns: "*.map" },
          { label: "images", patterns: "**/*.{png,svg}" },
        ],
      }),
    ]);
  });

  afterAll(() => {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  });

  it("keeps main.js on disk", () => {
    const filePath = path.join(OUTPUT_DIR, "main.js");
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, "utf-8");
    expect(content.length).toBeGreaterThan(0);
  });

  it("keeps main.css on disk", () => {
    const filePath = path.join(OUTPUT_DIR, "main.css");
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("background");
  });

  it("does NOT have main.js.map on disk", () => {
    const filePath = path.join(OUTPUT_DIR, "main.js.map");
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it("does NOT have main.css.map on disk", () => {
    const filePath = path.join(OUTPUT_DIR, "main.css.map");
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it("does NOT have PNG assets on disk", () => {
    const assetsDir = path.join(OUTPUT_DIR, "assets");
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      expect(files.some((f) => f.endsWith(".png"))).toBe(false);
    }
  });

  it("does NOT have SVG assets on disk", () => {
    const assetsDir = path.join(OUTPUT_DIR, "assets");
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      expect(files.some((f) => f.endsWith(".svg"))).toBe(false);
    }
  });
});
```

**Step 2: Run E2E tests**

```bash
npm test -- tests/e2e/output.test.ts
```

Expected: All tests pass

**Step 3: Commit**

```bash
mkdir -p tests/e2e
git add tests/e2e/output.test.ts
git commit -m "test: add E2E tests verifying files on disk"
```

---

## Task 27: Run Full Test Suite

**Step 1: Run all tests with coverage**

```bash
npm run test:coverage
```

Expected: All tests pass with coverage report

**Step 2: Run linting**

```bash
npm run lint
```

Expected: No linting errors

**Step 3: Run type checking**

```bash
npm run typecheck
```

Expected: No type errors

**Step 4: Commit any fixes if needed**

---

## Task 28: Update README

**Files:**
- Modify: `README.md`

**Step 1: Replace README content**

```markdown
# filter-chunk-webpack-plugin

A webpack 5 plugin that filters chunks from the build output based on customizable rules.

[![npm](https://img.shields.io/npm/v/filter-chunk-webpack-plugin.svg)](https://www.npmjs.com/package/filter-chunk-webpack-plugin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install filter-chunk-webpack-plugin --save-dev
```

## Requirements

- Node.js >= 20
- webpack >= 5

## Usage

```js
import { FilterChunkWebpackPlugin } from "filter-chunk-webpack-plugin";
// or
const { FilterChunkWebpackPlugin } = require("filter-chunk-webpack-plugin");

export default {
  plugins: [
    new FilterChunkWebpackPlugin({
      rules: [
        { patterns: "*.map" }, // Filter source maps
      ],
    }),
  ],
};
```

## Configuration

### Options

| Option  | Type      | Default | Description                      |
| ------- | --------- | ------- | -------------------------------- |
| `rules` | `Rule[]`  | `[]`    | Array of filter rules (pipeline) |
| `debug` | `boolean` | `false` | Enable console debug logging     |

### Rule

| Property   | Type                        | Required | Description                             |
| ---------- | --------------------------- | -------- | --------------------------------------- |
| `patterns` | `Pattern \| Pattern[]`      | Yes      | Pattern(s) to match filenames           |
| `label`    | `string`                    | No       | Label for debugging output              |
| `test`     | `RegExp`                    | No       | Only apply rule to files matching this  |

### Pattern Types

Patterns can be:

- **Glob string**: `"*.map"`, `"**/*.{png,svg}"`, `"assets/*"`
- **RegExp**: `/\.map$/`, `/\.LICENSE\.txt$/`
- **Function**: `(filename, asset) => boolean`

## Examples

### Filter source maps

```js
new FilterChunkWebpackPlugin({
  rules: [{ patterns: "*.map" }],
});
```

### Filter multiple file types

```js
new FilterChunkWebpackPlugin({
  rules: [
    { patterns: ["*.map", "*.txt"] },
    { patterns: /\.LICENSE\.txt$/ },
  ],
});
```

### Filter with custom function

```js
new FilterChunkWebpackPlugin({
  rules: [
    {
      patterns: (filename) => filename.includes("vendor"),
    },
  ],
});
```

### Scoped filtering

Filter source maps only for CSS files:

```js
new FilterChunkWebpackPlugin({
  rules: [
    { patterns: "*.map", test: /\.css/ },
  ],
});
```

### Debug mode

```js
new FilterChunkWebpackPlugin({
  debug: true,
  rules: [
    { label: "sourcemaps", patterns: "*.map" },
    { label: "licenses", patterns: /\.LICENSE\.txt$/ },
  ],
});
```

Output:
```
[FilterChunk] Filtered: main.js.map (label: sourcemaps)
[FilterChunk] Filtered: vendor.LICENSE.txt (label: licenses)
[FilterChunk] Filtered 2 of 5 assets (3 remaining)
[FilterChunk] Filtered assets:
  sourcemaps:
    - main.js.map
  licenses:
    - vendor.LICENSE.txt
```

## Migration from v2

### Before (v2)

```js
new FilterChunkWebpackPlugin({
  patterns: ["*.map", "*.txt"],
});
```

### After (v3)

```js
new FilterChunkWebpackPlugin({
  rules: [{ patterns: ["*.map", "*.txt"] }],
});
```

## Breaking Changes in v3

- Requires webpack 5 (dropped webpack 4 support)
- Requires Node.js 20+ (dropped Node.js 16/18 support)
- Removed `select` option (plugin always filters out matched files)
- Replaced `patterns` option with `rules` array

## License

MIT
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README for v3"
```

---

## Task 29: Update .npmignore

**Files:**
- Modify: `.npmignore`

**Step 1: Replace .npmignore content**

```
# Source
src/

# Tests
tests/
fixtures/
.spec_output/
coverage/
vitest.config.ts

# Config
tsconfig.json
tsup.config.ts
turbo.json
biome.json
.editorconfig

# CI/CD
.github/

# Docs
docs/
CONTRIBUTING.md

# Misc
.turbo/
*.log
```

**Step 2: Commit**

```bash
git add .npmignore
git commit -m "chore: update .npmignore for v3"
```

---

## Task 30: Update GitHub Actions

**Files:**
- Modify: `.github/workflows/main.yml`

**Step 1: Replace workflow content**

```yaml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20, 22]

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Test
        run: npm run test:coverage

      - name: Upload coverage
        if: matrix.node-version == 22
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          fail_ci_if_error: false
```

**Step 2: Commit**

```bash
git add .github/workflows/main.yml
git commit -m "ci: update GitHub Actions for v3"
```

---

## Task 31: Final Verification

**Step 1: Clean and rebuild**

```bash
npm run clean && npm run build
```

Expected: Build succeeds

**Step 2: Run full test suite**

```bash
npm test
```

Expected: All tests pass

**Step 3: Verify package contents**

```bash
npm pack --dry-run
```

Expected: Only dist/ files included

**Step 4: Create final commit if needed**

```bash
git status
```

If clean, no commit needed.

---

## Summary

Total tasks: 31
Estimated commits: ~30

Key milestones:
- Tasks 1-9: Project setup
- Tasks 10-18: Matchers (TDD)
- Tasks 19-20: Logger (TDD)
- Tasks 21-23: Plugin (TDD)
- Tasks 24-26: Tests (integration + E2E)
- Tasks 27-31: Documentation and CI
