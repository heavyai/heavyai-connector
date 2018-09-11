import { expect } from "chai"
import * as helpers from "../src/helpers"

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
})
