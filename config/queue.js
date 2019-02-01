const queueConfig = {
  prefix: process.env.REDIS_PREFIX,
  redis: {
    db: process.env.REDIS_DATABASE,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT,
  },
}

module.exports = queueConfig
