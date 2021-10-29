import { expect } from "chai"
import * as helpers from "../src/helpers"
import { TCopyParams } from "../thrift/omnisci_types"

describe("helpers", () => {
  describe("convertObjectToThriftCopyParams", () => {
    it("create a ThriftCopyParams object properly", () => {
      const obj = {
        null_str: "abc",
        delimiter: "|",
        quoted: true
      }
      expect(helpers.convertObjectToThriftCopyParams(obj)).to.deep.equal(
        new TCopyParams(obj)
      )
    })
  })
  describe("mutateThriftRowDesc", () => {
    it("should mutate a thriftArray to a v2array properly", () => {
      const v2array = [
        {
          clean_col_name: "father",
          is_reserved_keyword: null,
          col_type: {
            encoding: 0,
            type: 0,
            is_array: false,
            nullable: false,
            precision: 0,
            comp_param: 0,
            scale: 0
          }
        },
        {
          clean_col_name: "mother",
          is_reserved_keyword: null,
          col_type: {
            encoding: 0,
            type: 0,
            is_array: false,
            nullable: false,
            precision: 3,
            comp_param: 0,
            scale: 0
          }
        }
      ]

      const thriftArray = [
        {
          col_name: "daddy",
          is_reserved_keyword: null,
          col_type: {
            encoding: 0,
            type: 0,
            is_array: false,
            nullable: false,
            precision: 0,
            comp_param: 0,
            scale: 0
          }
        },
        {
          col_name: "mommy",
          is_reserved_keyword: null,
          col_type: {
            encoding: 0,
            type: 0,
            is_array: false,
            nullable: false,
            precision: 3,
            comp_param: 0,
            scale: 0
          }
        }
      ]

      expect(helpers.mutateThriftRowDesc(v2array, thriftArray)).to.deep.equal([
        {
          col_name: "father",
          is_reserved_keyword: null,
          col_type: {
            encoding: 0,
            type: 0,
            is_array: false,
            nullable: false,
            precision: 0,
            comp_param: 0,
            scale: 0
          }
        },
        {
          col_name: "mother",
          is_reserved_keyword: null,
          col_type: {
            encoding: 0,
            type: 0,
            is_array: false,
            nullable: false,
            precision: 3,
            comp_param: 0,
            scale: 0
          }
        }
      ])
    })
  })
  describe("bufferToBoolean", () => {
    it('Should convert a Buffer with bits set to all zeros to false', () => {
      const buffer = Buffer.alloc(8)
      expect(helpers.bufferToBoolean(buffer)).to.equal(false)
    })
    it('Should convert a Buffer with last bit set to 1 to true', () => {
      const buffer = Buffer.alloc(8)
      buffer[7] = 1
      expect(helpers.bufferToBoolean(buffer)).to.equal(true)
    })
  })
})
