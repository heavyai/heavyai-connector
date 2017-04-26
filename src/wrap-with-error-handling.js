/* global Thrift, TMapDException, MapDClient*/

export function isResultError (result) {
  return (
    result instanceof Thrift.TException || result instanceof Error
  )
}

export function createResultError (result) {
  if (result instanceof TMapDException) {
    return new Error(result.error_msg)
  } else if (typeof result.message === "undefined") {
    return new Error("Unspecified Error")
  } else {
    return new Error(result.message)
  }
}

export function wrapMethod (context, method, isError) { // eslint-disable-line consistent-this
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
      throw new Error ("Insufficient arguments to run this method " + method)
    }
  }
}

export function wrapWithErrorHandling (context, method) { // eslint-disable-line consistent-this
  return wrapMethod(context, method, isResultError)
}
