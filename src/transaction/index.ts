/**
 * Transaction lifecycle operations.
 */

import type { Chain, PublicClient, TransactionReceipt, Transport } from "viem";
import { explorerTxUrl } from "../chain/explorer.js";
import { TransactionError } from "../errors/index.js";
import { validateTxHash } from "../utils/validation.js";

export type TransactionStatus = "submitted" | "confirmed" | "reverted" | "not_found";

export interface NormalizedReceipt {
  hash: `0x${string}`;
  status: TransactionStatus;
  blockNumber: bigint;
  gasUsed: bigint;
  from: string;
  to: string | null;
  contractAddress: string | null;
}

function normalizeReceipt(receipt: TransactionReceipt): NormalizedReceipt {
  return {
    hash: receipt.transactionHash,
    status: receipt.status === "success" ? "confirmed" : "reverted",
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed,
    from: receipt.from,
    to: receipt.to,
    contractAddress: receipt.contractAddress ?? null,
  };
}

/**
 * Gets a transaction by hash.
 */
export async function getTransaction(client: PublicClient<Transport, Chain>, hash: string) {
  const validated = validateTxHash(hash);
  try {
    return await client.getTransaction({ hash: validated });
  } catch (error) {
    throw new TransactionError(
      `Failed to get transaction ${hash}`,
      {
        operation: "getTransaction",
        transactionHash: hash,
        retryable: true,
      },
      error,
    );
  }
}

/**
 * Gets a transaction receipt. Returns null if the receipt is not yet available.
 */
export async function getTransactionReceipt(
  client: PublicClient<Transport, Chain>,
  hash: string,
): Promise<NormalizedReceipt | null> {
  const validated = validateTxHash(hash);
  try {
    const receipt = await client.getTransactionReceipt({ hash: validated });
    return normalizeReceipt(receipt);
  } catch (error) {
    // viem throws when receipt is not found
    if (error instanceof Error && error.message.includes("could not be found")) {
      return null;
    }
    throw new TransactionError(
      `Failed to get receipt for ${hash}`,
      {
        operation: "getTransactionReceipt",
        transactionHash: hash,
        retryable: true,
      },
      error,
    );
  }
}

/**
 * Waits for a transaction to be confirmed. Returns the normalized receipt.
 */
export async function waitForTransaction(
  client: PublicClient<Transport, Chain>,
  hash: string,
  confirmations = 1,
): Promise<NormalizedReceipt> {
  const validated = validateTxHash(hash);
  try {
    const receipt = await client.waitForTransactionReceipt({
      hash: validated,
      confirmations,
    });
    return normalizeReceipt(receipt);
  } catch (error) {
    throw new TransactionError(
      `Transaction wait failed for ${hash}`,
      {
        operation: "waitForTransaction",
        transactionHash: hash,
        retryable: true,
      },
      error,
    );
  }
}

/**
 * Returns the block explorer URL for a transaction hash.
 */
export function getExplorerUrl(chain: Chain, hash: string): string {
  return explorerTxUrl(chain, hash);
}
