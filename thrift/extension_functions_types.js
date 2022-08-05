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
ttypes.TExtArgumentType = {
  'Int8' : 0,
  'Int16' : 1,
  'Int32' : 2,
  'Int64' : 3,
  'Float' : 4,
  'Double' : 5,
  'Void' : 6,
  'PInt8' : 7,
  'PInt16' : 8,
  'PInt32' : 9,
  'PInt64' : 10,
  'PFloat' : 11,
  'PDouble' : 12,
  'PBool' : 13,
  'Bool' : 14,
  'ArrayInt8' : 15,
  'ArrayInt16' : 16,
  'ArrayInt32' : 17,
  'ArrayInt64' : 18,
  'ArrayFloat' : 19,
  'ArrayDouble' : 20,
  'ArrayBool' : 21,
  'GeoPoint' : 22,
  'GeoLineString' : 23,
  'Cursor' : 24,
  'GeoPolygon' : 25,
  'GeoMultiPolygon' : 26,
  'ColumnInt8' : 27,
  'ColumnInt16' : 28,
  'ColumnInt32' : 29,
  'ColumnInt64' : 30,
  'ColumnFloat' : 31,
  'ColumnDouble' : 32,
  'ColumnBool' : 33,
  'TextEncodingNone' : 34,
  'TextEncodingDict' : 35,
  'ColumnListInt8' : 36,
  'ColumnListInt16' : 37,
  'ColumnListInt32' : 38,
  'ColumnListInt64' : 39,
  'ColumnListFloat' : 40,
  'ColumnListDouble' : 41,
  'ColumnListBool' : 42,
  'ColumnTextEncodingDict' : 43,
  'ColumnListTextEncodingDict' : 44,
  'ColumnTimestamp' : 45,
  'Timestamp' : 46,
  'ColumnArrayInt8' : 47,
  'ColumnArrayInt16' : 48,
  'ColumnArrayInt32' : 49,
  'ColumnArrayInt64' : 50,
  'ColumnArrayFloat' : 51,
  'ColumnArrayDouble' : 52,
  'ColumnArrayBool' : 53,
  'ColumnListArrayInt8' : 54,
  'ColumnListArrayInt16' : 55,
  'ColumnListArrayInt32' : 56,
  'ColumnListArrayInt64' : 57,
  'ColumnListArrayFloat' : 58,
  'ColumnListArrayDouble' : 59,
  'ColumnListArrayBool' : 60,
  'GeoMultiLineString' : 61,
  'ArrayTextEncodingNone' : 62,
  'ColumnTextEncodingNone' : 63,
  'ColumnListTextEncodingNone' : 64,
  'ColumnArrayTextEncodingNone' : 65,
  'ColumnListArrayTextEncodingNone' : 66,
  'ArrayTextEncodingDict' : 67,
  'ColumnArrayTextEncodingDict' : 68,
  'ColumnListArrayTextEncodingDict' : 69,
  'GeoMultiPoint' : 70
};
ttypes.TOutputBufferSizeType = {
  'kConstant' : 0,
  'kUserSpecifiedConstantParameter' : 1,
  'kUserSpecifiedRowMultiplier' : 2,
  'kTableFunctionSpecifiedParameter' : 3,
  'kPreFlightParameter' : 4
};
const TUserDefinedFunction = module.exports.TUserDefinedFunction = class {
  constructor(args) {
    this.name = null;
    this.argTypes = null;
    this.retType = null;
    if (args) {
      if (args.name !== undefined && args.name !== null) {
        this.name = args.name;
      }
      if (args.argTypes !== undefined && args.argTypes !== null) {
        this.argTypes = Thrift.copyList(args.argTypes, [null]);
      }
      if (args.retType !== undefined && args.retType !== null) {
        this.retType = args.retType;
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
        if (ftype == Thrift.Type.STRING) {
          this.name = input.readString();
        } else {
          input.skip(ftype);
        }
        break;
        case 2:
        if (ftype == Thrift.Type.LIST) {
          this.argTypes = [];
          const _rtmp31 = input.readListBegin();
          const _size0 = _rtmp31.size || 0;
          for (let _i2 = 0; _i2 < _size0; ++_i2) {
            let elem3 = null;
            elem3 = input.readI32();
            this.argTypes.push(elem3);
          }
          input.readListEnd();
        } else {
          input.skip(ftype);
        }
        break;
        case 3:
        if (ftype == Thrift.Type.I32) {
          this.retType = input.readI32();
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
    output.writeStructBegin('TUserDefinedFunction');
    if (this.name !== null && this.name !== undefined) {
      output.writeFieldBegin('name', Thrift.Type.STRING, 1);
      output.writeString(this.name);
      output.writeFieldEnd();
    }
    if (this.argTypes !== null && this.argTypes !== undefined) {
      output.writeFieldBegin('argTypes', Thrift.Type.LIST, 2);
      output.writeListBegin(Thrift.Type.I32, this.argTypes.length);
      for (let iter4 in this.argTypes) {
        if (this.argTypes.hasOwnProperty(iter4)) {
          iter4 = this.argTypes[iter4];
          output.writeI32(iter4);
        }
      }
      output.writeListEnd();
      output.writeFieldEnd();
    }
    if (this.retType !== null && this.retType !== undefined) {
      output.writeFieldBegin('retType', Thrift.Type.I32, 3);
      output.writeI32(this.retType);
      output.writeFieldEnd();
    }
    output.writeFieldStop();
    output.writeStructEnd();
    return;
  }

};
const TUserDefinedTableFunction = module.exports.TUserDefinedTableFunction = class {
  constructor(args) {
    this.name = null;
    this.sizerType = null;
    this.sizerArgPos = null;
    this.inputArgTypes = null;
    this.outputArgTypes = null;
    this.sqlArgTypes = null;
    this.annotations = null;
    if (args) {
      if (args.name !== undefined && args.name !== null) {
        this.name = args.name;
      }
      if (args.sizerType !== undefined && args.sizerType !== null) {
        this.sizerType = args.sizerType;
      }
      if (args.sizerArgPos !== undefined && args.sizerArgPos !== null) {
        this.sizerArgPos = args.sizerArgPos;
      }
      if (args.inputArgTypes !== undefined && args.inputArgTypes !== null) {
        this.inputArgTypes = Thrift.copyList(args.inputArgTypes, [null]);
      }
      if (args.outputArgTypes !== undefined && args.outputArgTypes !== null) {
        this.outputArgTypes = Thrift.copyList(args.outputArgTypes, [null]);
      }
      if (args.sqlArgTypes !== undefined && args.sqlArgTypes !== null) {
        this.sqlArgTypes = Thrift.copyList(args.sqlArgTypes, [null]);
      }
      if (args.annotations !== undefined && args.annotations !== null) {
        this.annotations = Thrift.copyList(args.annotations, [Thrift.copyMap, null]);
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
        if (ftype == Thrift.Type.STRING) {
          this.name = input.readString();
        } else {
          input.skip(ftype);
        }
        break;
        case 2:
        if (ftype == Thrift.Type.I32) {
          this.sizerType = input.readI32();
        } else {
          input.skip(ftype);
        }
        break;
        case 3:
        if (ftype == Thrift.Type.I32) {
          this.sizerArgPos = input.readI32();
        } else {
          input.skip(ftype);
        }
        break;
        case 4:
        if (ftype == Thrift.Type.LIST) {
          this.inputArgTypes = [];
          const _rtmp36 = input.readListBegin();
          const _size5 = _rtmp36.size || 0;
          for (let _i7 = 0; _i7 < _size5; ++_i7) {
            let elem8 = null;
            elem8 = input.readI32();
            this.inputArgTypes.push(elem8);
          }
          input.readListEnd();
        } else {
          input.skip(ftype);
        }
        break;
        case 5:
        if (ftype == Thrift.Type.LIST) {
          this.outputArgTypes = [];
          const _rtmp310 = input.readListBegin();
          const _size9 = _rtmp310.size || 0;
          for (let _i11 = 0; _i11 < _size9; ++_i11) {
            let elem12 = null;
            elem12 = input.readI32();
            this.outputArgTypes.push(elem12);
          }
          input.readListEnd();
        } else {
          input.skip(ftype);
        }
        break;
        case 6:
        if (ftype == Thrift.Type.LIST) {
          this.sqlArgTypes = [];
          const _rtmp314 = input.readListBegin();
          const _size13 = _rtmp314.size || 0;
          for (let _i15 = 0; _i15 < _size13; ++_i15) {
            let elem16 = null;
            elem16 = input.readI32();
            this.sqlArgTypes.push(elem16);
          }
          input.readListEnd();
        } else {
          input.skip(ftype);
        }
        break;
        case 7:
        if (ftype == Thrift.Type.LIST) {
          this.annotations = [];
          const _rtmp318 = input.readListBegin();
          const _size17 = _rtmp318.size || 0;
          for (let _i19 = 0; _i19 < _size17; ++_i19) {
            let elem20 = null;
            elem20 = {};
            const _rtmp322 = input.readMapBegin();
            const _size21 = _rtmp322.size || 0;
            for (let _i23 = 0; _i23 < _size21; ++_i23) {
              let key24 = null;
              let val25 = null;
              key24 = input.readString();
              val25 = input.readString();
              elem20[key24] = val25;
            }
            input.readMapEnd();
            this.annotations.push(elem20);
          }
          input.readListEnd();
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
    output.writeStructBegin('TUserDefinedTableFunction');
    if (this.name !== null && this.name !== undefined) {
      output.writeFieldBegin('name', Thrift.Type.STRING, 1);
      output.writeString(this.name);
      output.writeFieldEnd();
    }
    if (this.sizerType !== null && this.sizerType !== undefined) {
      output.writeFieldBegin('sizerType', Thrift.Type.I32, 2);
      output.writeI32(this.sizerType);
      output.writeFieldEnd();
    }
    if (this.sizerArgPos !== null && this.sizerArgPos !== undefined) {
      output.writeFieldBegin('sizerArgPos', Thrift.Type.I32, 3);
      output.writeI32(this.sizerArgPos);
      output.writeFieldEnd();
    }
    if (this.inputArgTypes !== null && this.inputArgTypes !== undefined) {
      output.writeFieldBegin('inputArgTypes', Thrift.Type.LIST, 4);
      output.writeListBegin(Thrift.Type.I32, this.inputArgTypes.length);
      for (let iter26 in this.inputArgTypes) {
        if (this.inputArgTypes.hasOwnProperty(iter26)) {
          iter26 = this.inputArgTypes[iter26];
          output.writeI32(iter26);
        }
      }
      output.writeListEnd();
      output.writeFieldEnd();
    }
    if (this.outputArgTypes !== null && this.outputArgTypes !== undefined) {
      output.writeFieldBegin('outputArgTypes', Thrift.Type.LIST, 5);
      output.writeListBegin(Thrift.Type.I32, this.outputArgTypes.length);
      for (let iter27 in this.outputArgTypes) {
        if (this.outputArgTypes.hasOwnProperty(iter27)) {
          iter27 = this.outputArgTypes[iter27];
          output.writeI32(iter27);
        }
      }
      output.writeListEnd();
      output.writeFieldEnd();
    }
    if (this.sqlArgTypes !== null && this.sqlArgTypes !== undefined) {
      output.writeFieldBegin('sqlArgTypes', Thrift.Type.LIST, 6);
      output.writeListBegin(Thrift.Type.I32, this.sqlArgTypes.length);
      for (let iter28 in this.sqlArgTypes) {
        if (this.sqlArgTypes.hasOwnProperty(iter28)) {
          iter28 = this.sqlArgTypes[iter28];
          output.writeI32(iter28);
        }
      }
      output.writeListEnd();
      output.writeFieldEnd();
    }
    if (this.annotations !== null && this.annotations !== undefined) {
      output.writeFieldBegin('annotations', Thrift.Type.LIST, 7);
      output.writeListBegin(Thrift.Type.MAP, this.annotations.length);
      for (let iter29 in this.annotations) {
        if (this.annotations.hasOwnProperty(iter29)) {
          iter29 = this.annotations[iter29];
          output.writeMapBegin(Thrift.Type.STRING, Thrift.Type.STRING, Thrift.objectLength(iter29));
          for (let kiter30 in iter29) {
            if (iter29.hasOwnProperty(kiter30)) {
              let viter31 = iter29[kiter30];
              output.writeString(kiter30);
              output.writeString(viter31);
            }
          }
          output.writeMapEnd();
        }
      }
      output.writeListEnd();
      output.writeFieldEnd();
    }
    output.writeFieldStop();
    output.writeStructEnd();
    return;
  }

};
