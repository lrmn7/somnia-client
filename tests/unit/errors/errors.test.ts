import { describe, expect, it } from "vitest";
import {
  ContractError,
  DiscordIntegrationError,
  NetworkError,
  ReactivityError,
  SomniaError,
  TransactionError,
  ValidationError,
  WalletError,
} from "../../../src/errors/index";

describe("errors", () => {
  describe("SomniaError", () => {
    it("should include code and message", () => {
      const err = new SomniaError("test error", { code: "TEST" });
      expect(err.message).toBe("test error");
      expect(err.code).toBe("TEST");
      expect(err.name).toBe("SomniaError");
    });

    it("should include context fields", () => {
      const err = new SomniaError("test", {
        code: "TEST",
        operation: "testOp",
        network: "testnet",
        retryable: true,
        transactionHash: "0x123",
        contractAddress: "0xabc",
        eventName: "Transfer",
        module: "test",
      });
      expect(err.operation).toBe("testOp");
      expect(err.network).toBe("testnet");
      expect(err.retryable).toBe(true);
      expect(err.transactionHash).toBe("0x123");
      expect(err.contractAddress).toBe("0xabc");
      expect(err.eventName).toBe("Transfer");
      expect(err.module).toBe("test");
    });

    it("should wrap cause", () => {
      const cause = new Error("original");
      const err = new SomniaError("wrapped", { code: "TEST" }, cause);
      expect(err.cause).toBe(cause);
    });

    it("should default retryable to false", () => {
      const err = new SomniaError("test", { code: "TEST" });
      expect(err.retryable).toBe(false);
    });
  });

  describe("Error subclasses", () => {
    it("NetworkError should have correct code and name", () => {
      const err = new NetworkError("connection failed", {});
      expect(err.code).toBe("NETWORK_ERROR");
      expect(err.name).toBe("NetworkError");
      expect(err.module).toBe("chain");
      expect(err instanceof SomniaError).toBe(true);
    });

    it("ValidationError should be non-retryable", () => {
      const err = new ValidationError("bad input", {});
      expect(err.code).toBe("VALIDATION_ERROR");
      expect(err.retryable).toBe(false);
    });

    it("WalletError should have wallet module", () => {
      const err = new WalletError("no funds", {});
      expect(err.module).toBe("wallet");
    });

    it("ContractError should have contract module", () => {
      const err = new ContractError("reverted", {});
      expect(err.module).toBe("contract");
    });

    it("TransactionError should have transaction module", () => {
      const err = new TransactionError("timeout", {});
      expect(err.module).toBe("transaction");
    });

    it("ReactivityError should have reactivity module", () => {
      const err = new ReactivityError("ws closed", {});
      expect(err.module).toBe("reactivity");
    });

    it("DiscordIntegrationError should have discord module", () => {
      const err = new DiscordIntegrationError("embed failed", {});
      expect(err.module).toBe("discord");
    });
  });
});
