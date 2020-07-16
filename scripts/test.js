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

const jestCommand = `tsdx test --passWithNoTests --runInBand ${jestArgs}`

execSync(
  'yarn workspace example build-functions && ' +
    `firebase emulators:exec "${jestCommand}"`,
  {
    stdio: 'inherit',
  },
)
