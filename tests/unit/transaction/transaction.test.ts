import type { PublicClient, TransactionReceipt } from "viem";
import { describe, expect, it, vi } from "vitest";
import { somniaMainnet, somniaTestnet } from "../../../src/chain/networks";
import { TransactionError, ValidationError } from "../../../src/errors/index";
import {
  getExplorerUrl,
  getTransaction,
  getTransactionReceipt,
  waitForTransaction,
} from "../../../src/transaction/index";

describe("transaction/operations", () => {
  const validHash = `0x${"c".repeat(64)}`;
  const mockReceipt: TransactionReceipt = {
    transactionHash: validHash as `0x${string}`,
    status: "success",
    blockNumber: 12345n,
    gasUsed: 21000n,
    from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    to: "0x1234567890123456789012345678901234567890",
    contractAddress: null,
  } as unknown as TransactionReceipt;

  describe("getTransaction", () => {
    it("returns transaction object on success", async () => {
      const mockTx = { hash: validHash, from: "0x...", nonce: 1 };
      const mockPublicClient = {
        getTransaction: vi.fn().mockResolvedValue(mockTx),
      } as unknown as PublicClient;

      const result = await getTransaction(mockPublicClient, validHash);
      expect(result).toBe(mockTx);
      expect(mockPublicClient.getTransaction).toHaveBeenCalledWith({ hash: validHash });
    });

    it("throws ValidationError for invalid hash", async () => {
      const mockPublicClient = {
        getTransaction: vi.fn(),
      } as unknown as PublicClient;

      await expect(getTransaction(mockPublicClient, "0x123")).rejects.toThrow(ValidationError);
      expect(mockPublicClient.getTransaction).not.toHaveBeenCalled();
    });

    it("wraps client failure in TransactionError", async () => {
      const mockPublicClient = {
        getTransaction: vi.fn().mockRejectedValue(new Error("RPC dropped")),
      } as unknown as PublicClient;

      await expect(getTransaction(mockPublicClient, validHash)).rejects.toThrow(TransactionError);
    });
  });

  describe("getTransactionReceipt", () => {
    it("returns normalized receipt on success", async () => {
      const mockPublicClient = {
        getTransactionReceipt: vi.fn().mockResolvedValue(mockReceipt),
      } as unknown as PublicClient;

      const receipt = await getTransactionReceipt(mockPublicClient, validHash);
      expect(receipt).not.toBeNull();
      expect(receipt?.status).toBe("confirmed");
      expect(receipt?.hash).toBe(validHash);
      expect(receipt?.gasUsed).toBe(21000n);
      expect(receipt?.blockNumber).toBe(12345n);
    });

    it("normalizes reverted receipt status", async () => {
      const revertedReceipt = {
        ...mockReceipt,
        status: "reverted",
      } as unknown as TransactionReceipt;

      const mockPublicClient = {
        getTransactionReceipt: vi.fn().mockResolvedValue(revertedReceipt),
      } as unknown as PublicClient;

      const receipt = await getTransactionReceipt(mockPublicClient, validHash);
      expect(receipt?.status).toBe("reverted");
    });

    it("returns null when receipt is not found", async () => {
      const mockPublicClient = {
        getTransactionReceipt: vi
          .fn()
          .mockRejectedValue(new Error("Transaction receipt could not be found")),
      } as unknown as PublicClient;

      const receipt = await getTransactionReceipt(mockPublicClient, validHash);
      expect(receipt).toBeNull();
    });

    it("throws TransactionError on other failures", async () => {
      const mockPublicClient = {
        getTransactionReceipt: vi.fn().mockRejectedValue(new Error("connection failed")),
      } as unknown as PublicClient;

      await expect(getTransactionReceipt(mockPublicClient, validHash)).rejects.toThrow(
        TransactionError,
      );
    });
  });

  describe("waitForTransaction", () => {
    it("waits for confirmations and returns normalized receipt", async () => {
      const mockPublicClient = {
        waitForTransactionReceipt: vi.fn().mockResolvedValue(mockReceipt),
      } as unknown as PublicClient;

      const receipt = await waitForTransaction(mockPublicClient, validHash, 2);
      expect(receipt.status).toBe("confirmed");
      expect(mockPublicClient.waitForTransactionReceipt).toHaveBeenCalledWith({
        hash: validHash,
        confirmations: 2,
      });
    });

    it("throws TransactionError when wait times out or fails", async () => {
      const mockPublicClient = {
        waitForTransactionReceipt: vi.fn().mockRejectedValue(new Error("Timeout waiting")),
      } as unknown as PublicClient;

      await expect(waitForTransaction(mockPublicClient, validHash)).rejects.toThrow(
        TransactionError,
      );
    });
  });

  describe("getExplorerUrl", () => {
    it("builds testnet and mainnet explorer urls", () => {
      expect(getExplorerUrl(somniaTestnet, validHash)).toBe(
        `https://shannon-explorer.somnia.network/tx/${validHash}`,
      );
      expect(getExplorerUrl(somniaMainnet, validHash)).toBe(
        `https://explorer.somnia.network/tx/${validHash}`,
      );
    });
  });
});
