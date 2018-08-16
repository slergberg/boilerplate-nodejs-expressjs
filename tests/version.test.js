const sequel = require('../index')

const packageDefinition = require('../package.json')

test('Version from package.json', () => {
  expect(sequel.VERSION).toBe(packageDefinition.version)
})
