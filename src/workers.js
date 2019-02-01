const Arena = require('bull-arena')
const Queue = require('bull')
const Raven = require('raven')
const find = require('find')
const path = require('path')

const queueConfig = require('../config/queue')
const { normalizeBooleanValue } = require('../helpers/normalizers')

const dispatchers = {}

const WORKER_CONCURRENCY = 6
const WORKER_FILE_EXTENSION = '.js'
const WORKER_FILE_SUFFIX = 'Worker'

const getWorkerFiles = () => find.fileSync(/Worker\.js$/, './src', [])

const bootstrapDispatchers = async () => {
  const dispatcherFiles = getWorkerFiles()

  dispatcherFiles.forEach((workerFile) => {
    const workerFileBasename = path.basename(workerFile)
    const workerName = workerFileBasename.slice(
      0,
      workerFileBasename.length -
        WORKER_FILE_SUFFIX.length -
        WORKER_FILE_EXTENSION.length,
    )

    const queue = new Queue(workerName, queueConfig)
    dispatchers[workerName] = (payload) => {
      queue.add(payload, {
        attempts: 4,
        backoff: { type: 'exponential' },
        removeOnComplete: true,
      })
    }
  })

  return dispatchers
}

const bootstrapWorkerUI = (port) => {
  Arena(
    {
      queues: getWorkerFiles().map((workerFile) => {
        const workerFileBasename = path.basename(workerFile)
        const workerName = workerFileBasename.slice(
          0,
          workerFileBasename.length -
            WORKER_FILE_SUFFIX.length -
            WORKER_FILE_EXTENSION.length,
        )

        return {
          name: workerName,
          hostId: 'worker',
          ...queueConfig,
        }
      }),
    },
    { port },
  )
}

const bootstrapWorkers = async ({ onError, onFailed }) => {
  const workerFiles = getWorkerFiles()

  workerFiles.forEach((workerFile) => {
    const workerFileBasename = path.basename(workerFile)
    const workerName = workerFileBasename.slice(
      0,
      workerFileBasename.length -
        WORKER_FILE_SUFFIX.length -
        WORKER_FILE_EXTENSION.length,
    )

    const queue = new Queue(workerName, queueConfig)
    queue.on('error', onError)
    queue.on('failed', onFailed)

    queue.process(WORKER_CONCURRENCY, async (job, done) => {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const worker = require(require.resolve(
        path.join(__dirname, '..', workerFile),
      ))

      const { name, data } = job

      try {
        const jobResult = await worker(name, data)

        done(null, jobResult)
      } catch (err) {
        done(err)

        if (normalizeBooleanValue(process.env.SENTRY_ENABLED)) {
          Raven.captureException(err)
        }

        throw err
      }
    })
  })
}

module.exports = {
  bootstrapDispatchers,
  bootstrapWorkerUI,
  bootstrapWorkers,
  dispatchers,
}
