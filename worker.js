const Raven = require('raven')
const debug = require('debug')

const { bootstrapWorkers } = require('./src/workers')

const debugWorker = debug('application')

const normalizeSentryEnabled = sentryEnabled => (
  sentryEnabled === true || sentryEnabled === 'true'
)

const errorHandler = (err) => {
  debugWorker(err)

  if (normalizeSentryEnabled(process.env.SENTRY_ENABLED)) {
    Raven.captureException(err)
  }
}

const failedHandler = debugWorker

const shutdownHandler = (err) => {
  debugWorker('shutting down workers: ', err || '')
}

const initializeWorker = async () => {
  bootstrapWorkers({
    onError: errorHandler,
    onFailed: failedHandler,
    onFailedAttempt: failedHandler,
    onShutdown: shutdownHandler,
  })
}

if (normalizeSentryEnabled(process.env.SENTRY_ENABLED)) {
  Raven.config(
    process.env.SENTRY_DSN,
    {
      release: process.env.VERSION,
    },
  ).install()
}

initializeWorker()
