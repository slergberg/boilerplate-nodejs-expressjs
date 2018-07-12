const Raven = require('raven')
const find = require('find')
const kue = require('kue')
const path = require('path')

const queue = require('../config/queue')
const { normalizeBooleanValue } = require('../helpers/normalizers')

const dispatcher = {}
const workers = {}

const WORKER_FILE_EXTENSION = '.js'
const WORKER_FILE_SUFFIX = 'Worker'

const getWorkerFiles = () => (
  find.fileSync(/Worker\.js$/, './src', [])
)

const bootstrapJobErrorHandler = ({ onError, onFailed, onFailedAttempt }) => {
  queue.on('error', onError)
  queue.on('failed', onFailed)
  queue.on('failed attempt', onFailedAttempt)
}

const bootstrapJobQueueShutdownHandler = ({ onShutdown }) => {
  process.once('SIGTERM', () => {
    queue.shutdown(5000, (err) => {
      onShutdown(err)
      process.exit(0)
    })
  })
}

const bootstrapJobUI = (options) => {
  if (options.initializeUI) {
    kue.app.listen(options.uiPort)
  }
}

const bootstrapDispatcher = async () => {
  const dispatcherFiles = getWorkerFiles()

  dispatcherFiles.forEach((workerFile) => {
    const workerFileBasename = path.basename(workerFile)
    const workerName = workerFileBasename.slice(
      0,
      workerFileBasename.length - WORKER_FILE_SUFFIX.length - WORKER_FILE_EXTENSION.length,
    )

    dispatcher[workerName] = (payload, callback) => {
      queue.create(workerName, payload)
        .attempts(4)
        .backoff({ type: 'exponential' })
        .removeOnComplete(true)
        .ttl(payload.ttl || 4 * 60 * 1000)
        .save(callback)
    }
  })

  return dispatcher
}

const bootstrapWorker = async () => {
  const workerFiles = getWorkerFiles()

  workerFiles.reduce((previousValue, workerFile) => {
    const workerFileBasename = path.basename(workerFile)
    const workerName = workerFileBasename.slice(
      0,
      workerFileBasename.length - WORKER_FILE_SUFFIX.length - WORKER_FILE_EXTENSION.length,
    )

    const workerProcess = queue.process(workerName, 8, async (job, done) => {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const worker = require(require.resolve(path.join(__dirname, '..', workerFile)))

      const { type, data } = job

      try {
        const jobResult = await worker(type, data)

        done(null, jobResult)
      } catch (err) {
        done(err)

        if (normalizeBooleanValue(process.env.SENTRY_ENABLED)) {
          Raven.captureException(err)
        }

        throw err
      }
    })

    workers[workerName] = workerProcess

    return workers
  }, workers)

  return workers
}

const bootstrapWorkers = async (options) => {
  bootstrapJobErrorHandler(options)
  bootstrapJobQueueShutdownHandler(options)
  bootstrapJobUI(options)

  bootstrapWorker()
}

module.exports = {
  bootstrapDispatcher,
  bootstrapWorkers,
  dispatcher,
  workers,
}
