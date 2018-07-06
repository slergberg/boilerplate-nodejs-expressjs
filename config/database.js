const baseDatabaseConfig = {
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  username: process.env.DB_USERNAME,
  define: {
    paranoid: true,
    underscored: true,
    underscoredAll: true,
  },
  operatorsAliases: false,
}

let databaseConfig
if (process.env.NODE_ENV === 'test') {
  databaseConfig = {
    ...baseDatabaseConfig,
    dialect: 'sqlite',
  }
} else {
  databaseConfig = {
    ...baseDatabaseConfig,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'mysql',
  }
}

module.exports = databaseConfig
