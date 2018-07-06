const cluster = require('cluster')
const find = require('find')
const kue = require('kue')
const os = require('os')
const path = require('path')

const queue = require('../config/queue')

const dispatchers = {}
const workers = {}

const WORKER_FILE_EXTENSION = '.js'
const WORKER_FILE_SUFFIX = 'Worker'

const getWorkerFiles = () => (
  find.fileSync(/Worker\.js$/, './src', [])
)

const bootstrapJobCleaner = () => {
  queue.on('job complete', (id) => {
    kue.Job.get(id, (err, job) => {
      job.remove()
    })
  })
}

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

const bootstrapDispatchers = async () => {
  const dispatcherFiles = getWorkerFiles()

  dispatcherFiles.reduce((previousValue, workerFile) => {
    const workerFileBasename = path.basename(workerFile)
    const workerName = workerFileBasename.slice(
      0,
      workerFileBasename.length - WORKER_FILE_SUFFIX.length - WORKER_FILE_EXTENSION.length,
    )

    dispatchers[workerName] = (payload, callback) => {
      queue.create(workerName, payload).save(callback)
    }

    return dispatchers
  }, dispatchers)

  return dispatchers
}

const bootstrapWorker = async () => {
  const workerFiles = getWorkerFiles()

  workerFiles.reduce((previousValue, workerFile) => {
    const workerFileBasename = path.basename(workerFile)
    const workerName = workerFileBasename.slice(
      0,
      workerFileBasename.length - WORKER_FILE_SUFFIX.length - WORKER_FILE_EXTENSION.length,
    )

    const workerProcess = queue.process(workerName, 10, (job, done) => {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const worker = require(require.resolve(path.join(__dirname, '..', workerFile)))

      const { type, data } = job

      worker({ type, data }, done)
    })

    workers[workerName] = workerProcess

    return workers
  }, workers)

  return workers
}

const bootstrapWorkers = async (options) => {
  if (cluster.isMaster) {
    bootstrapJobCleaner()
    bootstrapJobErrorHandler(options)
    bootstrapJobQueueShutdownHandler(options)

    for (let i = 0; i < os.cpus().length; i += 1) {
      cluster.fork()
    }
  } else {
    bootstrapWorker()
  }
}

module.exports = {
  bootstrapDispatchers,
  bootstrapWorkers,
  dispatchers,
  workers,
}
