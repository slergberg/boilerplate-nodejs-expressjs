const debug = require('debug')('api')

class ApiError extends Error {
  constructor(message = 'error', details = {}) {
    super(message)

    this.name = this.constructor.name

    const { statusCode = 400, ...errorDetails } = details

    this.code = message
    this.statusCode = statusCode
    this.details = {
      code: message,
    }

    if (Object.keys(errorDetails).length > 0) {
      this.details = {
        ...this.details,
        data: errorDetails,
      }
    }

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = (new Error(message)).stack
    }
  }
}

class WorkerError extends Error {
  constructor(type = 'worker', message = 'error', details = {}) {
    super(message)

    this.name = this.constructor.name

    this.type = type
    this.code = message
    this.details = {
      code: message,
    }

    if (Object.keys(details).length > 0) {
      this.details = {
        ...this.details,
        data: details,
      }
    }

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = (new Error(message)).stack
    }
  }
}

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
