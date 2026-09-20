import { describe, expect, it } from "vitest";
import {
  formatEtherFixed,
  formatNativeAmount,
  formatTokenAmount,
  truncateAddress,
} from "../../../src/utils/formatting";

describe("utils/formatting", () => {
  describe("formatNativeAmount", () => {
    it("should format 1 ETH worth of wei", () => {
      expect(formatNativeAmount(1000000000000000000n)).toBe("1 SOMI");
    });

    it("should format 0 wei", () => {
      expect(formatNativeAmount(0n)).toBe("0 SOMI");
    });

    it("should use custom symbol", () => {
      expect(formatNativeAmount(1000000000000000000n, "STT")).toBe("1 STT");
    });

    it("should format fractional amounts", () => {
      expect(formatNativeAmount(500000000000000000n)).toBe("0.5 SOMI");
    });
  });

  describe("formatTokenAmount", () => {
    it("should format with 6 decimals (USDC-like)", () => {
      expect(formatTokenAmount(1000000n, 6, "USDC")).toBe("1 USDC");
    });

    it("should format without symbol", () => {
      expect(formatTokenAmount(1000000n, 6)).toBe("1");
    });
  });

  describe("truncateAddress", () => {
    it("should truncate a 42-char address", () => {
      const addr = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
      expect(truncateAddress(addr)).toBe("0xd8dA...6045");
    });

    it("should return short strings unchanged", () => {
      expect(truncateAddress("0x1234")).toBe("0x1234");
    });

    it("should support custom lengths", () => {
      const addr = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
      expect(truncateAddress(addr, 10, 6)).toBe("0xd8dA6BF2...A96045");
    });
  });

  describe("formatEtherFixed", () => {
    it("should format with default 4 decimal places", () => {
      expect(formatEtherFixed(1234567890000000000n)).toBe("1.2345");
    });

    it("should pad with zeros", () => {
      expect(formatEtherFixed(1000000000000000000n)).toBe("1.0000");
    });

    it("should format with custom decimals", () => {
      expect(formatEtherFixed(1234567890000000000n, 2)).toBe("1.23");
    });

    it("should handle 0 wei", () => {
      expect(formatEtherFixed(0n)).toBe("0.0000");
    });
  });
});
