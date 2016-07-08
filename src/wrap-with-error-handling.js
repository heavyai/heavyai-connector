/*global Thrift*/

export function isError (result) {
  return (
    result instanceof Thrift.TApplicationException ||
    result instanceof TMapDException ||
    typeof result === 'string'
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

export default function wrapWithErrorHandling (context, method) {
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
