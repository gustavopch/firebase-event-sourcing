/** @type {import('tsup').Options} */
module.exports = {
  dts: {
    entry: {
      index: './src/index.ts',
      app: './src/app.ts',
      'functions/index': './src/functions/index.ts',
    },
  },
  entryPoints: ['./src/index.ts', './src/app.ts', './src/functions/index.ts'],
  format: ['cjs', 'esm'],
  keepNames: true,
  splitting: false,
}
