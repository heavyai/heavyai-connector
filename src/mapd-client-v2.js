const MapDClient =
  (typeof window !== "undefined" && window.MapDClient) ||
  require("../build/thrift/node/mapd.thrift.js").Client // eslint-disable-line global-require

import { wrapWithErrorHandling } from "./wrap-with-error-handling"

export default function MapDClientV2(protocol) {
  MapDClient.call(this, protocol)
}

MapDClientV2.prototype = Object.create(MapDClient.prototype)

MapDClientV2.prototype.connect = function(...args) {
  const connectWithErrorHandling = wrapWithErrorHandling(this, "connect")
  return connectWithErrorHandling(...args)
}

MapDClientV2.prototype.sql_execute = function(...args) {
  const SQLExecuteWithErrorHandling = wrapWithErrorHandling(this, "sql_execute")
  return SQLExecuteWithErrorHandling(...args)
}

MapDClientV2.prototype.sql_validate = function(...args) {
  const SQLValidateWithErrorHandling = wrapWithErrorHandling(
    this,
    "sql_validate"
  )
  return SQLValidateWithErrorHandling(...args)
}

MapDClientV2.prototype.render = function(...args) {
  const renderWithErrorHandling = wrapWithErrorHandling(this, "render")
  return renderWithErrorHandling(...args)
}

/* istanbul ignore next */
MapDClientV2.prototype.render_vega = function(...args) {
  const renderVegaWithErrorHandling = wrapWithErrorHandling(this, "render_vega")
  return renderVegaWithErrorHandling(...args)
}

MapDClientV2.prototype.get_result_row_for_pixel = function(...args) {
  const getResultRowForPixelWithErrorHandling = wrapWithErrorHandling(
    this,
    "get_result_row_for_pixel"
  )
  return getResultRowForPixelWithErrorHandling(...args)
}

MapDClientV2.prototype.delete_frontend_view = function(...args) {
  const deleteFrontendViewWithErrorHandling = wrapWithErrorHandling(
    this,
    "delete_frontend_view"
  )
  return deleteFrontendViewWithErrorHandling(...args)
}

MapDClientV2.prototype.get_completion_hints = function(...args) {
  const getCompletionHintsWithErrorHandling = wrapWithErrorHandling(
    this,
    "get_completion_hints"
  )
  return getCompletionHintsWithErrorHandling(...args)
}

MapDClientV2.prototype.get_tables = function(...args) {
  const getTablesWithErrorHandling = wrapWithErrorHandling(this, "get_tables")
  return getTablesWithErrorHandling(...args)
}

MapDClientV2.prototype.get_table_details = function(...args) {
  const getTableDetailsWithErrorHandling = wrapWithErrorHandling(
    this,
    "get_table_details"
  )
  return getTableDetailsWithErrorHandling(...args)
}

MapDClientV2.prototype.get_tables_meta = function(...args) {
  const getTablesWithMetaWithErrorHandling = wrapWithErrorHandling(
    this,
    "get_tables_meta"
  )
  return getTablesWithMetaWithErrorHandling(...args)
}

MapDClientV2.prototype.get_fields = function(...args) {
  const getFieldsWithErrorHandling = wrapWithErrorHandling(this, "get_fields")
  return getFieldsWithErrorHandling(...args)
}

MapDClientV2.prototype.get_status = function(...args) {
  const getStatusWithErrorHandling = wrapWithErrorHandling(this, "get_status")
  return getStatusWithErrorHandling(...args)
}

MapDClientV2.prototype.get_server_status = function(...args) {
  const getServerStatusWithErrorHandling = wrapWithErrorHandling(
    this,
    "get_server_status"
  )
  return getServerStatusWithErrorHandling(...args)
}

MapDClientV2.prototype.get_hardware_info = function(...args) {
  const getHardwareInfoWithErrorHandling = wrapWithErrorHandling(
    this,
    "get_hardware_info"
  )
  return getHardwareInfoWithErrorHandling(...args)
}

MapDClientV2.prototype.get_frontend_views = function(...args) {
  const getFrontEndViewsWithErrorHandling = wrapWithErrorHandling(
    this,
    "get_frontend_views"
  )
  return getFrontEndViewsWithErrorHandling(...args)
}

MapDClientV2.prototype.get_frontend_view = function(...args) {
  const getFrontEndViewWithErrorHandling = wrapWithErrorHandling(
    this,
    "get_frontend_view"
  )
  return getFrontEndViewWithErrorHandling(...args)
}

MapDClientV2.prototype.create_link = function(...args) {
  const createLinkWithErrorHandling = wrapWithErrorHandling(this, "create_link")
  return createLinkWithErrorHandling(...args)
}

MapDClientV2.prototype.get_link_view = function(...args) {
  const getLinkViewWithErrorHandling = wrapWithErrorHandling(
    this,
    "get_link_view"
  )
  return getLinkViewWithErrorHandling(...args)
}

MapDClientV2.prototype.detect_column_types = function(...args) {
  const detectColumnTypesWithErrorHandling = wrapWithErrorHandling(
    this,
    "detect_column_types"
  )
  return detectColumnTypesWithErrorHandling(...args)
}

MapDClientV2.prototype.create_frontend_view = function(...args) {
  const createFrontEndViewWithErrorHandling = wrapWithErrorHandling(
    this,
    "create_frontend_view"
  )
  return createFrontEndViewWithErrorHandling(...args)
}

MapDClientV2.prototype.send_create_table = function(...args) {
  const sendCreateTableWithErrorHandling = wrapWithErrorHandling(
    this,
    "send_create_table"
  )
  return sendCreateTableWithErrorHandling(...args)
}

MapDClientV2.prototype.send_import_table = function(...args) {
  const sendImportTableWithErrorHandling = wrapWithErrorHandling(
    this,
    "send_import_table"
  )
  return sendImportTableWithErrorHandling(...args)
}

MapDClientV2.prototype.detect_column_types = function(...args) {
  const detectColumnTypesWithErrorHandling = wrapWithErrorHandling(
    this,
    "detect_column_types"
  )
  return detectColumnTypesWithErrorHandling(...args)
}
