/*global MapDClient, Thrift*/

// Subclass with error handling

export default function MapDClientV2 (protocol) {
  MapDClient.call(this, protocol)
}

// Methods wrapped with error handling

MapDClientV2.prototype = Object.create(MapDClient.prototype)

MapDClientV2.prototype.sql_execute = function (...args) {
  const SQLExecuteWithErrorHandling = wrapMapDMethodWithErrorHanding(this, 'sql_execute')
  return SQLExecuteWithErrorHandling(...args)
}

MapDClientV2.prototype.render = function (...args) {
  const renderWithErrorHandling = wrapMapDMethodWithErrorHanding(this, 'render')
  return renderWithErrorHandling(...args)
}

MapDClientV2.prototype.delete_frontend_view = function (...args) {
  const deleteFrontendViewWithErrorHandling = wrapMapDMethodWithErrorHanding(this, 'delete_frontend_view')
  return deleteFrontendViewWithErrorHandling(...args)
}

MapDClientV2.prototype.get_tables = function (...args) {
  const getTablesWithErrorHandling = wrapMapDMethodWithErrorHanding(this, 'get_tables')
  return getTablesWithErrorHandling(...args)
}

MapDClientV2.prototype.get_frontend_views = function (...args) {
  const getFrontEndViewsWithErrorHandling = wrapMapDMethodWithErrorHanding(this, 'get_frontend_views')
  return getFrontEndViewsWithErrorHandling(...args)
}

MapDClientV2.prototype.get_frontend_view = function (...args) {
  const getFrontEndViewWithErrorHandling = wrapMapDMethodWithErrorHanding(this, 'get_frontend_view')
  return getFrontEndViewWithErrorHandling(...args)
}

MapDClientV2.prototype.create_link = function (...args) {
  const createLinkWithErrorHandling = wrapMapDMethodWithErrorHanding(this, 'create_link')
  return createLinkWithErrorHandling(...args)
}

MapDClientV2.prototype.create_frontend_view = function (...args) {
  const createFrontEndViewWithErrorHandling = wrapMapDMethodWithErrorHanding(this, 'create_frontend_view')
  return createFrontEndViewWithErrorHandling(...args)
}

// Helper functions

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

function wrapMapDMethodWithErrorHanding (context, method) {
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
