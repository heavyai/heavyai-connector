/**
 * The configuration needed to import a table into MapD.
 * See {@link detectColumnTypes} for usage example.
 * @typedef {TCopyParams} TCopyParams
 * @property {String} array_begin=null
 * @property {String} array_delim=null
 * @property {String} array_end=null
 * @property {String} delimiter="" - The character delimiter (eg:  comma, [TAB], or pipe)
 * @property {String} escape=null
 * @property {Boolean} has_header=null
 * @property {String} line_delim=null
 * @property {String} null_str="" - The token used by the table to express a null value (eg: some systems use 'nil' or 'none')
 * @property {String} quote=null
 * @property {Boolean} quoted=true - Indicates whether the String fields should be wrapped in quotes
 * @property {Number} threads=null
 */

/**
 * The data stored for a given dashboard.
 * @typedef {TFrontendView} TFrontendView
 * @property {String} image_hash - The lookup hash for the dashboard thumbnail image
 * @property {String} update_time - The timestamp from the last saved update
 * @property {String} view_name - The name of the dashboard or the shortened share link hash
 * @property {String} view_state - The base64-encoded string containing all the details about the current state of the dashboard
 */

/**
 * The permissions granted by the server.
 * @typedef {TServerStatus} TServerStatus
 * @property {Boolean} read_only - Indicates whether server accepts write operations, eg: save dashboard
 * @property {Boolean} rendering_enabled - Indicates whether the server has backend rendering enabled
 * @property {String} version - the current version
 */

/**
 * Contains parsed table data.
 * @typedef {TRowSet} TRowSet
 * @property {Array} columns 
 * @property {Boolean} is_columnar 
 * @property {Array<TColumnType>} row_desc - A list of field names and their associated information.
 * @property {Array<TRow>} rows
 */

/**
 * @typedef {TColumnType} TColumnType
 * @property {String} col_name - The name of the table field
 * @property {TTypeInfo} col_type - The information about the field
 */

/**
 * A row of data in a table.
 * @typedef {TRow} TRow
 * @property {Array<TDatum>} cols - The array of individual data cells in a table.
 */

/**
 * The value and state of an individual data cell in a table.
 * @typedef {TDatum} TDatum
 * @property {Boolean} is_null
 * @property {TDatumVal} val
 */

/**
 * The value of an individual cell in a table.
 * @typedef {TDatumVal} TDatumVal
 * @property {Array} arr_val
 * @property {Number} int_val
 * @property {Number} real_val
 * @property {String} str_val
 */

/**
 * The information about a particular field in a given table. 
 * @typedef {TTypeInfo} TTypeInfo
 * @property {Number} encoding
 * @property {Boolean} is_array
 * @property {Boolean} nullable
 * @property {Number} type
 */

/**
 * Contains the result from calling {@link detectColumnTypes}.
 * @typedef {TDetectResult} TDetectResult
 * @property {TCopyParams} copy_params
 * @property {TRowSet} row_set
 */
