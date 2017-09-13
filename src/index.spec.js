// import path from 'path';
// import fs from 'fs';
// import webpack from 'webpack';

import FilterChunkWebpackPlugin from './index';

describe('FilterChunkWebpackPlugin', function () {
  const PATTERN_ERROR = 'The "patterns" option should be an array';

  it('should set options from constructor', function () {
    const plugin = new FilterChunkWebpackPlugin({
      include: true,
      preview: true,
      patterns: ['**/**']
    });
    expect(plugin.options.include).toBe(true);
    expect(plugin.options.preview).toBe(true);
    expect(plugin.options.patterns).toEqual(['**/**']);
  });

  it('should throw an Error when patterns is not array', function () {
    const plugin = () => new FilterChunkWebpackPlugin({
      patterns: 'test'
    });
    expect(plugin).toThrow(PATTERN_ERROR)
  });

  it('should throw an Error when options not set', function () {
    const plugin = () => new FilterChunkWebpackPlugin();
    expect(plugin).toThrow(PATTERN_ERROR)
  });

  // describe('when deleting files', () => {
  //   let unlinkSync;
  //   const outputPath = path.resolve(__dirname, 'assets');
  //   const webpackConfig = {
  //     entry: path.join(__dirname, 'entry.js'),
  //     output: {
  //       path: outputPath,
  //       filename: 'bundle.js',
  //     },
  //   };

  //   beforeEach(() => { unlinkSync = stub(fs, 'unlinkSync'); });
  //   afterEach(() => { unlinkSync.restore(); });

  //   it('should delete the extraneous files from the output path', (done) => {
  //     const compiler = webpack({
  //       ...webpackConfig,
  //       plugins: [new WebpackCleanupPlugin({ quiet: true })],
  //     });
  //     compiler.run(() => {
  //       expect(unlinkSync).to.have.been.calledWith(njoin(outputPath, 'a.txt'));
  //       expect(unlinkSync).to.have.been.calledWith(njoin(outputPath, 'b.txt'));
  //       expect(unlinkSync).to.not.have.been.calledWith(njoin(outputPath, 'bundle.js'));
  //       expect(unlinkSync).to.have.been.calledWith(njoin(outputPath, 'foo.json'));
  //       expect(unlinkSync).to.have.been.calledWith(njoin(outputPath, 'z.txt'));
  //       done();
  //     });
  //   });

  //   it('should not delete when previewing files', (done) => {
  //     const compiler = webpack({
  //       ...webpackConfig,
  //       plugins: [
  //         new WebpackCleanupPlugin({ preview: true }),
  //       ],
  //     });
  //     compiler.run(() => {
  //       expect(unlinkSync).to.not.have.been.called;
  //       done();
  //     });
  //   });
  // });
});
