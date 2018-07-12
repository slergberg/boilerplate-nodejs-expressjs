const debug = require('debug')('api')

const ApiError = require('./errors/ApiError')
const WorkerError = require('./errors/WorkerError')

const logError = (error) => {
  if (error instanceof ApiError) {
    return
  }

  if (error instanceof WorkerError) {
    return
  }

  debug(error)
}

module.exports = {
  ApiError,
  WorkerError,
  logError,
}
