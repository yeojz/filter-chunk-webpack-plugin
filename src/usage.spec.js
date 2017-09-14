import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import FilterChunkWebpackPlugin from './index';

const OUTPUT_ROOT = path.join(path.resolve(__dirname), '..', '.spec_output');
const INPUT_ROOT = path.join(path.resolve(__dirname), '..', 'fixtures');

describe('Webpack with FilterChunkWebpackPlugin', function () {
  it('[1] should not modify assets by default', function (done) {
    const config = generateWebpackConfiguration('it-1');

    webpack(config, function (err, stats) {
      const assets = Object.keys(stats.compilation.assets);

      expect(err).toBeFalsy();
      expect(stats.compilation.warnings.length).toEqual(0);
      expect(assets).toHaveLength(4);

      done();
    });
  });

  it('[2] should omit all relevant matches', function (done) {
    const config = generateWebpackConfiguration('it-2', {
      patterns: [
        'assets/**',
        '!assets/css/**'
      ]
    });

    webpack(config, function (err, stats) {
      const assets = Object.keys(stats.compilation.assets);

      expect(err).toBeFalsy();
      expect(stats.compilation.warnings.length).toEqual(0);
      expect(assets).toHaveLength(2);
      expect(assets).toContain('app.js');
      expect(assets).toContain('assets/css/style.css');

      done();
    });
  });

  it('[3] should pick all relevant matches', function (done) {
    const config = generateWebpackConfiguration('it-3', {
      select: true,
      patterns: [
        'assets/**',
        '!assets/css/**'
      ]
    });

    webpack(config, function (err, stats) {
      const assets = Object.keys(stats.compilation.assets);

      expect(err).toBeFalsy();
      expect(stats.compilation.warnings.length).toEqual(0);
      expect(assets).toHaveLength(2);
      expect(assets).toContain('assets/images/png.png');
      expect(assets).toContain('assets/images/svg.svg');

      done();
    });
  });
});

function generateWebpackConfiguration(outputFolder, options) {
  return {
    entry: {
      app: path.join(INPUT_ROOT, 'app.js')
    },
    output: {
      path: path.join(OUTPUT_ROOT, outputFolder),
      filename: '[name].js'
    },
    module: {
      rules: [{
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: {
            loader: 'style-loader',
            options: {
              singleton: true
            },
          },
          use: [{
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          }]
        })
      }, {
        test: /\.(svg|png)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[ext].[ext]',
            outputPath: 'assets/images/'
          }
        }
      }]
    },
    plugins: [
      new ExtractTextPlugin({
        filename: 'assets/css/style.css',
      }),
      new FilterChunkWebpackPlugin(options)
    ]
  }
}
