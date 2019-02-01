module.exports = {
  hooks: {
    'pre-commit': 'node ./node_modules/pretty-quick/bin/pretty-quick --staged',
  },
}
