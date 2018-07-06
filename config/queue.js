const kue = require('kue')

const queue = kue.createQueue({
  prefix: process.env.REDIS_PREFIX,
  redis: {
    auth: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DATABASE,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
})

module.exports = queue
