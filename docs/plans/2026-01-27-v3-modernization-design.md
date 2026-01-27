# filter-chunk-webpack-plugin v3.0.0 Modernization Design

## Overview

Full modernization of the webpack plugin from ground up, targeting webpack 5 with modern tooling and enhanced features.

## Goals

1. **Webpack 5 compatibility** - Use modern webpack 5 APIs
2. **Modern tooling** - TypeScript, Vitest, Turbo, Biome
3. **Reduced dependencies** - Replace lodash + multimatch with picomatch only
4. **Enhanced features** - Multiple pattern types, rule-based filtering, better debugging

## Technology Stack

| Aspect | Current (v2) | New (v3) |
|--------|--------------|----------|
| Webpack | 4.x | 5.x |
| Language | JavaScript | TypeScript (strict) |
| Module format | CJS | Dual ESM + CJS |
| Node target | 8+ | 20+ |
| Test runner | Jest | Vitest |
| Linter | ESLint | Biome |
| Build tool | None | tsup |
| Task runner | npm scripts | Turbo |
| Dependencies | multimatch, lodash.omit, lodash.pick | picomatch only |

## Project Structure

```
filter-chunk-webpack-plugin/
├── src/
│   ├── index.ts              # Main export
│   ├── plugin.ts             # Plugin class implementation
│   ├── types.ts              # TypeScript types/interfaces
│   ├── matchers/
│   │   ├── index.ts          # Matcher factory
│   │   ├── glob.ts           # Glob pattern matcher (picomatch)
│   │   ├── regex.ts          # Regex matcher
│   │   └── function.ts       # Custom function matcher
│   └── logger.ts             # Debug + webpack stats logging
├── tests/
│   ├── unit/                 # Unit tests for matchers, logger
│   ├── integration/          # Tests with actual webpack builds
│   └── e2e/                  # Full build + verify output files
├── fixtures/
│   ├── basic/                # Simple JS entry
│   ├── with-css/             # JS + CSS
│   ├── with-assets/          # JS + images + fonts
│   └── multi-entry/          # Multiple entry points
├── dist/                     # Build output (gitignored)
│   ├── esm/                  # ESM build
│   └── cjs/                  # CJS build
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── vitest.config.ts
├── turbo.json
├── biome.json
└── README.md
```

## API Design

### Types

```ts
type MatcherFunction = (filename: string, asset: Asset) => boolean | Promise<boolean>;

type Pattern =
  | string                          // Glob pattern: "*.map"
  | RegExp                          // Regex: /\.map$/
  | MatcherFunction;                // Custom: (name, asset) => boolean

interface Rule {
  label?: string;                   // Optional label for debugging
  patterns: Pattern | Pattern[];    // Single or multiple patterns
  test?: RegExp;                    // Optional: only apply to files matching this
}

interface PluginOptions {
  rules?: Rule[];                   // Array of filter rules (pipeline)
  debug?: boolean;                  // Enable console debug logging
}
```

### Usage Examples

```ts
// Simple - single glob
new FilterChunkWebpackPlugin({
  rules: [{ patterns: '*.map' }]
})

// Multiple patterns in one rule
new FilterChunkWebpackPlugin({
  rules: [{ patterns: ['*.map', '*.txt', /\.LICENSE$/] }]
})

// Multiple rules with labels (pipeline)
new FilterChunkWebpackPlugin({
  debug: true,
  rules: [
    { label: 'sourcemaps', patterns: '*.map' },
    { label: 'licenses', patterns: /\.LICENSE\.txt$/ },
    { label: 'vendor-junk', patterns: (name) => name.includes('vendor') }
  ]
})

// Scoped rule - only filter maps from async chunks
new FilterChunkWebpackPlugin({
  rules: [
    { patterns: '*.map', test: /^async-/ }
  ]
})
```

## Plugin Implementation

### Webpack 5 Integration

```ts
class FilterChunkWebpackPlugin {
  private options: ResolvedOptions;
  private logger: Logger;

  constructor(options: PluginOptions = {}) {
    this.options = resolveOptions(options);
  }

  apply(compiler: Compiler): void {
    this.logger = new Logger(compiler, this.options.debug);

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tapAsync(
        {
          name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE
        },
        async (assets, callback) => {
          await this.filterAssets(compilation, assets);
          callback();
        }
      );
    });
  }

  private async filterAssets(
    compilation: Compilation,
    assets: Record<string, Source>
  ): Promise<void> {
    const filenames = Object.keys(assets);
    const toRemove: string[] = [];

    for (const filename of filenames) {
      const shouldFilter = await this.matchesAnyRule(filename, assets[filename]);
      if (shouldFilter) {
        toRemove.push(filename);
      }
    }

    for (const filename of toRemove) {
      compilation.deleteAsset(filename);
      this.logger.filtered(filename);
    }

    this.logger.summary(filenames.length, toRemove.length);
  }
}
```

**Key webpack 5 specifics:**
- Uses `processAssets` hook (replaces `emit`)
- `PROCESS_ASSETS_STAGE_SUMMARIZE` stage - runs after optimization, before final emit
- `tapAsync` for async support
- `compilation.deleteAsset()` - proper webpack 5 API

### Matchers Implementation

```ts
import picomatch from 'picomatch';

type Matcher = (filename: string, asset: Asset) => boolean | Promise<boolean>;

function createMatcher(pattern: Pattern): Matcher {
  if (typeof pattern === 'string') {
    const isMatch = picomatch(pattern);
    return (filename) => isMatch(filename);
  }

  if (pattern instanceof RegExp) {
    return (filename) => pattern.test(filename);
  }

  if (typeof pattern === 'function') {
    return pattern;
  }

  throw new Error(`Invalid pattern type: ${typeof pattern}`);
}

function createRuleMatcher(rule: Rule): Matcher {
  const patterns = Array.isArray(rule.patterns)
    ? rule.patterns
    : [rule.patterns];

  const matchers = patterns.map(createMatcher);

  return async (filename, asset) => {
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

### Logging

**Debug output format:**
```
[FilterChunk] Filtered: main.js.map (label: sourcemaps)
[FilterChunk] Filtered: styles.css.map (label: sourcemaps)
[FilterChunk] Filtered: vendor.js.LICENSE.txt (label: licenses)
[FilterChunk] Filtered assets:
  sourcemaps:
    - main.js.map
    - styles.css.map
  licenses:
    - vendor.js.LICENSE.txt
```

**Unlabeled rules fall back to index:**
```
[FilterChunk] Filtered: main.js.map (label: [0])
```

**Webpack stats output (always):**
```
FilterChunkWebpackPlugin: Filtered 3 of 5 assets (2 remaining)
```

## Testing Strategy

### Unit Tests
- Matcher creation for each pattern type (glob, regex, function)
- Rule matching with `test` option
- Logger output formatting

### Integration Tests
- Real webpack builds with plugin
- Rule pipeline processing
- Debug and stats output verification

### E2E Tests
- Verify filtered files don't exist on disk
- Verify kept files exist with correct content
- Multiple fixture scenarios

### Test Fixtures
```
fixtures/
├── basic/           # Simple JS entry
├── with-css/        # JS + CSS
├── with-assets/     # JS + images + fonts
└── multi-entry/     # Multiple entry points
```

## Configuration Files

### package.json
```json
{
  "name": "filter-chunk-webpack-plugin",
  "version": "3.0.0",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.cjs"
    }
  },
  "main": "./dist/cjs/index.cjs",
  "module": "./dist/esm/index.js",
  "types": "./dist/esm/index.d.ts",
  "files": ["dist"],
  "engines": { "node": ">=20" },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "biome check src tests",
    "lint:fix": "biome check --write src tests",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist coverage"
  },
  "peerDependencies": {
    "webpack": "^5.0.0"
  },
  "dependencies": {
    "picomatch": "^4.0.0"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.0",
    "@types/node": "^20.0.0",
    "tsup": "^8.0.0",
    "turbo": "^2.0.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0",
    "webpack": "^5.90.0"
  }
}
```

### tsup.config.ts
```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  outExtension: ({ format }) => ({
    js: format === 'esm' ? '.js' : '.cjs'
  })
});
```

### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "outputs": ["dist/**"] },
    "test": { "dependsOn": ["build"] },
    "lint": {},
    "typecheck": {}
  }
}
```

## Breaking Changes from v2

1. **Removed `select` option** - Plugin always filters out (excludes) matched files
2. **Removed `patterns` option** - Replaced by `rules` array
3. **Requires webpack 5+** - Uses webpack 5 specific APIs
4. **Requires Node 20+** - Uses modern Node.js features

## Migration Guide

### v2 (old)
```js
new FilterChunkWebpackPlugin({
  patterns: ['*.map', '*.txt']
})
```

### v3 (new)
```ts
new FilterChunkWebpackPlugin({
  rules: [{ patterns: ['*.map', '*.txt'] }]
})
```

### v2 with select (old)
```js
new FilterChunkWebpackPlugin({
  patterns: ['*.js'],
  select: true  // Keep only JS files
})
```

### v3 equivalent (new)
```ts
// Invert the logic - filter out everything except JS
new FilterChunkWebpackPlugin({
  rules: [{ patterns: (name) => !name.endsWith('.js') }]
})
```
