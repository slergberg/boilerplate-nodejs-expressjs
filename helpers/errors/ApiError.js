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
      this.stack = new Error(message).stack
    }
  }
}

module.exports = ApiError
