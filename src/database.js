const Sequelize = require('sequelize')
const find = require('find')
const path = require('path')

const databaseConfig = require('../config/database')

const {
  database,
  username,
  password,
  ...options
} = databaseConfig

const sequelize = new Sequelize(
  database,
  username,
  password,
  options,
)

const getModelFiles = () => (
  find.fileSync(/Model\.js$/, './src', [])
)

const modelsFiles = getModelFiles()

const models = modelsFiles.reduce((previousValue, modelFile) => {
  const model = sequelize.import(path.join(__dirname, '..', modelFile))
  return {
    ...previousValue,
    [model.name]: model,
  }
}, {})

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models)
  }
})

const bootstrapDatabase = async () => {
  if (process.env.DB_SHOULD_SYNC) {
    await sequelize.sync()
  }

  return sequelize
}

module.exports = {
  bootstrapDatabase,
  database: sequelize,
}
