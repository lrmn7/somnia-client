import type { Account, Chain, PublicClient, Transport, WalletClient } from "viem";
import { describe, expect, it, vi } from "vitest";
import { ValidationError, WalletError } from "../../../src/errors/index";
import { getNativeBalance, getTokenBalance, transfer } from "../../../src/wallet/index";

describe("wallet/operations", () => {
  const validAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
  const validToken = "0x1234567890123456789012345678901234567890";

  describe("getNativeBalance", () => {
    it("returns balance from public client", async () => {
      const mockPublicClient = {
        getBalance: vi.fn().mockResolvedValue(1000000000000000000n),
      } as unknown as PublicClient;

      const balance = await getNativeBalance(mockPublicClient, validAddress);
      expect(balance).toBe(1000000000000000000n);
      expect(mockPublicClient.getBalance).toHaveBeenCalledWith({ address: validAddress });
    });

    it("throws ValidationError on invalid address", async () => {
      const mockPublicClient = {
        getBalance: vi.fn(),
      } as unknown as PublicClient;

      await expect(getNativeBalance(mockPublicClient, "invalid-addr")).rejects.toThrow(
        ValidationError,
      );
      expect(mockPublicClient.getBalance).not.toHaveBeenCalled();
    });

    it("wraps client failure in WalletError", async () => {
      const mockPublicClient = {
        getBalance: vi.fn().mockRejectedValue(new Error("RPC timeout")),
      } as unknown as PublicClient;

      await expect(getNativeBalance(mockPublicClient, validAddress)).rejects.toThrow(WalletError);
    });
  });

  describe("getTokenBalance", () => {
    it("calls readContract for ERC-20 balanceOf", async () => {
      const mockPublicClient = {
        readContract: vi.fn().mockResolvedValue(5000000n),
      } as unknown as PublicClient;

      const balance = await getTokenBalance(mockPublicClient, {
        token: validToken,
        owner: validAddress,
      });

      expect(balance).toBe(5000000n);
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: validToken,
          functionName: "balanceOf",
          args: [validAddress],
        }),
      );
    });

    it("throws ValidationError for invalid token address", async () => {
      const mockPublicClient = {
        readContract: vi.fn(),
      } as unknown as PublicClient;

      await expect(
        getTokenBalance(mockPublicClient, { token: "bad-token", owner: validAddress }),
      ).rejects.toThrow(ValidationError);
    });

    it("wraps RPC contract read failure in WalletError", async () => {
      const mockPublicClient = {
        readContract: vi.fn().mockRejectedValue(new Error("contract call failed")),
      } as unknown as PublicClient;

      await expect(
        getTokenBalance(mockPublicClient, { token: validToken, owner: validAddress }),
      ).rejects.toThrow(WalletError);
    });
  });

  describe("transfer", () => {
    it("calls sendTransaction on wallet client with validated parameters", async () => {
      const mockTxHash = `0x${"b".repeat(64)}`;
      const mockWalletClient = {
        sendTransaction: vi.fn().mockResolvedValue(mockTxHash),
      } as unknown as WalletClient<Transport, Chain, Account>;

      const hash = await transfer(mockWalletClient, {
        to: validAddress,
        amount: 250000000000000000n,
      });

      expect(hash).toBe(mockTxHash);
      expect(mockWalletClient.sendTransaction).toHaveBeenCalledWith({
        to: validAddress,
        value: 250000000000000000n,
      });
    });

    it("throws ValidationError for negative amount or non-bigint", async () => {
      const mockWalletClient = {
        sendTransaction: vi.fn(),
      } as unknown as WalletClient<Transport, Chain, Account>;

      await expect(transfer(mockWalletClient, { to: validAddress, amount: -5n })).rejects.toThrow(
        ValidationError,
      );

      await expect(
        transfer(mockWalletClient, { to: validAddress, amount: "100" as unknown as bigint }),
      ).rejects.toThrow(ValidationError);
    });

    it("wraps transfer failures in WalletError", async () => {
      const mockWalletClient = {
        sendTransaction: vi.fn().mockRejectedValue(new Error("insufficient funds")),
      } as unknown as WalletClient<Transport, Chain, Account>;

      await expect(transfer(mockWalletClient, { to: validAddress, amount: 100n })).rejects.toThrow(
        WalletError,
      );
    });
  });
});
