const Raven = require('raven')
const debug = require('debug')

const { bootstrapDispatcher, bootstrapWorkers } = require('./src/workers')
const { normalizeBooleanValue, normalizePortValue } = require('./helpers/normalizers')

const debugWorker = debug('worker')

const errorHandler = (err) => {
  debugWorker(err)

  if (normalizeBooleanValue(process.env.SENTRY_ENABLED)) {
    Raven.captureException(err)
  }
}

const failedHandler = errorHandler

const failedAttemptHandler = errorHandler

const shutdownHandler = (err) => {
  debugWorker('shutting down workers: ', err || '')
}

const initializeWorker = async () => {
  const shouldInitializeUI = normalizeBooleanValue(process.env.KUE_UI_ENABLED)
  const uiPort = normalizePortValue(process.env.KUE_UI_PORT || '3000')

  bootstrapDispatcher()

  bootstrapWorkers({
    initializeUI: shouldInitializeUI,
    uiPort,
    onError: errorHandler,
    onFailed: failedHandler,
    onFailedAttempt: failedAttemptHandler,
    onShutdown: shutdownHandler,
  })
}

if (normalizeBooleanValue(process.env.SENTRY_ENABLED)) {
  Raven.config(
    process.env.SENTRY_DSN,
    {
      release: process.env.VERSION,
    },
  ).install()
}

initializeWorker()
