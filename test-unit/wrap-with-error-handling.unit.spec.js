import {expect} from "chai"
import {isError} from '../src/wrap-with-error-handling'

describe('wrapWithErrorHandling', () => {
  describe('isError Helper Function', () => {
    it('should return true when result is instance of a Thirft.TApplicationException', () => {
      expect(isError(new Thrift.TApplicationException())).to.equal(true)
    })
    it('should return true when result is instance of a TMapDException', () => {
      expect(isError(new TMapDException())).to.equal(true)
    })
    it('should return true when result is a string', () => {
      expect(isError("ERROR")).to.equal(true)
    })
  })
})
