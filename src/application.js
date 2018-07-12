const bodyParser = require('body-parser')
const createError = require('http-errors')
const express = require('express')
const path = require('path')

const packageDefinition = require('../package.json')

const { ApiError } = require('../helpers/errors')

const mainRouter = () => {
  const router = express.Router()

  router.get('/', (req, res) => {
    res.send({ api: packageDefinition.name })
  })

  router.get('/health_check', (req, res) => {
    res.send({ status: 200 })
  })

  return router
}

const apiErrorHandler = () => (
  (err, req, res, next) => {
    if (err instanceof ApiError) {
      res.status(err.statusCode || 400)
      res.json(err.details)
    } else {
      next(err)
    }
  }
)

const notFoundRouter = (statusCode = 404) => (
  (req, res, next) => {
    next(createError(statusCode))
  }
)

const bootstrapApp = async (app) => {
  app.use(bodyParser.json({ limit: '50mb' }))
  app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))

  app.use(express.static(path.join(__dirname, '..', 'public')))

  app.use(mainRouter())

  // Put your application routes here

  app.use(apiErrorHandler())

  app.use(notFoundRouter())

  return app
}

module.exports = {
  bootstrapApp,
}
