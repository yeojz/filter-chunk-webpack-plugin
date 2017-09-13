import multimatch from 'multimatch';
import omit from 'lodash.omit';
import pick from 'lodash.pick';

class FilterChunkWebpackPlugin {
  constructor(options = {}) {
    if (!Array.isArray(options.patterns)) {
      throw new Error('The "patterns" option should be an array');
    }

    this.options = Object.assign({
      debug: this.log,
      include: false,
      patterns: [],
      preview: false
    }, options);
  }

  log(...args) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }

  filter(...args) {
    if (this.options.include === true) {
      return pick(...args);
    }

    return omit(...args);
  }

  previewMatchedFiles(matchedFiles) {
    const action = this.options.include === true ? 'included' : 'excluded';

    this.options.debug(`${matchedFiles.length} file(s) that will be ${action}`);
    matchedFiles.forEach((file) => {
      this.options.debug(file);
    });
    this.options.debug('');
  }

  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {

      if (this.options.patterns.length > 0) {
        const files = Object.keys(compilation.assets);
        const matchedFiles = multimatch(files, this.options.patterns);

        if (this.options.preview) {
          this.previewMatchedFiles(matchedFiles);
        } else {
          // eslint-disable-next-line no-param-reassign
          compilation.assets = this.filter(compilation.assets, matchedFiles);
        }
      }

      callback();
    });
  }
}

module.exports = FilterChunkWebpackPlugin;
