/**
 * Somnia network chain definitions.
 * Single source of truth for all network-specific configuration.
 *
 * Source: https://docs.somnia.network/developer/network-info
 * Verified: 2026-09-20
 */

import { type Chain, defineChain } from "viem";

export const somniaMainnet: Chain = defineChain({
  id: 5031,
  name: "Somnia",
  nativeCurrency: {
    name: "SOMI",
    symbol: "SOMI",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://api.infra.mainnet.somnia.network/"],
      webSocket: ["wss://api.infra.mainnet.somnia.network/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Somnia Explorer",
      url: "https://explorer.somnia.network",
    },
  },
});

export const somniaTestnet: Chain = defineChain({
  id: 50312,
  name: "Somnia Shannon Testnet",
  nativeCurrency: {
    name: "Somnia Test Token",
    symbol: "STT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://api.infra.testnet.somnia.network/"],
      webSocket: ["wss://api.infra.testnet.somnia.network/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Shannon Explorer",
      url: "https://shannon-explorer.somnia.network",
    },
  },
  testnet: true,
});

export type NetworkName = "mainnet" | "testnet";

const networks: Record<NetworkName, Chain> = {
  mainnet: somniaMainnet,
  testnet: somniaTestnet,
};

/**
 * Returns the viem Chain definition for the given network name.
 * Throws if the name is not a recognized Somnia network.
 */
export function getNetwork(name: NetworkName): Chain {
  const chain = networks[name];
  if (!chain) {
    throw new Error(`Unknown Somnia network: ${name}. Use "mainnet" or "testnet".`);
  }
  return chain;
}

/**
 * Returns all supported network names.
 */
export function getSupportedNetworks(): readonly NetworkName[] {
  return Object.keys(networks) as NetworkName[];
}
