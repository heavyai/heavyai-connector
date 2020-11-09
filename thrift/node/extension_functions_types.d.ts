//
// Autogenerated by Thrift Compiler (0.13.0)
//
// DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
//
import thrift = require('thrift');
import Thrift = thrift.Thrift;
import Q = thrift.Q;
import Int64 = require('node-int64');


declare enum TExtArgumentType {
  Int8 = 0,
  Int16 = 1,
  Int32 = 2,
  Int64 = 3,
  Float = 4,
  Double = 5,
  Void = 6,
  PInt8 = 7,
  PInt16 = 8,
  PInt32 = 9,
  PInt64 = 10,
  PFloat = 11,
  PDouble = 12,
  PBool = 13,
  Bool = 14,
  ArrayInt8 = 15,
  ArrayInt16 = 16,
  ArrayInt32 = 17,
  ArrayInt64 = 18,
  ArrayFloat = 19,
  ArrayDouble = 20,
  ArrayBool = 21,
  GeoPoint = 22,
  GeoLineString = 23,
  Cursor = 24,
  GeoPolygon = 25,
  GeoMultiPolygon = 26,
  ColumnInt8 = 27,
  ColumnInt16 = 28,
  ColumnInt32 = 29,
  ColumnInt64 = 30,
  ColumnFloat = 31,
  ColumnDouble = 32,
  ColumnBool = 33,
}

declare enum TOutputBufferSizeType {
  kConstant = 0,
  kUserSpecifiedConstantParameter = 1,
  kUserSpecifiedRowMultiplier = 2,
}

declare class TUserDefinedFunction {
    public name: string;
    public argTypes: TExtArgumentType[];
    public retType: TExtArgumentType;

      constructor(args?: { name: string; argTypes: TExtArgumentType[]; retType: TExtArgumentType; });
  }

declare class TUserDefinedTableFunction {
    public name: string;
    public sizerType: TOutputBufferSizeType;
    public sizerArgPos: number;
    public inputArgTypes: TExtArgumentType[];
    public outputArgTypes: TExtArgumentType[];
    public sqlArgTypes: TExtArgumentType[];

      constructor(args?: { name: string; sizerType: TOutputBufferSizeType; sizerArgPos: number; inputArgTypes: TExtArgumentType[]; outputArgTypes: TExtArgumentType[]; sqlArgTypes: TExtArgumentType[]; });
  }
