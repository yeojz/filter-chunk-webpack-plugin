import FilterChunkWebpackPlugin from './index';

describe('FilterChunkWebpackPlugin', function () {
  const PATTERN_ERROR = 'The "patterns" option should be an array';

  it('should set options from constructor', function () {
    const plugin = new FilterChunkWebpackPlugin({
      select: true,
      patterns: ['**/**']
    });

    expect(plugin.options.select).toBe(true);
    expect(plugin.options.patterns).toEqual(['**/**']);
  });

  it('should set defaults from constructor', function () {
    const plugin = new FilterChunkWebpackPlugin();

    expect(plugin.options.select).toEqual(false);
    expect(plugin.options.patterns).toEqual([]);
  });

  it('should throw an Error when patterns is not array', function () {
    const plugin = () => new FilterChunkWebpackPlugin({
      patterns: 'test'
    });

    expect(plugin).toThrow(PATTERN_ERROR)
  });
});
