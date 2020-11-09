//
// Autogenerated by Thrift Compiler (0.13.0)
//
// DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
//
import thrift = require('thrift');
import Thrift = thrift.Thrift;
import Q = thrift.Q;
import Int64 = require('node-int64');


declare enum TDeviceType {
  CPU = 0,
  GPU = 1,
}

declare enum TDatumType {
  SMALLINT = 0,
  INT = 1,
  BIGINT = 2,
  FLOAT = 3,
  DECIMAL = 4,
  DOUBLE = 5,
  STR = 6,
  TIME = 7,
  TIMESTAMP = 8,
  DATE = 9,
  BOOL = 10,
  INTERVAL_DAY_TIME = 11,
  INTERVAL_YEAR_MONTH = 12,
  POINT = 13,
  LINESTRING = 14,
  POLYGON = 15,
  MULTIPOLYGON = 16,
  TINYINT = 17,
  GEOMETRY = 18,
  GEOGRAPHY = 19,
}

declare enum TEncodingType {
  NONE = 0,
  FIXED = 1,
  RL = 2,
  DIFF = 3,
  DICT = 4,
  SPARSE = 5,
  GEOINT = 6,
  DATE_IN_DAYS = 7,
}

declare class TTypeInfo {
    public type: TDatumType;
    public encoding: TEncodingType;
    public nullable: boolean;
    public is_array: boolean;
    public precision: number;
    public scale: number;
    public comp_param: number;
    public size: number;

      constructor(args?: { type: TDatumType; encoding: TEncodingType; nullable: boolean; is_array: boolean; precision: number; scale: number; comp_param: number; size?: number; });
  }
