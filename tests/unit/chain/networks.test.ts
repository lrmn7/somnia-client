import { describe, expect, it } from "vitest";
import {
  getNetwork,
  getSupportedNetworks,
  somniaMainnet,
  somniaTestnet,
} from "../../../src/chain/networks";

describe("chain/networks", () => {
  describe("somniaMainnet", () => {
    it("should have correct chain ID", () => {
      expect(somniaMainnet.id).toBe(5031);
    });

    it("should have correct native currency", () => {
      expect(somniaMainnet.nativeCurrency.symbol).toBe("SOMI");
      expect(somniaMainnet.nativeCurrency.decimals).toBe(18);
    });

    it("should have correct RPC URLs", () => {
      expect(somniaMainnet.rpcUrls.default.http[0]).toBe(
        "https://api.infra.mainnet.somnia.network/",
      );
      expect(somniaMainnet.rpcUrls.default.webSocket?.[0]).toBe(
        "wss://api.infra.mainnet.somnia.network/ws",
      );
    });

    it("should have a block explorer", () => {
      expect(somniaMainnet.blockExplorers?.default.url).toBe("https://explorer.somnia.network");
    });

    it("should not be marked as testnet", () => {
      expect(somniaMainnet.testnet).toBeUndefined();
    });
  });

  describe("somniaTestnet", () => {
    it("should have correct chain ID", () => {
      expect(somniaTestnet.id).toBe(50312);
    });

    it("should have correct native currency (STT)", () => {
      expect(somniaTestnet.nativeCurrency.symbol).toBe("STT");
      expect(somniaTestnet.nativeCurrency.decimals).toBe(18);
    });

    it("should have correct RPC URLs", () => {
      expect(somniaTestnet.rpcUrls.default.http[0]).toBe(
        "https://api.infra.testnet.somnia.network/",
      );
      expect(somniaTestnet.rpcUrls.default.webSocket?.[0]).toBe(
        "wss://api.infra.testnet.somnia.network/ws",
      );
    });

    it("should be marked as testnet", () => {
      expect(somniaTestnet.testnet).toBe(true);
    });
  });

  describe("getNetwork", () => {
    it("should return mainnet for 'mainnet'", () => {
      const chain = getNetwork("mainnet");
      expect(chain.id).toBe(5031);
    });

    it("should return testnet for 'testnet'", () => {
      const chain = getNetwork("testnet");
      expect(chain.id).toBe(50312);
    });
  });

  describe("getSupportedNetworks", () => {
    it("should return mainnet and testnet", () => {
      const networks = getSupportedNetworks();
      expect(networks).toContain("mainnet");
      expect(networks).toContain("testnet");
      expect(networks).toHaveLength(2);
    });
  });
});
