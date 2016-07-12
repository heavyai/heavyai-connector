import {expect} from "chai"
import {
  CREATE_LINK_ERROR_STRING,
  isResultError,
  isCreateLinkError
} from '../src/wrap-with-error-handling'

describe('wrapWithErrorHandling', () => {
  describe('isResultError Helper Function', () => {
    it('should return true when result is instance of a Thirft.TApplicationException', () => {
      expect(isResultError(new Thrift.TApplicationException())).to.equal(true)
    })
    it('should return true when result is instance of a TMapDException', () => {
      expect(isResultError(new TMapDException())).to.equal(true)
    })
    it('should return true when result is a string', () => {
      expect(isResultError("ERROR")).to.equal(true)
    })
  })
  describe('isCreateLinkError Helper Function', () => {
    it('should return true when string is a create link error response', () => {
      expect(isCreateLinkError(CREATE_LINK_ERROR_STRING)).to.equal(true)
    })
  })
})
