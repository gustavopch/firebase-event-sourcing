#!/usr/bin/env node
const { execSync } = require('child_process')
const fs = require('fs')
const { join } = require('path')

execSync(
  'yarn parcel build ./example/src/functions.ts --out-dir ./example/dist --target node',
  {
    stdio: 'inherit',
  },
)

const packageJson = {
  main: './functions',
  dependencies: {
    'firebase-admin': '9.0.0',
    'firebase-functions': '3.9.0',
  },
}

fs.writeFileSync(
  join(process.cwd(), 'example', 'dist', 'package.json'),
  JSON.stringify(packageJson),
)
