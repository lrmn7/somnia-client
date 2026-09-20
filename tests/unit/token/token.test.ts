import type { Account, Chain, PublicClient, Transport, WalletClient } from "viem";
import { describe, expect, it, vi } from "vitest";
import { ContractError, ValidationError } from "../../../src/errors/index";
import { approveToken, getTokenInfo, transferToken } from "../../../src/token/index";

describe("token/erc20", () => {
  const tokenAddress = "0x1234567890123456789012345678901234567890";
  const userAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
  const spenderAddress = "0x2222222222222222222222222222222222222222";

  describe("getTokenInfo", () => {
    it("fetches name, symbol, and decimals in parallel", async () => {
      const mockPublicClient = {
        readContract: vi
          .fn()
          .mockImplementation(async ({ functionName }: { functionName: string }) => {
            if (functionName === "name") return "Somnia Test Token";
            if (functionName === "symbol") return "STT";
            if (functionName === "decimals") return 18;
            throw new Error("unexpected call");
          }),
      } as unknown as PublicClient;

      const info = await getTokenInfo(mockPublicClient, tokenAddress);
      expect(info).toEqual({
        address: tokenAddress,
        name: "Somnia Test Token",
        symbol: "STT",
        decimals: 18,
      });
      expect(mockPublicClient.readContract).toHaveBeenCalledTimes(3);
    });

    it("throws ValidationError for invalid token address", async () => {
      const mockPublicClient = {
        readContract: vi.fn(),
      } as unknown as PublicClient;

      await expect(getTokenInfo(mockPublicClient, "0xinvalid")).rejects.toThrow(ValidationError);
    });

    it("wraps contract read failures in ContractError", async () => {
      const mockPublicClient = {
        readContract: vi.fn().mockRejectedValue(new Error("RPC failed")),
      } as unknown as PublicClient;

      await expect(getTokenInfo(mockPublicClient, tokenAddress)).rejects.toThrow(ContractError);
    });
  });

  describe("transferToken", () => {
    it("calls writeContract with transfer method and parameters", async () => {
      const mockTxHash = `0x${"e".repeat(64)}`;
      const mockWalletClient = {
        writeContract: vi.fn().mockResolvedValue(mockTxHash),
      } as unknown as WalletClient<Transport, Chain, Account>;

      const hash = await transferToken(mockWalletClient, {
        token: tokenAddress,
        to: userAddress,
        amount: 1000000n,
      });

      expect(hash).toBe(mockTxHash);
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: tokenAddress,
          functionName: "transfer",
          args: [userAddress, 1000000n],
        }),
      );
    });

    it("throws ValidationError if amount < 0 or not bigint", async () => {
      const mockWalletClient = {
        writeContract: vi.fn(),
      } as unknown as WalletClient<Transport, Chain, Account>;

      await expect(
        transferToken(mockWalletClient, {
          token: tokenAddress,
          to: userAddress,
          amount: -10n,
        }),
      ).rejects.toThrow(ValidationError);

      await expect(
        transferToken(mockWalletClient, {
          token: tokenAddress,
          to: userAddress,
          amount: "10" as unknown as bigint,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("wraps write failure in ContractError", async () => {
      const mockWalletClient = {
        writeContract: vi.fn().mockRejectedValue(new Error("Transfer rejected")),
      } as unknown as WalletClient<Transport, Chain, Account>;

      await expect(
        transferToken(mockWalletClient, {
          token: tokenAddress,
          to: userAddress,
          amount: 50n,
        }),
      ).rejects.toThrow(ContractError);
    });
  });

  describe("approveToken", () => {
    it("calls writeContract with approve method and parameters", async () => {
      const mockTxHash = `0x${"f".repeat(64)}`;
      const mockWalletClient = {
        writeContract: vi.fn().mockResolvedValue(mockTxHash),
      } as unknown as WalletClient<Transport, Chain, Account>;

      const hash = await approveToken(mockWalletClient, {
        token: tokenAddress,
        spender: spenderAddress,
        amount: 5000000000n,
      });

      expect(hash).toBe(mockTxHash);
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: tokenAddress,
          functionName: "approve",
          args: [spenderAddress, 5000000000n],
        }),
      );
    });

    it("throws ValidationError for invalid spender address", async () => {
      const mockWalletClient = {
        writeContract: vi.fn(),
      } as unknown as WalletClient<Transport, Chain, Account>;

      await expect(
        approveToken(mockWalletClient, {
          token: tokenAddress,
          spender: "bad-spender",
          amount: 10n,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("wraps failure in ContractError", async () => {
      const mockWalletClient = {
        writeContract: vi.fn().mockRejectedValue(new Error("Approval reverted")),
      } as unknown as WalletClient<Transport, Chain, Account>;

      await expect(
        approveToken(mockWalletClient, {
          token: tokenAddress,
          spender: spenderAddress,
          amount: 10n,
        }),
      ).rejects.toThrow(ContractError);
    });
  });
});
