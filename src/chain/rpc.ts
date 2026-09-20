/**
 * viem client factory for Somnia networks.
 */

import {
  http,
  type Account,
  type Chain,
  type PublicClient,
  type Transport,
  type WalletClient,
  createPublicClient,
  createWalletClient,
  webSocket,
} from "viem";

export interface RpcOptions {
  /** Override the default HTTP RPC URL. */
  httpUrl?: string;
  /** Override the default WebSocket RPC URL. */
  wsUrl?: string;
}

/**
 * Creates a viem PublicClient for the given Somnia chain.
 */
export function createSomniaPublicClient(
  chain: Chain,
  options?: RpcOptions,
): PublicClient<Transport, Chain> {
  const transport = options?.httpUrl ? http(options.httpUrl) : http();
  return createPublicClient({
    chain,
    transport,
  });
}

/**
 * Creates a viem WalletClient for the given Somnia chain.
 */
export function createSomniaWalletClient(
  chain: Chain,
  account: Account,
  options?: RpcOptions,
): WalletClient<Transport, Chain, Account> {
  const transport = options?.httpUrl ? http(options.httpUrl) : http();
  return createWalletClient({
    chain,
    account,
    transport,
  });
}

/**
 * Creates a WebSocket transport for the given chain.
 * Used by Reactivity subscriptions.
 */
export function createWsTransport(chain: Chain, options?: RpcOptions) {
  const wsUrl = options?.wsUrl ?? chain.rpcUrls.default.webSocket?.[0];
  if (!wsUrl) {
    throw new Error(`No WebSocket RPC URL configured for chain ${chain.name}`);
  }
  return webSocket(wsUrl);
}
