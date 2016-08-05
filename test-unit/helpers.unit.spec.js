import {expect} from "chai"
import * as helpers from "../src/helpers"

describe('helpers', () => {
  it('create a ThriftCopyParams object properly', () => {
    
    const obj = {
      null_str: 'abc',
      delimiter: '|',
      quoted: true
    }
    expect(helpers.convertObjectToThriftCopyParams(obj)).to.deep.equal(new TCopyParams(obj))
  })
})
