//
// Autogenerated by Thrift Compiler (0.13.0)
//
// DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
//
if (typeof Int64 === 'undefined' && typeof require === 'function') {
  var Int64 = require('node-int64');
}


TDeviceType = {
  'CPU' : 0,
  'GPU' : 1
};
TDatumType = {
  'SMALLINT' : 0,
  'INT' : 1,
  'BIGINT' : 2,
  'FLOAT' : 3,
  'DECIMAL' : 4,
  'DOUBLE' : 5,
  'STR' : 6,
  'TIME' : 7,
  'TIMESTAMP' : 8,
  'DATE' : 9,
  'BOOL' : 10,
  'INTERVAL_DAY_TIME' : 11,
  'INTERVAL_YEAR_MONTH' : 12,
  'POINT' : 13,
  'LINESTRING' : 14,
  'POLYGON' : 15,
  'MULTIPOLYGON' : 16,
  'TINYINT' : 17,
  'GEOMETRY' : 18,
  'GEOGRAPHY' : 19
};
TEncodingType = {
  'NONE' : 0,
  'FIXED' : 1,
  'RL' : 2,
  'DIFF' : 3,
  'DICT' : 4,
  'SPARSE' : 5,
  'GEOINT' : 6,
  'DATE_IN_DAYS' : 7,
  'PACKED_PIXEL_COORD' : 8
};
TTypeInfo = function(args) {
  this.type = null;
  this.encoding = null;
  this.nullable = null;
  this.is_array = null;
  this.precision = null;
  this.scale = null;
  this.comp_param = null;
  this.size = -1;
  if (args) {
    if (args.type !== undefined && args.type !== null) {
      this.type = args.type;
    }
    if (args.encoding !== undefined && args.encoding !== null) {
      this.encoding = args.encoding;
    }
    if (args.nullable !== undefined && args.nullable !== null) {
      this.nullable = args.nullable;
    }
    if (args.is_array !== undefined && args.is_array !== null) {
      this.is_array = args.is_array;
    }
    if (args.precision !== undefined && args.precision !== null) {
      this.precision = args.precision;
    }
    if (args.scale !== undefined && args.scale !== null) {
      this.scale = args.scale;
    }
    if (args.comp_param !== undefined && args.comp_param !== null) {
      this.comp_param = args.comp_param;
    }
    if (args.size !== undefined && args.size !== null) {
      this.size = args.size;
    }
  }
};
TTypeInfo.prototype = {};
TTypeInfo.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    var ret = input.readFieldBegin();
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid) {
      case 1:
      if (ftype == Thrift.Type.I32) {
        this.type = input.readI32().value;
      } else {
        input.skip(ftype);
      }
      break;
      case 4:
      if (ftype == Thrift.Type.I32) {
        this.encoding = input.readI32().value;
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.BOOL) {
        this.nullable = input.readBool().value;
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.BOOL) {
        this.is_array = input.readBool().value;
      } else {
        input.skip(ftype);
      }
      break;
      case 5:
      if (ftype == Thrift.Type.I32) {
        this.precision = input.readI32().value;
      } else {
        input.skip(ftype);
      }
      break;
      case 6:
      if (ftype == Thrift.Type.I32) {
        this.scale = input.readI32().value;
      } else {
        input.skip(ftype);
      }
      break;
      case 7:
      if (ftype == Thrift.Type.I32) {
        this.comp_param = input.readI32().value;
      } else {
        input.skip(ftype);
      }
      break;
      case 8:
      if (ftype == Thrift.Type.I32) {
        this.size = input.readI32().value;
      } else {
        input.skip(ftype);
      }
      break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

TTypeInfo.prototype.write = function(output) {
  output.writeStructBegin('TTypeInfo');
  if (this.type !== null && this.type !== undefined) {
    output.writeFieldBegin('type', Thrift.Type.I32, 1);
    output.writeI32(this.type);
    output.writeFieldEnd();
  }
  if (this.encoding !== null && this.encoding !== undefined) {
    output.writeFieldBegin('encoding', Thrift.Type.I32, 4);
    output.writeI32(this.encoding);
    output.writeFieldEnd();
  }
  if (this.nullable !== null && this.nullable !== undefined) {
    output.writeFieldBegin('nullable', Thrift.Type.BOOL, 2);
    output.writeBool(this.nullable);
    output.writeFieldEnd();
  }
  if (this.is_array !== null && this.is_array !== undefined) {
    output.writeFieldBegin('is_array', Thrift.Type.BOOL, 3);
    output.writeBool(this.is_array);
    output.writeFieldEnd();
  }
  if (this.precision !== null && this.precision !== undefined) {
    output.writeFieldBegin('precision', Thrift.Type.I32, 5);
    output.writeI32(this.precision);
    output.writeFieldEnd();
  }
  if (this.scale !== null && this.scale !== undefined) {
    output.writeFieldBegin('scale', Thrift.Type.I32, 6);
    output.writeI32(this.scale);
    output.writeFieldEnd();
  }
  if (this.comp_param !== null && this.comp_param !== undefined) {
    output.writeFieldBegin('comp_param', Thrift.Type.I32, 7);
    output.writeI32(this.comp_param);
    output.writeFieldEnd();
  }
  if (this.size !== null && this.size !== undefined) {
    output.writeFieldBegin('size', Thrift.Type.I32, 8);
    output.writeI32(this.size);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

