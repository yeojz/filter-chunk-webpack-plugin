import multimatch from 'multimatch';
import omit from 'lodash.omit';
import pick from 'lodash.pick';

class FilterChunkWebpackPlugin {
  constructor(options) {
    if (!Array.isArray(options.patterns)) {
      throw new Error('The "patterns" option in FilterChunkWebpackPlugin should be an array');
    }

    this.filter = options.include === true ? pick : omit;
    this.patterns = options.patterns;
  }

  apply(compiler) {
    const patterns = this.patterns;

    compiler.plugin('emit', (compilation, callback) => {
      const files = Object.keys(compilation.assets);
      const matchingFiles = multimatch(files, patterns);

      // eslint-disable-next-line no-param-reassign
      compilation.assets = this.filter(compilation.assets, matchingFiles);

      callback();
    });
  }
}

module.exports = FilterChunkWebpackPlugin;
