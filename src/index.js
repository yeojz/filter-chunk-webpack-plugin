import multimatch from 'multimatch';
import omit from 'lodash.omit';
import pick from 'lodash.pick';

const PLUGIN_NAME = 'FilterChunkWebpackPlugin';

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

    compiler.hooks.emit.tap(PLUGIN_NAME, (compilation) => {
      if (this.options.patterns.length > 0) {
        const files = Object.keys(compilation.assets);
        const matchedFiles = multimatch(files, this.options.patterns);

        compilation.assets = filter(compilation.assets, matchedFiles);
      }
    });
  }
}

module.exports = FilterChunkWebpackPlugin;
