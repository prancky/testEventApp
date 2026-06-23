const isTest = process.env.NODE_ENV === 'test' || process.env.BABEL_ENV === 'test';

module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    // Skip module-resolver under Jest so jest.config.js moduleNameMapper
    // sees `@/...` imports directly.
    ...(isTest
      ? []
      : [
          [
            'module-resolver',
            { root: ['./src'], alias: { '^@/(.+)': String.raw`./src/\1` } },
          ],
        ]),
    ...(process.env.BABEL_ENV === 'production' || process.env.NODE_ENV === 'production'
      ? [['transform-remove-console', { exclude: ['error', 'warn'] }]]
      : []),
  ],
};

