/*global Thrift, TMapDException, MapDClient*/

export const CREATE_LINK_ERROR_STRING = 'create_link failed: unknown result'

export function isResultError (result) {
  return (
    result instanceof Thrift.TApplicationException ||
    result instanceof TMapDException ||
    typeof result === 'string'
  )
}

export const isCreateLinkErrorString = (result) => (
  typeof result === 'string' &&
  result === CREATE_LINK_ERROR_STRING
)

export function isCreateLinkError (result) {
  return (
    result instanceof Thrift.TApplicationException ||
    result instanceof TMapDException ||
    isCreateLinkErrorString(result)
  )
}

export function createResultError (result) {
  let errorMessage
  if (result instanceof Thrift.TApplicationException) {
    errorMessage = result.message
  } else if (result instanceof TMapDException) {
    errorMessage = result.error_msg
  } else if (typeof result === 'string') {
    errorMessage = result
  } else {
    errorMessage = 'Unspecified Error'
  }
  return new Error(errorMessage)
}

export function wrapMethod(context, method, isError) {
  return function wrapped (...args) {
    const arity = MapDClient.prototype[method].length
    if (args.length === arity) {
      const callback = args.pop()
      MapDClient.prototype[method].call(context, ...args, (result) => {
        if (isError(result)) {
          callback(createResultError(result))
        } else {
          callback(null, result)
        }
      })
    } else if (args.length === arity - 1) {
      const result = MapDClient.prototype[method].call(context, ...args)
      if (isError(result)) {
        throw createResultError(result)
      }
      return result
    } else {
      throw new Error ('Insufficient arguments to run this method ' + method)
    }
  }
}

export function wrapWithErrorHandling (context, method) {
  return wrapMethod(context, method, isResultError)
}

export function wrapWithCreateLinkErrorHandling (context, method) {
  return wrapMethod(context, method, isCreateLinkError)
}
