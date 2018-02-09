import { expect } from "chai"
import processColumnarResults from "../src/process-columnar-results"

const dataEnum = {
  "0": "SMALLINT",
  "1": "INT",
  "2": "BIGINT",
  "3": "FLOAT",
  "4": "DECIMAL",
  "5": "DOUBLE",
  "6": "STR",
  "7": "TIME",
  "8": "TIMESTAMP",
  "9": "DATE",
  "10": "BOOL"
}

describe("processColumnarResults", () => {
  it("should process columnar results", () => {
    const data = {
      row_desc: [
        {
          col_name: "val",
          col_type: {
            type: 1,
            encoding: 0,
            nullable: true,
            is_array: false
          }
        }
      ],
      rows: [],
      columns: [
        {
          data: {
            int_col: [7009728],
            real_col: [],
            str_col: [],
            arr_col: []
          },
          nulls: [false]
        }
      ],
      is_columnar: true
    }

    expect(processColumnarResults(data, false, dataEnum)).to.deep.equal({
      fields: [
        {
          name: "val",
          type: "INT",
          is_array: false
        }
      ],
      results: [
        {
          val: 7009728
        }
      ]
    })
  })
})
