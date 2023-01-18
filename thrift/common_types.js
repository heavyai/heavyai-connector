//
// Autogenerated by Thrift Compiler (0.14.1)
//
// DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
//
"use strict";

const thrift = require('thrift');
const Thrift = thrift.Thrift;
const Int64 = require('node-int64');


const ttypes = module.exports = {};
ttypes.TDeviceType = {
  'CPU' : 0,
  'GPU' : 1
};
ttypes.TDatumType = {
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
  'GEOGRAPHY' : 19,
  'MULTIPOINT' : 21
};
ttypes.TEncodingType = {
  'NONE' : 0,
  'FIXED' : 1,
  'RL' : 2,
  'DIFF' : 3,
  'DICT' : 4,
  'SPARSE' : 5,
  'GEOINT' : 6,
  'DATE_IN_DAYS' : 7,
  'ARRAY' : 8,
  'ARRAY_DICT' : 9
};
const TStringDictKey = module.exports.TStringDictKey = class {
  constructor(args) {
    this.db_id = null;
    this.dict_id = null;
    if (args) {
      if (args.db_id !== undefined && args.db_id !== null) {
        this.db_id = args.db_id;
      }
      if (args.dict_id !== undefined && args.dict_id !== null) {
        this.dict_id = args.dict_id;
      }
    }
  }

  read (input) {
    input.readStructBegin();
    while (true) {
      const ret = input.readFieldBegin();
      const ftype = ret.ftype;
      const fid = ret.fid;
      if (ftype == Thrift.Type.STOP) {
        break;
      }
      switch (fid) {
        case 1:
        if (ftype == Thrift.Type.I32) {
          this.db_id = input.readI32();
        } else {
          input.skip(ftype);
        }
        break;
        case 2:
        if (ftype == Thrift.Type.I32) {
          this.dict_id = input.readI32();
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
  }

  write (output) {
    output.writeStructBegin('TStringDictKey');
    if (this.db_id !== null && this.db_id !== undefined) {
      output.writeFieldBegin('db_id', Thrift.Type.I32, 1);
      output.writeI32(this.db_id);
      output.writeFieldEnd();
    }
    if (this.dict_id !== null && this.dict_id !== undefined) {
      output.writeFieldBegin('dict_id', Thrift.Type.I32, 2);
      output.writeI32(this.dict_id);
      output.writeFieldEnd();
    }
    output.writeFieldStop();
    output.writeStructEnd();
    return;
  }

};
const TTypeInfo = module.exports.TTypeInfo = class {
  constructor(args) {
    this.type = null;
    this.encoding = null;
    this.nullable = null;
    this.is_array = null;
    this.precision = null;
    this.scale = null;
    this.comp_param = null;
    this.size = -1;
    this.dict_key = null;
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
      if (args.dict_key !== undefined && args.dict_key !== null) {
        this.dict_key = new ttypes.TStringDictKey(args.dict_key);
      }
    }
  }

  read (input) {
    input.readStructBegin();
    while (true) {
      const ret = input.readFieldBegin();
      const ftype = ret.ftype;
      const fid = ret.fid;
      if (ftype == Thrift.Type.STOP) {
        break;
      }
      switch (fid) {
        case 1:
        if (ftype == Thrift.Type.I32) {
          this.type = input.readI32();
        } else {
          input.skip(ftype);
        }
        break;
        case 4:
        if (ftype == Thrift.Type.I32) {
          this.encoding = input.readI32();
        } else {
          input.skip(ftype);
        }
        break;
        case 2:
        if (ftype == Thrift.Type.BOOL) {
          this.nullable = input.readBool();
        } else {
          input.skip(ftype);
        }
        break;
        case 3:
        if (ftype == Thrift.Type.BOOL) {
          this.is_array = input.readBool();
        } else {
          input.skip(ftype);
        }
        break;
        case 5:
        if (ftype == Thrift.Type.I32) {
          this.precision = input.readI32();
        } else {
          input.skip(ftype);
        }
        break;
        case 6:
        if (ftype == Thrift.Type.I32) {
          this.scale = input.readI32();
        } else {
          input.skip(ftype);
        }
        break;
        case 7:
        if (ftype == Thrift.Type.I32) {
          this.comp_param = input.readI32();
        } else {
          input.skip(ftype);
        }
        break;
        case 8:
        if (ftype == Thrift.Type.I32) {
          this.size = input.readI32();
        } else {
          input.skip(ftype);
        }
        break;
        case 9:
        if (ftype == Thrift.Type.STRUCT) {
          this.dict_key = new ttypes.TStringDictKey();
          this.dict_key.read(input);
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
  }

  write (output) {
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
    if (this.dict_key !== null && this.dict_key !== undefined) {
      output.writeFieldBegin('dict_key', Thrift.Type.STRUCT, 9);
      this.dict_key.write(output);
      output.writeFieldEnd();
    }
    output.writeFieldStop();
    output.writeStructEnd();
    return;
  }

};
