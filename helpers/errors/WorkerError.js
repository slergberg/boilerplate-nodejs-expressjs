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
      this.stack = new Error(message).stack
    }
  }
}

module.exports = WorkerError
