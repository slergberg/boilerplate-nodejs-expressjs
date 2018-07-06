const Raven = require('raven')
const cors = require('cors')
const debug = require('debug')
const express = require('express')
const http = require('http')
const logger = require('morgan')

const { bootstrapApp } = require('./src/application')
const { bootstrapDatabase } = require('./src/database')
const { bootstrapDispatchers } = require('./src/workers')

const debugApplication = debug('application')
const debugServer = debug('server')

const createApp = (port) => {
  const app = express()

  app.set('port', port)

  return app
}

const normalizePort = (val) => {
  const port = parseInt(val, 10)

  if (Number.isNaN(port)) {
    return val
  }

  if (port >= 0) {
    return port
  }

  return false
}

const normalizeSentryEnabled = sentryEnabled => (
  sentryEnabled === true || sentryEnabled === 'true'
)

const onError = port => (
  (err) => {
    if (err.syscall !== 'listen') {
      throw err
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`

    switch (err.code) {
      case 'EACCES':
        debugServer(`${bind} requires elevated privileges`)
        process.exit(1)
        break
      case 'EADDRINUSE':
        debugServer(`${bind} is already in use`)
        process.exit(1)
        break
      default:
        throw err
    }
  }
)

const onListening = server => (
  () => {
    const addr = server.address()
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`
    debugServer(`Listening on ${bind}`)
  }
)

const errorHandler = () => (
  (err, req, res, next) => {
    if (res.headersSent) {
      next(err)
    } else {
      debugApplication(err)

      res.locals.message = err.message
      res.locals.error = req.app.get('env') === 'development' ? err : {}

      res.status(err.status || 500)
      res.json({ status: err.status })
    }
  }
)

const initializeApi = async () => {
  const port = normalizePort(process.env.PORT || '80')
  const sentryEnabled = normalizeSentryEnabled(process.env.SENTRY_ENABLED)

  bootstrapDatabase()

  bootstrapDispatchers()

  let app = createApp(port)

  app.use(cors())

  if (sentryEnabled) {
    app.use(Raven.requestHandler())
  }

  if (process.env.APP_ENV === 'development') {
    app.use(logger('dev'))
  } else {
    app.use(logger('combined'))
  }

  app = await bootstrapApp(app)

  if (sentryEnabled) {
    app.use(Raven.errorHandler())
  }

  app.use(errorHandler())

  const server = http.createServer(app)
  server.listen(port)
  server.on('error', onError(port))
  server.on('listening', onListening(server))
}

if (normalizeSentryEnabled(process.env.SENTRY_ENABLED)) {
  Raven.config(
    process.env.SENTRY_DSN,
    {
      release: process.env.VERSION,
    },
  ).install()
}

initializeApi()
