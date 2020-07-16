#!/usr/bin/env node
const fs = require('fs')
const { join } = require('path')

const packageJson = require('../package.json')

const distPackageJson = {
  ...packageJson,
  main: './functions.js',
  engines: {
    node: '10',
  },
}

fs.writeFileSync(
  join(__dirname, '../dist/package.json'),
  JSON.stringify(distPackageJson),
)
