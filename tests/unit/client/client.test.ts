import { describe, expect, it } from "vitest";
import { SomniaClient } from "../../../src/client/SomniaClient";
import { NetworkError } from "../../../src/errors/index";

describe("client/SomniaClient", () => {
  describe("constructor", () => {
    it("defaults to testnet", () => {
      const client = new SomniaClient();
      expect(client.networkName).toBe("testnet");
      expect(client.chain.id).toBe(50312);
    });

    it("accepts mainnet", () => {
      const client = new SomniaClient({ network: "mainnet" });
      expect(client.networkName).toBe("mainnet");
      expect(client.chain.id).toBe(5031);
    });

    it("returns null address without private key", () => {
      const client = new SomniaClient();
      expect(client.address).toBeNull();
    });

    it("derives address from private key", () => {
      // Known test private key – never use for real funds
      const key = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
      const client = new SomniaClient({ privateKey: key });
      expect(client.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
    });
  });

  describe("lifecycle", () => {
    it("starts disconnected", () => {
      const client = new SomniaClient();
      expect(client.connected).toBe(false);
    });

    it("connect() sets connected to true", () => {
      const client = new SomniaClient();
      client.connect();
      expect(client.connected).toBe(true);
    });

    it("connect() is idempotent", () => {
      const client = new SomniaClient();
      client.connect();
      client.connect();
      expect(client.connected).toBe(true);
    });

    it("close() sets connected to false", async () => {
      const client = new SomniaClient();
      client.connect();
      await client.close();
      expect(client.connected).toBe(false);
    });
  });

  describe("guards", () => {
    it("wallet.getBalance throws before connect", () => {
      const client = new SomniaClient();
      expect(() => client.wallet.getBalance("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045")).toThrow(
        NetworkError,
      );
    });

    it("wallet.transfer throws without private key", () => {
      const client = new SomniaClient();
      client.connect();
      expect(() =>
        client.wallet.transfer({ to: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", amount: 1n }),
      ).toThrow(NetworkError);
    });
  });

  describe("explorer", () => {
    it("generates correct tx URL for testnet", () => {
      const client = new SomniaClient({ network: "testnet" });
      const url = client.explorer.tx(`0x${"a".repeat(64)}`);
      expect(url).toBe(`https://shannon-explorer.somnia.network/tx/0x${"a".repeat(64)}`);
    });

    it("generates correct address URL for mainnet", () => {
      const client = new SomniaClient({ network: "mainnet" });
      const url = client.explorer.address("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
      expect(url).toContain("explorer.somnia.network/address/");
    });
  });
});
