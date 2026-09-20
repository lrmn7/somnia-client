import { describe, expect, it } from "vitest";
import {
  explorerAddressUrl,
  explorerBlockUrl,
  explorerTokenUrl,
  explorerTxUrl,
} from "../../../src/chain/explorer";
import { somniaMainnet, somniaTestnet } from "../../../src/chain/networks";

describe("chain/explorer", () => {
  const sampleHash = `0x${"1".repeat(64)}`;
  const sampleAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
  const sampleToken = "0x1234567890123456789012345678901234567890";

  describe("explorerTxUrl", () => {
    it("builds mainnet transaction link", () => {
      expect(explorerTxUrl(somniaMainnet, sampleHash)).toBe(
        `https://explorer.somnia.network/tx/${sampleHash}`,
      );
    });

    it("builds testnet transaction link", () => {
      expect(explorerTxUrl(somniaTestnet, sampleHash)).toBe(
        `https://shannon-explorer.somnia.network/tx/${sampleHash}`,
      );
    });
  });

  describe("explorerAddressUrl", () => {
    it("builds mainnet address link", () => {
      expect(explorerAddressUrl(somniaMainnet, sampleAddress)).toBe(
        `https://explorer.somnia.network/address/${sampleAddress}`,
      );
    });

    it("builds testnet address link", () => {
      expect(explorerAddressUrl(somniaTestnet, sampleAddress)).toBe(
        `https://shannon-explorer.somnia.network/address/${sampleAddress}`,
      );
    });
  });

  describe("explorerBlockUrl", () => {
    it("builds block link with number or bigint", () => {
      expect(explorerBlockUrl(somniaMainnet, 100)).toBe(
        "https://explorer.somnia.network/block/100",
      );
      expect(explorerBlockUrl(somniaTestnet, 200n)).toBe(
        "https://shannon-explorer.somnia.network/block/200",
      );
    });
  });

  describe("explorerTokenUrl", () => {
    it("builds token link", () => {
      expect(explorerTokenUrl(somniaMainnet, sampleToken)).toBe(
        `https://explorer.somnia.network/token/${sampleToken}`,
      );
      expect(explorerTokenUrl(somniaTestnet, sampleToken)).toBe(
        `https://shannon-explorer.somnia.network/token/${sampleToken}`,
      );
    });
  });
});
