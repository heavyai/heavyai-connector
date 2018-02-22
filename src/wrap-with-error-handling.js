const MapDClient =
  (typeof window !== "undefined" && window.MapDClient) ||
  require("../build/thrift/node/mapd.thrift.js").Client // eslint-disable-line global-require
const TMapDException =
  (typeof window !== "undefined" && window.TMapDException) ||
  require("../build/thrift/node/mapd_types.js").TMapDException // eslint-disable-line global-require
const Thrift =
  (typeof window !== "undefined" && window.Thrift) || require("thrift").Thrift // eslint-disable-line global-require

export function isResultError(result) {
  return result instanceof Thrift.TException || result instanceof Error
}

export function createResultError(result) {
  if (result instanceof TMapDException) {
    return new Error(result.error_msg)
  } else if (typeof result.message === "undefined") {
    return new Error("Unspecified Error")
  } else {
    return new Error(result.message)
  }
}

/* eslint-disable consistent-this */
export function wrapMethod(context, method, isError) {
  return function wrapped(...args) {
    const arity = MapDClient.prototype[method].length
    if (args.length === arity) {
      const callback = args.pop()
      MapDClient.prototype[method].call(context, ...args, result => {
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
      throw new Error("Insufficient arguments to run this method " + method)
    }
  }
}

export function wrapWithErrorHandling(context, method) {
  return wrapMethod(context, method, isResultError)
}
/* eslint-enable consistent-this */
