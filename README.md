# filter-chunk-webpack-plugin

> Include or exclude files / chunks from the final output based on a list of patterns

[![npm][npm-badge]][npm-link]
[![Build Status][circle-badge]][circle-link]

This is a webpack plugin that allows you to filter the final output files
before they are being written to disk. This is useful if you're creating
multiple output bundles with common assets. As such, you can use this
to omit it in other runs.

Unlike the [IgnorePlugin][ignore-plugin-package], this does not prevent
an `import` or `require` from being bundled, but instead, omits certain
files from being written to disk, ensuring that any update of references
due to hashing or other processing will still happen.

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
    chunkFilename: 'assets/[id].app.[chunkhash].js',
  },
  module: {
    rules: [{
      test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif)(\?.*)?$/i,
      use: {
        loader: 'file-loader?name=[path][name]_[hash].[ext]',
        options: {
          outputPath: 'assets/images/',
        }
      }
    }],
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'assets/css/css.[contenthash].css',
      allChunks: true
    }),
    new FilterChunkWebpackPlugin({
      patterns: [
        'assets/*'
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
assets/images/a5b912cd3.png
```

## Options

| option   | type    | default | description                                                                                                           |
| -------- | ------- | ------- | --------------------------------------------------------------------------------------------------------------------- |
| patterns | array   | `[]`    | a list of pattern types that are supported by [multimatch][multimatch-package]                                        |
| include  | boolean | `false` | by default, this plugin will omit the matched result. Setting it to true will select only the matched result instead. |

## License

`filter-chunk-webpack-plugin` is [MIT licensed](./LICENSE)

[npm-badge]: https://img.shields.io/npm/v/filter-chunk-webpack-plugin.svg?style=flat-square
[npm-link]: https://www.npmjs.com/package/filter-chunk-webpack-plugin

[circle-badge]: https://img.shields.io/circleci/project/github/yeojz/filter-chunk-webpack-plugin/master.svg?style=flat-square
[circle-link]: https://circleci.com/gh/yeojz/filter-chunk-webpack-plugin

[multimatch-package]: https://github.com/sindresorhus/multimatch
[ignore-plugin-package]: https://webpack.js.org/plugins/ignore-plugin/
