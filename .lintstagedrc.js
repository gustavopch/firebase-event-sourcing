module.exports = {
  '*.js': ['tsdx lint'],
  '*.ts': ['tsdx lint', () => 'tsc --noEmit'],
}
