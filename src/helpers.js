export const convertObjectToThriftCopyParams = obj => new TCopyParams(obj) // eslint-disable-line no-undef

export const mutateThriftRowDesc = (rowDescArray, thriftRowDescArray) => {
  rowDescArray.forEach((obj, i) => {
    thriftRowDescArray[i].col_name = obj.clean_col_name
    thriftRowDescArray[i].col_type.encoding = obj.col_type.encoding
    thriftRowDescArray[i].col_type.precision = obj.col_type.precision
    thriftRowDescArray[i].col_type.comp_param = obj.col_type.comp_param
    thriftRowDescArray[i].col_type.scale = obj.col_type.scale
    thriftRowDescArray[i].col_type.type = obj.col_type.type
  })
  return thriftRowDescArray
}
