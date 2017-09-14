import multimatch from 'multimatch';
import omit from 'lodash.omit';
import pick from 'lodash.pick';

class FilterChunkWebpackPlugin {
  constructor(options = {}) {
    if (typeof options.patterns !== 'undefined' && !Array.isArray(options.patterns)) {
      throw new Error('The "patterns" option should be an array');
    }

    this.options = Object.assign({
      select: false,
      patterns: [],
    }, options);
  }

  apply(compiler) {
    const filter = this.options.select === true ? pick : omit;

    compiler.plugin('emit', (compilation, callback) => {

      if (this.options.patterns.length > 0) {
        const files = Object.keys(compilation.assets);
        const matchedFiles = multimatch(files, this.options.patterns);

        // eslint-disable-next-line no-param-reassign
        compilation.assets = filter(compilation.assets, matchedFiles);
      }

      callback();
    });
  }
}

module.exports = FilterChunkWebpackPlugin;
