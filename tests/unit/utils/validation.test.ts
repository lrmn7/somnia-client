import { describe, expect, it } from "vitest";
import { ValidationError } from "../../../src/errors/index";
import { validateAddress, validateAmount, validateTxHash } from "../../../src/utils/validation";

describe("utils/validation", () => {
  describe("validateAddress", () => {
    it("should accept a valid checksummed address", () => {
      const addr = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
      expect(validateAddress(addr)).toBe(addr);
    });

    it("should accept a valid lowercase address", () => {
      const addr = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";
      expect(validateAddress(addr)).toBe(addr);
    });

    it("should throw for empty string", () => {
      expect(() => validateAddress("")).toThrow(ValidationError);
    });

    it("should throw for invalid address", () => {
      expect(() => validateAddress("0xinvalid")).toThrow(ValidationError);
    });

    it("should throw for non-string", () => {
      expect(() => validateAddress(null as unknown as string)).toThrow(ValidationError);
    });
  });

  describe("validateTxHash", () => {
    it("should accept a valid 66-char hex hash", () => {
      const hash = `0x${"a".repeat(64)}`;
      expect(validateTxHash(hash)).toBe(hash);
    });

    it("should throw for too-short hash", () => {
      expect(() => validateTxHash("0x1234")).toThrow(ValidationError);
    });

    it("should throw for empty string", () => {
      expect(() => validateTxHash("")).toThrow(ValidationError);
    });
  });

  describe("validateAmount", () => {
    it("should accept 0n", () => {
      expect(validateAmount(0n)).toBe(0n);
    });

    it("should accept positive bigint", () => {
      expect(validateAmount(1000000000000000000n)).toBe(1000000000000000000n);
    });

    it("should throw for negative bigint", () => {
      expect(() => validateAmount(-1n)).toThrow(ValidationError);
    });

    it("should throw for non-bigint", () => {
      expect(() => validateAmount(100 as unknown as bigint)).toThrow(ValidationError);
    });
  });
});
