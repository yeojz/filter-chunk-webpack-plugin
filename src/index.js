import multimatch from 'multimatch';
import omit from 'lodash.omit';
import pick from 'lodash.pick';

class FilterChunkWebpackPlugin {
  constructor(options) {
    if (!Array.isArray(options.patterns)) {
      throw new Error('[FilterChunkWebpackPlugin] The "patterns" option should be an array');
    }

    this.options = Object.assign({
      include: false,
      patterns: [],
      preview: false
    }, options);
  }
  
  previewMatchedFiles(matchedFiles) {
    const action = this.options.include === true ? 'included' : 'excluded';

    console.log(`${matchedFiles.length} file(s) that will be ${action}`);
    matchedFiles.forEach((file) => console.log('     %s', file));
    console.log('');
  }

  apply(compiler) {
    const filter = this.options.include === true ? pick : omit;

    
    compiler.plugin('emit', (compilation, callback) => {
      const files = Object.keys(compilation.assets);
      const matchedFiles = multimatch(files, this.options.patterns);

      if (this.options.preview) {
        this.previewMatchedFiles(matchedFiles);
      } else {
        // eslint-disable-next-line no-param-reassign
        compilation.assets = filter(compilation.assets, matchedFiles);
      }

      callback();
    });
  }
}

module.exports = FilterChunkWebpackPlugin;
