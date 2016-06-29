
export default function MapDClientWithErrorHandling (protocol) {
  MapDClient.call(this, protocol)
}

MapDClientWithErrorHandling.prototype = Object.create(MapDClient.prototype)

function isError (result) {
  return result instanceof Thrift.TApplicationException || typeof result === 'string'
}

function createResultError (result) {
  let errorMessage
  if (result instanceof Thrift.TApplicationException) {
    errorMessage = result.message
  } else if (typeof result === 'string') {
    errorMessage = result
  } else {
    errorMessage = 'Unspecified Error'
  }
  return new Error(errorMessage)
}

MapDClientWithErrorHandling.prototype.sql_execute = function (session, query, column_format, nonce, callback) {
  const sqlExecute = MapDClient.prototype.sql_execute.bind(this, session, query, column_format, nonce)
  if (!callback) {
    const result = sqlExecute()
    if (isError(result)) {
      throw createResultError(result)
    }
    return result
  } else {
    sqlExecute((result) => {
      if (isError(result)) {
        callback(createResultError(result))
      } else {
        callback(null, result)
      }
    })
  }
}

MapDClientWithErrorHandling.prototype.render = function (session, query, render_type, nonce, callback) {
  const render = MapDClient.prototype.render.bind(this, session, query, render_type, nonce)
  if (!callback) {
    const result = render()
    if (isError(result)) {
      throw createResultError(result)
    }
    return result
  } else {
    render((result) => {
      if (isError(result)) {
        callback(createResultError(result))
      } else {
        callback(null, result)
      }
    })
  }
}
