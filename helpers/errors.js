const debug = require('debug')('api')

const ApiError = require('./errors/ApiError')
const WorkerError = require('./errors/WorkerError')

const logError = (err) => {
  if (err instanceof ApiError) {
    return
  }

  if (err instanceof WorkerError) {
    return
  }

  debug(err)
}

module.exports = {
  ApiError,
  WorkerError,
  logError,
}
