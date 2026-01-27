# filter-chunk-webpack-plugin

> Filter and exclude assets from webpack output based on flexible pattern rules

[![npm][npm-badge]][npm-link]
[![Build Status][ci-badge]][ci-link]
[![Coverage Status][codecov-badge]][codecov-link]
[![PRs Welcome][pr-welcome-badge]][pr-welcome-link]

This webpack plugin allows you to filter assets from the final output before they are emitted to disk. Assets are still processed and bundled normally - only the final file emission is prevented. This is useful for:

- Removing source maps from production builds
- Excluding specific file types from output
- Conditional asset filtering based on custom logic
- Creating builds with different asset configurations

## Installation

```bash
npm install filter-chunk-webpack-plugin --save-dev
```

## Requirements

| Requirement | Version |
| ----------- | ------- |
| Node.js     | >= 20   |
| webpack     | >= 5    |

## Usage

### ESM (Recommended)

```js
import FilterChunkWebpackPlugin from 'filter-chunk-webpack-plugin';
```

### CommonJS

```js
const FilterChunkWebpackPlugin = require('filter-chunk-webpack-plugin');
```

### Basic Example

```js
import FilterChunkWebpackPlugin from 'filter-chunk-webpack-plugin';

export default {
  // ... webpack config
  plugins: [
    new FilterChunkWebpackPlugin({
      rules: [
        {
          patterns: '*.map',
        },
      ],
    }),
  ],
};
```

## Configuration

### Plugin Options

| Option  | Type                       | Default     | Description                                                     |
| ------- | -------------------------- | ----------- | --------------------------------------------------------------- |
| `mode`  | `'exclude' \| 'include'`   | `'exclude'` | Filter mode: exclude matched assets or include only matched     |
| `rules` | `Rule[]`                   | `[]`        | Array of rules defining which assets to filter                  |
| `debug` | `boolean`                  | `false`     | Enable debug logging to see filtered assets                     |

### Mode

The `mode` option determines how rules are applied:

- **`exclude` (default)**: Assets matching any rule are **removed** from output. Rules are processed as a pipeline - each rule filters from the remaining assets.
- **`include`**: Only assets matching at least one rule are **kept** in output. Rules are combined with OR logic (union) - an asset is kept if any rule matches it.

### Rule Properties

| Property   | Type                         | Required | Description                                           |
| ---------- | ---------------------------- | -------- | ----------------------------------------------------- |
| `patterns` | `Pattern \| Pattern[]`       | Yes      | Pattern(s) to match against asset filenames           |
| `test`     | `RegExp`                     | No       | Pre-filter to limit which assets the rule applies to  |
| `label`    | `string`                     | No       | Label for debug output to identify the rule           |

### Pattern Types

Patterns can be one of three types:

| Type       | Example                              | Description                           |
| ---------- | ------------------------------------ | ------------------------------------- |
| `string`   | `'*.map'`, `'assets/**/*.png'`       | Glob pattern using picomatch syntax   |
| `RegExp`   | `/\.map$/`, `/^vendor\..+\.js$/`     | Regular expression                    |
| `function` | `(filename, asset) => boolean`       | Custom function (can be async)        |

## Examples

### Filter Source Maps

Remove all `.map` files from output:

```js
new FilterChunkWebpackPlugin({
  rules: [
    {
      patterns: '*.map',
    },
  ],
});
```

### Filter Multiple File Types

Remove multiple file types using an array of patterns:

```js
new FilterChunkWebpackPlugin({
  rules: [
    {
      patterns: ['*.map', '*.txt', 'LICENSE*'],
    },
  ],
});
```

### Using Regular Expressions

Filter using regex patterns:

```js
new FilterChunkWebpackPlugin({
  rules: [
    {
      patterns: /\.map$/,
    },
    {
      patterns: /^vendor\..+\.js$/,
    },
  ],
});
```

### Custom Function Filter

Use a function for complex filtering logic:

```js
new FilterChunkWebpackPlugin({
  rules: [
    {
      patterns: (filename, asset) => {
        // Filter assets larger than 1MB
        return asset.size() > 1024 * 1024;
      },
    },
  ],
});
```

### Async Function Filter

Functions can also be async:

```js
new FilterChunkWebpackPlugin({
  rules: [
    {
      patterns: async (filename, asset) => {
        const content = asset.source();
        // Perform async validation
        return await someAsyncCheck(content);
      },
    },
  ],
});
```

### Scoped Filtering with Test

Use `test` to limit which files a rule applies to:

```js
new FilterChunkWebpackPlugin({
  rules: [
    {
      // Only apply to files in the assets directory
      test: /^assets\//,
      patterns: ['*.png', '*.jpg'],
    },
    {
      // Only apply to JavaScript files
      test: /\.js$/,
      patterns: /^vendor\./,
    },
  ],
});
```

### Debug Mode

Enable debug mode to see which assets are being filtered:

```js
new FilterChunkWebpackPlugin({
  debug: true,
  rules: [
    {
      label: 'source-maps',
      patterns: '*.map',
    },
    {
      label: 'large-assets',
      patterns: (filename, asset) => asset.size() > 500000,
    },
  ],
});
```

Debug output:

```
[FilterChunkWebpackPlugin] Filtered: main.js.map (source-maps)
[FilterChunkWebpackPlugin] Filtered: large-image.png (large-assets)
[FilterChunkWebpackPlugin] Summary: 2 of 10 assets filtered
```

### Multiple Rules

Combine multiple rules for complex filtering:

```js
new FilterChunkWebpackPlugin({
  rules: [
    // Remove all source maps
    {
      patterns: '*.map',
    },
    // Remove specific vendor chunks
    {
      patterns: /^vendor-legacy\./,
    },
    // Remove large images from CSS assets directory
    {
      test: /^css\/assets\//,
      patterns: (filename, asset) => {
        return /\.(png|jpg)$/.test(filename) && asset.size() > 100000;
      },
    },
  ],
});
```

### Include Mode

Use `mode: 'include'` to keep only assets that match your rules (opposite of the default exclude behavior):

```js
// Keep only JavaScript and CSS files, remove everything else
new FilterChunkWebpackPlugin({
  mode: 'include',
  rules: [
    {
      patterns: '*.js',
    },
    {
      patterns: '*.css',
    },
  ],
});
```

With include mode, rules use OR logic (union) - an asset is kept if it matches **any** rule:

```js
// Keep JS, CSS, and specific image assets
new FilterChunkWebpackPlugin({
  mode: 'include',
  rules: [
    {
      label: 'scripts',
      patterns: '*.js',
    },
    {
      label: 'styles',
      patterns: '*.css',
    },
    {
      label: 'icons',
      test: /^assets\/icons\//,
      patterns: '*.svg',
    },
  ],
});
```

Debug output for include mode shows kept assets instead of filtered:

```
[FilterChunkWebpackPlugin] Kept: main.js (scripts)
[FilterChunkWebpackPlugin] Kept: styles.css (styles)
[FilterChunkWebpackPlugin] Summary: Kept 2 of 5 assets (3 removed)
```

## Migration from v2

### Breaking Changes

1. **Node.js 20+ required** - Dropped support for Node.js < 20
2. **webpack 5+ required** - Dropped support for webpack 4
3. **New configuration format** - The `patterns` and `select` options have been replaced with a `rules` array

### Configuration Migration

**v2 (old):**

```js
new FilterChunkWebpackPlugin({
  patterns: ['*.map', 'assets/*'],
  select: false,
});
```

**v3 (new):**

```js
new FilterChunkWebpackPlugin({
  rules: [
    {
      patterns: ['*.map', 'assets/*'],
    },
  ],
});
```

### Key Differences

| v2                        | v3                                        |
| ------------------------- | ----------------------------------------- |
| `patterns` (top-level)    | `rules[].patterns`                        |
| `select: false` (exclude) | `mode: 'exclude'` (default)               |
| `select: true` (include)  | `mode: 'include'`                         |
| multimatch syntax         | picomatch syntax (mostly compatible)      |

### Migrating `select: true`

If you were using `select: true` in v2 to keep only matching files:

**v2:**
```js
new FilterChunkWebpackPlugin({
  patterns: ['*.js', '*.css'],
  select: true,
});
```

**v3:**
```js
new FilterChunkWebpackPlugin({
  mode: 'include',
  rules: [
    {
      patterns: ['*.js', '*.css'],
    },
  ],
});
```

### Pattern Compatibility

Most glob patterns work the same way. However, if you were using advanced multimatch features, check the [picomatch documentation](https://github.com/micromatch/picomatch) for any differences.

## License

`filter-chunk-webpack-plugin` is [MIT licensed](./LICENSE)

[npm-badge]: https://img.shields.io/npm/v/filter-chunk-webpack-plugin.svg?style=flat-square
[npm-link]: https://www.npmjs.com/package/filter-chunk-webpack-plugin
[ci-badge]: https://img.shields.io/github/actions/workflow/status/yeojz/filter-chunk-webpack-plugin/main.yml?branch=master&style=flat-square
[ci-link]: https://github.com/yeojz/filter-chunk-webpack-plugin/actions
[pr-welcome-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square&longCache=true
[pr-welcome-link]: https://github.com/yeojz/filter-chunk-webpack-plugin/blob/master/CONTRIBUTING.md
[codecov-badge]: https://img.shields.io/codecov/c/github/yeojz/filter-chunk-webpack-plugin/master.svg?style=flat-square
[codecov-link]: https://codecov.io/gh/yeojz/filter-chunk-webpack-plugin
