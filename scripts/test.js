#!/usr/bin/env node
const { execSync } = require('child_process')

const jestArgs = process.argv.slice(2).join(' ')

const matchedTestFiles = execSync(`tsdx test --listTests ${jestArgs}`)
  .toString()
  .split('\n')
  .filter(Boolean)

if (matchedTestFiles.length === 0) {
  process.exit(0)
}

execSync('./scripts/build-example.js', {
  stdio: 'inherit',
})

const jestCommand = `tsdx test --passWithNoTests --runInBand ${jestArgs}`

execSync(`yarn firebase emulators:exec "${jestCommand}"`, {
  stdio: 'inherit',
})
