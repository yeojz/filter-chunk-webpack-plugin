# filter-chunk-webpack-plugin

> Include or exclude files / chunks from the final output based on a list of patterns

[![npm][npm-badge]][npm-link]
[![Build Status][circle-badge]][circle-link]

This webpack plugin allows you to filter the list of output files before
they are being written / emitted to disk. It does not prevent files
from `import` or `require` from being processed and bundled, keeping the
file references like image assets in your bundled code.

This is useful if you're creating multiple output bundles with common assets.
As such, you can use this to omit it in other runs.

## Installation

Install the library via:

```
$ npm install filter-chunk-webpack-plugin --save-dev
```

## Basic Usage

```js
const FilterChunkWebpackPlugin = require('filter-chunk-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

const webpackConfig = {
  entry: 'index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'assets/app.[chunkhash].js',
    chunkFilename: 'assets/[id].app.[chunkhash].js'
  },
  module: {
    rules: [{
      test: /\.svg$/,
      use: {
        loader: 'file-loader?name=[path][name]_[hash].[ext]',
        options: {
          outputPath: 'assets/images/'
        }
      }
    }]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'assets/css/css.[contenthash].css',
      allChunks: true
    }),
    new FilterChunkWebpackPlugin({
      patterns: [
        'assets/*',
        '!assets/css/*'
      ]
    })
  ]
};
```

This should generate files like

```
assets/app.12ab3c.js
assets/1.app.3bcd45.js

assets/css/css.98a5a.css
```

but not

```
assets/images/a5b912cd3.svg
```

## Options

| options  | type    | defaults | description                                                                                                                  |
| -------- | ------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| patterns | array   | `[]`     | A list of pattern types that are supported by [multimatch][multimatch-package]                                               |
| include  | boolean | `false`  | By default, this plugin will omit the matched result. Setting it to true will include the matched result instead of omitting |
| preview  | boolean | `false`  | To print the list of chunks that matches the patterns without applying the changes                                           |

## License

`filter-chunk-webpack-plugin` is [MIT licensed](./LICENSE)

[npm-badge]: https://img.shields.io/npm/v/filter-chunk-webpack-plugin.svg?style=flat-square
[npm-link]: https://www.npmjs.com/package/filter-chunk-webpack-plugin

[circle-badge]: https://img.shields.io/circleci/project/github/yeojz/filter-chunk-webpack-plugin/master.svg?style=flat-square
[circle-link]: https://circleci.com/gh/yeojz/filter-chunk-webpack-plugin

[multimatch-package]: https://github.com/sindresorhus/multimatch
[ignore-plugin-package]: https://webpack.js.org/plugins/ignore-plugin/
