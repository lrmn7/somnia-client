import { describe, expect, it } from "vitest";
import {
  formatAddressCode,
  formatAddressLink,
  formatAddressTruncated,
} from "../../../src/discord/formatters/address.js";
import {
  formatAmountBold,
  formatAmountFixed,
  formatTokenAmountDisplay,
} from "../../../src/discord/formatters/amount.js";
import {
  formatDate,
  formatNow,
  formatTimestamp,
} from "../../../src/discord/formatters/timestamp.js";

const TEST_ADDR = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

describe("discord/formatters", () => {
  describe("address", () => {
    it("formatAddressCode wraps in backticks", () => {
      expect(formatAddressCode(TEST_ADDR)).toBe(`\`${TEST_ADDR}\``);
    });

    it("formatAddressTruncated truncates and wraps", () => {
      const result = formatAddressTruncated(TEST_ADDR);
      expect(result).toBe("`0xd8dA...6045`");
    });

    it("formatAddressLink creates markdown link", () => {
      const url = `https://explorer.somnia.network/address/${TEST_ADDR}`;
      const result = formatAddressLink(TEST_ADDR, url);
      expect(result).toContain("[0xd8dA...6045]");
      expect(result).toContain(url);
    });
  });

  describe("amount", () => {
    it("formatAmountBold wraps in bold", () => {
      const result = formatAmountBold(1000000000000000000n);
      expect(result).toBe("**1 SOMI**");
    });

    it("formatAmountFixed shows fixed decimals", () => {
      const result = formatAmountFixed(1234567890000000000n, 4, "STT");
      expect(result).toBe("1.2345 STT");
    });

    it("formatTokenAmountDisplay uses bold", () => {
      const result = formatTokenAmountDisplay(1000000n, 6, "USDC");
      expect(result).toBe("**1 USDC**");
    });
  });

  describe("timestamp", () => {
    it("formatTimestamp creates Discord timestamp", () => {
      expect(formatTimestamp(1695000000)).toBe("<t:1695000000:R>");
    });

    it("formatTimestamp supports styles", () => {
      expect(formatTimestamp(1695000000, "F")).toBe("<t:1695000000:F>");
    });

    it("formatDate converts Date to timestamp", () => {
      const date = new Date("2023-09-18T00:00:00Z");
      const result = formatDate(date, "d");
      expect(result).toMatch(/^<t:\d+:d>$/);
    });

    it("formatNow returns current timestamp", () => {
      const result = formatNow();
      expect(result).toMatch(/^<t:\d+:R>$/);
    });
  });
});
