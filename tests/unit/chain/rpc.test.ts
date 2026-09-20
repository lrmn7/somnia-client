import { privateKeyToAccount } from "viem/accounts";
import { describe, expect, it } from "vitest";
import { somniaMainnet, somniaTestnet } from "../../../src/chain/networks";
import {
  createSomniaPublicClient,
  createSomniaWalletClient,
  createWsTransport,
} from "../../../src/chain/rpc";

describe("chain/rpc", () => {
  const dummyKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const account = privateKeyToAccount(dummyKey);

  describe("createSomniaPublicClient", () => {
    it("creates client for mainnet", () => {
      const client = createSomniaPublicClient(somniaMainnet);
      expect(client.chain.id).toBe(5031);
    });

    it("creates client for testnet with custom rpc url", () => {
      const customUrl = "https://custom-somnia-rpc.example.com";
      const client = createSomniaPublicClient(somniaTestnet, { httpUrl: customUrl });
      expect(client.chain.id).toBe(50312);
    });
  });

  describe("createSomniaWalletClient", () => {
    it("creates wallet client with account attached", () => {
      const client = createSomniaWalletClient(somniaTestnet, account);
      expect(client.chain.id).toBe(50312);
      expect(client.account.address).toBe(account.address);
    });

    it("creates wallet client with custom rpc", () => {
      const client = createSomniaWalletClient(somniaMainnet, account, {
        httpUrl: "https://custom-rpc.example.com",
      });
      expect(client.chain.id).toBe(5031);
    });
  });

  describe("createWsTransport", () => {
    it("creates WebSocket transport from default chain config", () => {
      const transport = createWsTransport(somniaTestnet);
      expect(transport).toBeDefined();
    });

    it("creates WebSocket transport with custom wsUrl", () => {
      const transport = createWsTransport(somniaMainnet, {
        wsUrl: "wss://custom-ws.example.com",
      });
      expect(transport).toBeDefined();
    });

    it("throws error if chain has no websocket url configured", () => {
      const chainWithoutWs = {
        ...somniaTestnet,
        rpcUrls: {
          default: {
            http: ["https://example.com"],
            webSocket: undefined,
          },
        },
      };

      expect(() => createWsTransport(chainWithoutWs as unknown as Chain)).toThrow(
        "No WebSocket RPC URL configured",
      );
    });
  });
});
