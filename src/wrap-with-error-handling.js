/*global Thrift, TMapDException, MapDClient*/

export function isResultError (result) {
  return (
    result instanceof Thrift.TException ||
    result instanceof Error
  )
}

export function createResultError (result) {
  let errorMessage
  if (result instanceof TMapDException) {
    errorMessage = result.error_msg
  } else if (result.message !== undefined) {
    errorMessage = result.message
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
