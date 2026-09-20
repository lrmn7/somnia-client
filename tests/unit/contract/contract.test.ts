import type { Abi, Account, Chain, PublicClient, Transport, WalletClient } from "viem";
import { describe, expect, it, vi } from "vitest";
import { readContract, simulateContract, writeContract } from "../../../src/contract/index";
import { ContractError, ValidationError } from "../../../src/errors/index";

describe("contract/operations", () => {
  const validAddress = "0x1234567890123456789012345678901234567890";
  const dummyAbi: Abi = [
    {
      type: "function",
      name: "getValue",
      stateMutability: "view",
      inputs: [],
      outputs: [{ type: "uint256", name: "" }],
    },
    {
      type: "function",
      name: "setValue",
      stateMutability: "nonpayable",
      inputs: [{ type: "uint256", name: "v" }],
      outputs: [],
    },
  ];

  describe("readContract", () => {
    it("calls publicClient.readContract with provided parameters", async () => {
      const mockPublicClient = {
        readContract: vi.fn().mockResolvedValue(42n),
      } as unknown as PublicClient;

      const result = await readContract(mockPublicClient, {
        address: validAddress,
        abi: dummyAbi,
        functionName: "getValue",
      });

      expect(result).toBe(42n);
      expect(mockPublicClient.readContract).toHaveBeenCalledWith({
        address: validAddress,
        abi: dummyAbi,
        functionName: "getValue",
        args: undefined,
      });
    });

    it("throws ValidationError for invalid contract address", async () => {
      const mockPublicClient = {
        readContract: vi.fn(),
      } as unknown as PublicClient;

      await expect(
        readContract(mockPublicClient, {
          address: "not-an-address",
          abi: dummyAbi,
          functionName: "getValue",
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("wraps execution failure in ContractError with retryable=true", async () => {
      const mockPublicClient = {
        readContract: vi.fn().mockRejectedValue(new Error("execution reverted")),
      } as unknown as PublicClient;

      await expect(
        readContract(mockPublicClient, {
          address: validAddress,
          abi: dummyAbi,
          functionName: "getValue",
        }),
      ).rejects.toThrow(ContractError);
    });
  });

  describe("writeContract", () => {
    it("calls walletClient.writeContract and returns tx hash", async () => {
      const mockTxHash = `0x${"d".repeat(64)}`;
      const mockWalletClient = {
        writeContract: vi.fn().mockResolvedValue(mockTxHash),
      } as unknown as WalletClient<Transport, Chain, Account>;

      const hash = await writeContract(mockWalletClient, {
        address: validAddress,
        abi: dummyAbi,
        functionName: "setValue",
        args: [100n],
      });

      expect(hash).toBe(mockTxHash);
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
        address: validAddress,
        abi: dummyAbi,
        functionName: "setValue",
        args: [100n],
        value: undefined,
      });
    });

    it("wraps write failure in ContractError with retryable=false", async () => {
      const mockWalletClient = {
        writeContract: vi.fn().mockRejectedValue(new Error("gas limit exceeded")),
      } as unknown as WalletClient<Transport, Chain, Account>;

      await expect(
        writeContract(mockWalletClient, {
          address: validAddress,
          abi: dummyAbi,
          functionName: "setValue",
          args: [100n],
        }),
      ).rejects.toThrow(ContractError);
    });
  });

  describe("simulateContract", () => {
    it("calls publicClient.simulateContract and returns simulated result", async () => {
      const mockSimulationResult = { result: 100n, request: {} };
      const mockPublicClient = {
        simulateContract: vi.fn().mockResolvedValue(mockSimulationResult),
      } as unknown as PublicClient;

      const res = await simulateContract(mockPublicClient, {
        address: validAddress,
        abi: dummyAbi,
        functionName: "setValue",
        args: [100n],
      });

      expect(res).toBe(mockSimulationResult);
      expect(mockPublicClient.simulateContract).toHaveBeenCalledWith({
        address: validAddress,
        abi: dummyAbi,
        functionName: "setValue",
        args: [100n],
        value: undefined,
      });
    });

    it("wraps simulation failure in ContractError", async () => {
      const mockPublicClient = {
        simulateContract: vi.fn().mockRejectedValue(new Error("simulation reverted")),
      } as unknown as PublicClient;

      await expect(
        simulateContract(mockPublicClient, {
          address: validAddress,
          abi: dummyAbi,
          functionName: "setValue",
        }),
      ).rejects.toThrow(ContractError);
    });
  });
});
