const { ApiError, logError } = require('../../helpers/errors')

test('Log basic error', () => {
  expect(() => {
    logError('basic-error-message')
  }).not.toThrow()
})

test('Log custom error', () => {
  expect(() => {
    logError(new ApiError('custom-error-message'))
  }).not.toThrow()
})

test('Instantiate an error', () => {
  const error = new ApiError()

  expect(error.details.code).toEqual('error')
})

test('Instantiate an error with custom data', () => {
  const errorDetails = {
    testContent: 'basic-error-content',
  }

  const error = new ApiError('custom-error-message', errorDetails)

  expect(error.details.data).toEqual(errorDetails)
})

test('Throw basic error', () => {
  const basicError = new ApiError('basic-error-message')

  expect(() => {
    throw basicError
  }).toThrowError()
})

test('Throw basic error without stacktrace catcher', () => {
  const { captureStackTrace } = Error

  Error.captureStackTrace = undefined

  const basicError = new ApiError('basic-error-message')

  expect(() => {
    throw basicError
  }).toThrowError()

  Error.captureStackTrace = captureStackTrace
})
