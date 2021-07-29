module.exports = {
  '*.js': ['eslint', 'prettier --check'],
  '*.ts': ['eslint', 'prettier --check', () => 'tsc --noEmit'],
}
