module.exports = {
  '*.js': ['tsdx lint'],
  '*.ts': ['tsdx lint', () => 'tsc --noEmit'],
  'README.md': 'npx markdown-toc -i',
}
