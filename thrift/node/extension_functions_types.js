//
// Autogenerated by Thrift Compiler (0.13.0)
//
// DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
//
"use strict";

var thrift = require('thrift');
var Thrift = thrift.Thrift;
var Q = thrift.Q;
var Int64 = require('node-int64');


var ttypes = module.exports = {};
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
  'ColumnBool' : 33
};
ttypes.TOutputBufferSizeType = {
  'kConstant' : 0,
  'kUserSpecifiedConstantParameter' : 1,
  'kUserSpecifiedRowMultiplier' : 2
};
var TUserDefinedFunction = module.exports.TUserDefinedFunction = function(args) {
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
};
TUserDefinedFunction.prototype = {};
TUserDefinedFunction.prototype.read = function(input) {
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
      if (ftype == Thrift.Type.STRING) {
        this.name = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.LIST) {
        this.argTypes = [];
        var _rtmp31 = input.readListBegin();
        var _size0 = _rtmp31.size || 0;
        for (var _i2 = 0; _i2 < _size0; ++_i2) {
          var elem3 = null;
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
};

TUserDefinedFunction.prototype.write = function(output) {
  output.writeStructBegin('TUserDefinedFunction');
  if (this.name !== null && this.name !== undefined) {
    output.writeFieldBegin('name', Thrift.Type.STRING, 1);
    output.writeString(this.name);
    output.writeFieldEnd();
  }
  if (this.argTypes !== null && this.argTypes !== undefined) {
    output.writeFieldBegin('argTypes', Thrift.Type.LIST, 2);
    output.writeListBegin(Thrift.Type.I32, this.argTypes.length);
    for (var iter4 in this.argTypes) {
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
};

var TUserDefinedTableFunction = module.exports.TUserDefinedTableFunction = function(args) {
  this.name = null;
  this.sizerType = null;
  this.sizerArgPos = null;
  this.inputArgTypes = null;
  this.outputArgTypes = null;
  this.sqlArgTypes = null;
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
  }
};
TUserDefinedTableFunction.prototype = {};
TUserDefinedTableFunction.prototype.read = function(input) {
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
        var _rtmp36 = input.readListBegin();
        var _size5 = _rtmp36.size || 0;
        for (var _i7 = 0; _i7 < _size5; ++_i7) {
          var elem8 = null;
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
        var _rtmp310 = input.readListBegin();
        var _size9 = _rtmp310.size || 0;
        for (var _i11 = 0; _i11 < _size9; ++_i11) {
          var elem12 = null;
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
        var _rtmp314 = input.readListBegin();
        var _size13 = _rtmp314.size || 0;
        for (var _i15 = 0; _i15 < _size13; ++_i15) {
          var elem16 = null;
          elem16 = input.readI32();
          this.sqlArgTypes.push(elem16);
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
};

TUserDefinedTableFunction.prototype.write = function(output) {
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
    for (var iter17 in this.inputArgTypes) {
      if (this.inputArgTypes.hasOwnProperty(iter17)) {
        iter17 = this.inputArgTypes[iter17];
        output.writeI32(iter17);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  if (this.outputArgTypes !== null && this.outputArgTypes !== undefined) {
    output.writeFieldBegin('outputArgTypes', Thrift.Type.LIST, 5);
    output.writeListBegin(Thrift.Type.I32, this.outputArgTypes.length);
    for (var iter18 in this.outputArgTypes) {
      if (this.outputArgTypes.hasOwnProperty(iter18)) {
        iter18 = this.outputArgTypes[iter18];
        output.writeI32(iter18);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  if (this.sqlArgTypes !== null && this.sqlArgTypes !== undefined) {
    output.writeFieldBegin('sqlArgTypes', Thrift.Type.LIST, 6);
    output.writeListBegin(Thrift.Type.I32, this.sqlArgTypes.length);
    for (var iter19 in this.sqlArgTypes) {
      if (this.sqlArgTypes.hasOwnProperty(iter19)) {
        iter19 = this.sqlArgTypes[iter19];
        output.writeI32(iter19);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

