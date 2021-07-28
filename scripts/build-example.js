#!/usr/bin/env node

const fs = require('fs')
const { join } = require('path')
const esbuild = require('esbuild')
const { nodeExternalsPlugin } = require('esbuild-node-externals')

const main = async () => {
  await esbuild.build({
    bundle: true,
    entryPoints: ['./example/src/functions.ts'],
    logLevel: 'info',
    outdir: './example/dist',
    platform: 'node',
    plugins: [nodeExternalsPlugin()],
    sourcemap: true,
    target: 'node12',
  })

  const packageJson = {
    main: './functions',
    dependencies: {
      express: '4.17.1',
      'firebase-admin': '9.0.0',
      'firebase-functions': '3.9.0',
    },
  }

  fs.writeFileSync(
    join(process.cwd(), 'example', 'dist', 'package.json'),
    JSON.stringify(packageJson),
  )
}

main()
