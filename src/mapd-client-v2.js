/*global MapDClient*/

import {
  wrapWithCreateLinkErrorHandling,
  wrapWithErrorHandling
} from './wrap-with-error-handling'

export default function MapDClientV2 (protocol) {
  MapDClient.call(this, protocol)
}

MapDClientV2.prototype = Object.create(MapDClient.prototype)

MapDClientV2.prototype.sql_execute = function (...args) {
  const SQLExecuteWithErrorHandling = wrapWithErrorHandling(this, 'sql_execute')
  return SQLExecuteWithErrorHandling(...args)
}

MapDClientV2.prototype.render = function (...args) {
  const renderWithErrorHandling = wrapWithErrorHandling(this, 'render')
  return renderWithErrorHandling(...args)
}

MapDClientV2.prototype.delete_frontend_view = function (...args) {
  const deleteFrontendViewWithErrorHandling = wrapWithErrorHandling(this, 'delete_frontend_view')
  return deleteFrontendViewWithErrorHandling(...args)
}

MapDClientV2.prototype.get_tables = function (...args) {
  const getTablesWithErrorHandling = wrapWithErrorHandling(this, 'get_tables')
  return getTablesWithErrorHandling(...args)
}

MapDClientV2.prototype.get_frontend_views = function (...args) {
  const getFrontEndViewsWithErrorHandling = wrapWithErrorHandling(this, 'get_frontend_views')
  return getFrontEndViewsWithErrorHandling(...args)
}

MapDClientV2.prototype.get_frontend_view = function (...args) {
  const getFrontEndViewWithErrorHandling = wrapWithErrorHandling(this, 'get_frontend_view')
  return getFrontEndViewWithErrorHandling(...args)
}

MapDClientV2.prototype.create_link = function (...args) {
  const createLinkWithErrorHandling = wrapWithCreateLinkErrorHandling(this, 'create_link')
  return createLinkWithErrorHandling(...args)
}

MapDClientV2.prototype.create_frontend_view = function (...args) {
  const createFrontEndViewWithErrorHandling = wrapWithErrorHandling(this, 'create_frontend_view')
  return createFrontEndViewWithErrorHandling(...args)
}
