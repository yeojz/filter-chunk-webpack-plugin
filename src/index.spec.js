const FilterChunkWebpackPlugin = require('./index');

const PATTERN_ERROR = 'The "patterns" option should be an array';

test('should set options from constructor', () => {
  const plugin = new FilterChunkWebpackPlugin({
    select: true,
    patterns: ['**/**']
  });

  expect(plugin.options.select).toBe(true);
  expect(plugin.options.patterns).toEqual(['**/**']);
});

test('should set defaults from constructor', () => {
  const plugin = new FilterChunkWebpackPlugin();

  expect(plugin.options.select).toEqual(false);
  expect(plugin.options.patterns).toEqual([]);
});

test('should throw an Error when patterns is not array', () => {
  const plugin = () =>
    new FilterChunkWebpackPlugin({
      patterns: 'test'
    });

  expect(plugin).toThrow(PATTERN_ERROR);
});
