/*global MapDClient, Thrift*/

export default function MapDClientV2 (protocol) {
  MapDClient.call(this, protocol)
}

MapDClientV2.prototype = Object.create(MapDClient.prototype)

MapDClientV2.prototype.sql_execute = function (...args) {
  const SQLExecuteWithErrorHandling = wrapMapDMethodWithErrorHanding(this, 'sql_execute', 5)
  return SQLExecuteWithErrorHandling(...args)
}

MapDClientV2.prototype.render = function (...args) {
  const renderWithErrorHandling = wrapMapDMethodWithErrorHanding(this, 'render', 5)
  return renderWithErrorHandling(...args)
}

function isError (result) {
  return (
    result instanceof Thrift.TApplicationException ||
    result instanceof TMapDException ||
    typeof result === 'string'
  )
}

function createResultError (result) {
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

function wrapMapDMethodWithErrorHanding (context, method, arity) {
  return function wrapped (...args) {
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
