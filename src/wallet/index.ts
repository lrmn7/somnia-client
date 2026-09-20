/**
 * Wallet balance and transfer operations.
 */

import type { Account, Chain, PublicClient, Transport, WalletClient } from "viem";
import { erc20Abi } from "viem";
import { WalletError } from "../errors/index.js";
import { validateAddress, validateAmount } from "../utils/validation.js";

/**
 * Retrieves the native token balance for an address.
 * Returns the balance in wei as a bigint.
 */
export async function getNativeBalance(
  client: PublicClient<Transport, Chain>,
  address: string,
): Promise<bigint> {
  const validated = validateAddress(address);
  try {
    return await client.getBalance({ address: validated });
  } catch (error) {
    throw new WalletError(
      `Failed to get balance for ${address}`,
      {
        operation: "getNativeBalance",
        retryable: true,
      },
      error,
    );
  }
}

/**
 * Retrieves the ERC-20 token balance for an address.
 * Returns the balance in raw token units as a bigint.
 */
export async function getTokenBalance(
  client: PublicClient<Transport, Chain>,
  params: { token: string; owner: string },
): Promise<bigint> {
  const tokenAddress = validateAddress(params.token, "token address");
  const ownerAddress = validateAddress(params.owner, "owner address");
  try {
    return await client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [ownerAddress],
    });
  } catch (error) {
    throw new WalletError(
      "Failed to get token balance",
      {
        operation: "getTokenBalance",
        contractAddress: params.token,
        retryable: true,
      },
      error,
    );
  }
}

export interface TransferParams {
  to: string;
  /** Amount in wei (bigint). */
  amount: bigint;
}

/**
 * Sends a native token transfer.
 * Returns the transaction hash.
 */
export async function transfer(
  walletClient: WalletClient<Transport, Chain, Account>,
  params: TransferParams,
): Promise<`0x${string}`> {
  const to = validateAddress(params.to, "recipient");
  validateAmount(params.amount);

  try {
    return await walletClient.sendTransaction({
      to,
      value: params.amount,
    });
  } catch (error) {
    throw new WalletError(
      "Native transfer failed",
      {
        operation: "transfer",
        retryable: false,
      },
      error,
    );
  }
}
