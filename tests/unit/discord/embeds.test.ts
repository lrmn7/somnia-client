import { describe, expect, it } from "vitest";
import {
  createErrorEmbed,
  createInfoEmbed,
  createSomniaEmbed,
  createSuccessEmbed,
  createWarningEmbed,
} from "../../../src/discord/embeds/generic.js";
import { createTransactionEmbed } from "../../../src/discord/embeds/transaction.js";
import { createTransferEmbed } from "../../../src/discord/embeds/transfer.js";
import { createWalletEmbed } from "../../../src/discord/embeds/wallet.js";

describe("discord/embeds", () => {
  describe("generic", () => {
    it("createSomniaEmbed creates embed with Somnia branding", () => {
      const embed = createSomniaEmbed("Test");
      const json = embed.toJSON();
      expect(json.title).toBe("Test");
      expect(json.footer?.text).toContain("Somnia");
      expect(json.color).toBeDefined();
    });

    it("createSuccessEmbed uses green color", () => {
      const embed = createSuccessEmbed("OK");
      const json = embed.toJSON();
      expect(json.color).toBe(0x22c55e);
      expect(json.title).toContain("✅");
    });

    it("createErrorEmbed uses red color", () => {
      const embed = createErrorEmbed("Fail");
      const json = embed.toJSON();
      expect(json.color).toBe(0xef4444);
      expect(json.title).toContain("❌");
    });

    it("createInfoEmbed uses default Somnia color", () => {
      const embed = createInfoEmbed("Info");
      const json = embed.toJSON();
      expect(json.title).toContain("ℹ️");
    });

    it("createWarningEmbed uses amber color", () => {
      const embed = createWarningEmbed("Warn");
      const json = embed.toJSON();
      expect(json.color).toBe(0xf59e0b);
      expect(json.title).toContain("⚠️");
    });
  });

  describe("transaction embed", () => {
    it("creates a confirmed transaction embed", () => {
      const embed = createTransactionEmbed({
        hash: `0x${"a".repeat(64)}`,
        from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        to: "0x0000000000000000000000000000000000000001",
        value: 1000000000000000000n,
        status: "confirmed",
        blockNumber: 12345n,
        explorerUrl: `https://explorer.somnia.network/tx/0x${"a".repeat(64)}`,
      });
      const json = embed.toJSON();
      expect(json.color).toBe(0x22c55e); // green
      expect(json.fields).toBeDefined();
      expect(json.fields?.length).toBeGreaterThanOrEqual(3);
    });

    it("creates a reverted transaction embed", () => {
      const embed = createTransactionEmbed({
        hash: `0x${"b".repeat(64)}`,
        from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        to: null,
        status: "reverted",
        explorerUrl: `https://explorer.somnia.network/tx/0x${"b".repeat(64)}`,
      });
      const json = embed.toJSON();
      expect(json.color).toBe(0xef4444); // red
    });
  });

  describe("transfer embed", () => {
    it("creates a native transfer embed", () => {
      const embed = createTransferEmbed({
        from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        to: "0x0000000000000000000000000000000000000001",
        amount: 1000000000000000000n,
        symbol: "SOMI",
        hash: `0x${"c".repeat(64)}`,
        explorerUrl: `https://explorer.somnia.network/tx/0x${"c".repeat(64)}`,
        isNative: true,
      });
      const json = embed.toJSON();
      expect(json.description).toContain("→");
      expect(json.fields).toBeDefined();
    });
  });

  describe("wallet embed", () => {
    it("creates a wallet balance embed", () => {
      const embed = createWalletEmbed({
        address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        nativeBalance: 5000000000000000000n,
        explorerUrl:
          "https://explorer.somnia.network/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        networkName: "Somnia Shannon Testnet",
      });
      const json = embed.toJSON();
      expect(json.title).toContain("Wallet");
      expect(json.description).toContain("Testnet");
    });
  });
});
