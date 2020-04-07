import { expect } from "chai"
import {
  CREATE_LINK_ERROR_STRING,
  isCreateLinkError,
  isResultError
} from "../src/wrap-with-error-handling"

describe("wrapWithErrorHandling", () => {
  describe("isResultError Helper Function", () => {
    it("should return true when result is instance of a Thrift.TApplicationException", () => {
      expect(isResultError(new Thrift.TApplicationException())).to.equal(true)
    })
    it("should return true when result is instance of a Thrift.TException", () => {
      expect(isResultError(new Thrift.TException())).to.equal(true)
    })
    it("should return true when result is instance of a TOmniSciException", () => {
      expect(isResultError(new TOmniSciException())).to.equal(true)
    })
    it("should return false when result is a string", () => {
      expect(isResultError("ERROR")).to.equal(false)
    })
  })
})
