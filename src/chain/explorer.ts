/**
 * Explorer URL builders for Somnia networks.
 */

import type { Chain } from "viem";

function getExplorerBaseUrl(chain: Chain): string {
  const explorer = chain.blockExplorers?.default;
  if (!explorer) {
    throw new Error(`No block explorer configured for chain ${chain.name}`);
  }
  return explorer.url.replace(/\/+$/, "");
}

export function explorerTxUrl(chain: Chain, hash: string): string {
  return `${getExplorerBaseUrl(chain)}/tx/${hash}`;
}

export function explorerAddressUrl(chain: Chain, address: string): string {
  return `${getExplorerBaseUrl(chain)}/address/${address}`;
}

export function explorerBlockUrl(chain: Chain, blockNumber: bigint | number): string {
  return `${getExplorerBaseUrl(chain)}/block/${blockNumber.toString()}`;
}

export function explorerTokenUrl(chain: Chain, tokenAddress: string): string {
  return `${getExplorerBaseUrl(chain)}/token/${tokenAddress}`;
}
