const Raven = require('raven')
const debug = require('debug')

const {
  bootstrapDispatchers,
  bootstrapWorkerUI,
  bootstrapWorkers,
} = require('./src/workers')
const {
  normalizeBooleanValue,
  normalizePortValue,
} = require('./helpers/normalizers')

const debugWorker = debug('worker')

const errorHandler = (err) => {
  debugWorker(err)

  if (normalizeBooleanValue(process.env.SENTRY_ENABLED)) {
    Raven.captureException(err)
  }
}

const failedHandler = errorHandler

const initializeWorker = async () => {
  const shouldInitializeUI = normalizeBooleanValue(
    process.env.WORKER_UI_ENABLED,
  )

  if (shouldInitializeUI) {
    bootstrapWorkerUI(normalizePortValue(process.env.WORKER_UI_PORT || '4567'))
  }

  bootstrapDispatchers()

  bootstrapWorkers({
    onError: errorHandler,
    onFailed: failedHandler,
  })
}

if (normalizeBooleanValue(process.env.SENTRY_ENABLED)) {
  Raven.config(process.env.SENTRY_DSN, {
    release: process.env.VERSION,
  }).install()
}

initializeWorker()
