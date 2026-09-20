/**
 * Low-level contract interaction: read, write, simulate.
 * Escape hatch for advanced developers.
 */

import type { Abi, Account, Chain, PublicClient, Transport, WalletClient } from "viem";
import { ContractError } from "../errors/index.js";
import { validateAddress } from "../utils/validation.js";

export interface ContractCallParams {
  address: string;
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
}

export interface ContractWriteParams {
  address: string;
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
}

/**
 * Read from a contract (view/pure function).
 */
export async function readContract(
  client: PublicClient<Transport, Chain>,
  params: ContractCallParams,
) {
  const address = validateAddress(params.address, "contract address");
  try {
    return await client.readContract({
      address,
      abi: params.abi,
      functionName: params.functionName,
      args: params.args,
    });
  } catch (error) {
    throw new ContractError(
      "Contract read failed",
      {
        operation: "readContract",
        contractAddress: params.address,
        retryable: true,
      },
      error,
    );
  }
}

/**
 * Write to a contract (state-changing function).
 * Returns the transaction hash.
 */
export async function writeContract(
  walletClient: WalletClient<Transport, Chain, Account>,
  params: ContractWriteParams,
): Promise<`0x${string}`> {
  const address = validateAddress(params.address, "contract address");
  try {
    return await walletClient.writeContract({
      address,
      abi: params.abi,
      functionName: params.functionName,
      args: params.args,
      value: params.value,
    });
  } catch (error) {
    throw new ContractError(
      "Contract write failed",
      {
        operation: "writeContract",
        contractAddress: params.address,
        retryable: false,
      },
      error,
    );
  }
}

/**
 * Simulate a contract call without sending a transaction.
 */
export async function simulateContract(
  client: PublicClient<Transport, Chain>,
  params: ContractWriteParams,
) {
  const address = validateAddress(params.address, "contract address");
  try {
    return await client.simulateContract({
      address,
      abi: params.abi,
      functionName: params.functionName,
      args: params.args,
      value: params.value,
    });
  } catch (error) {
    throw new ContractError(
      "Contract simulation failed",
      {
        operation: "simulateContract",
        contractAddress: params.address,
        retryable: false,
      },
      error,
    );
  }
}
