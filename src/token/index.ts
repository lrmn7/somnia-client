/**
 * ERC-20 token helpers.
 */

import type { Account, Chain, PublicClient, Transport, WalletClient } from "viem";
import { erc20Abi } from "viem";
import { ContractError } from "../errors/index.js";
import { validateAddress, validateAmount } from "../utils/validation.js";

export interface TokenInfo {
  address: `0x${string}`;
  name: string;
  symbol: string;
  decimals: number;
}

/**
 * Fetches ERC-20 token metadata (name, symbol, decimals).
 */
export async function getTokenInfo(
  client: PublicClient<Transport, Chain>,
  tokenAddress: string,
): Promise<TokenInfo> {
  const address = validateAddress(tokenAddress, "token address");
  try {
    const [name, symbol, decimals] = await Promise.all([
      client.readContract({ address, abi: erc20Abi, functionName: "name" }),
      client.readContract({ address, abi: erc20Abi, functionName: "symbol" }),
      client.readContract({ address, abi: erc20Abi, functionName: "decimals" }),
    ]);
    return { address, name, symbol, decimals };
  } catch (error) {
    throw new ContractError(
      "Failed to get token info",
      {
        operation: "getTokenInfo",
        contractAddress: tokenAddress,
        retryable: true,
      },
      error,
    );
  }
}

/**
 * Transfers ERC-20 tokens. Returns the transaction hash.
 */
export async function transferToken(
  walletClient: WalletClient<Transport, Chain, Account>,
  params: { token: string; to: string; amount: bigint },
): Promise<`0x${string}`> {
  const tokenAddress = validateAddress(params.token, "token address");
  const to = validateAddress(params.to, "recipient");
  validateAmount(params.amount);

  try {
    return await walletClient.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "transfer",
      args: [to, params.amount],
    });
  } catch (error) {
    throw new ContractError(
      "Token transfer failed",
      {
        operation: "transferToken",
        contractAddress: params.token,
        retryable: false,
      },
      error,
    );
  }
}

/**
 * Approves an ERC-20 spender. Returns the transaction hash.
 */
export async function approveToken(
  walletClient: WalletClient<Transport, Chain, Account>,
  params: { token: string; spender: string; amount: bigint },
): Promise<`0x${string}`> {
  const tokenAddress = validateAddress(params.token, "token address");
  const spender = validateAddress(params.spender, "spender address");
  validateAmount(params.amount);

  try {
    return await walletClient.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, params.amount],
    });
  } catch (error) {
    throw new ContractError(
      "Token approve failed",
      {
        operation: "approveToken",
        contractAddress: params.token,
        retryable: false,
      },
      error,
    );
  }
}
