/**
 * somnia-client
 *
 * Discord-first client and abstraction layer for Somnia blockchain development.
 *
 * @example
 * ```ts
 * import { SomniaClient } from "somnia-client";
 *
 * const client = new SomniaClient({ network: "testnet" });
 * client.connect();
 *
 * const balance = await client.wallet.getBalance("0x...");
 * console.log(balance);
 *
 * await client.close();
 * ```
 */

export { SomniaClient } from "./client/index.js";
export type { SomniaClientOptions } from "./client/index.js";
export {
  somniaMainnet,
  somniaTestnet,
  getNetwork,
  getSupportedNetworks,
} from "./chain/index.js";
export type { NetworkName, RpcOptions } from "./chain/index.js";
export {
  explorerTxUrl,
  explorerAddressUrl,
  explorerBlockUrl,
  explorerTokenUrl,
} from "./chain/index.js";
export {
  createSomniaPublicClient,
  createSomniaWalletClient,
  createWsTransport,
} from "./chain/index.js";
export {
  SomniaError,
  NetworkError,
  RpcError,
  ValidationError,
  WalletError,
  ContractError,
  TransactionError,
  ReactivityError,
  StreamError,
  SessionError,
  MarketError,
  DiscordIntegrationError,
} from "./errors/index.js";
export type { SomniaErrorContext } from "./errors/index.js";
export {
  validateAddress,
  validateTxHash,
  validateAmount,
  formatNativeAmount,
  formatTokenAmount,
  truncateAddress,
  formatEtherFixed,
  noopLogger,
  consoleLogger,
  withRetry,
  isRetryable,
} from "./utils/index.js";
export type { Logger, RetryOptions } from "./utils/index.js";
export { getNativeBalance, getTokenBalance, transfer } from "./wallet/index.js";
export type { TransferParams } from "./wallet/index.js";
export {
  getTransaction,
  getTransactionReceipt,
  waitForTransaction,
  getExplorerUrl,
} from "./transaction/index.js";
export type { TransactionStatus, NormalizedReceipt } from "./transaction/index.js";
export { readContract, writeContract, simulateContract } from "./contract/index.js";
export type { ContractCallParams, ContractWriteParams } from "./contract/index.js";
export { getTokenInfo, transferToken, approveToken } from "./token/index.js";
export type { TokenInfo } from "./token/index.js";
export { subscribe } from "./reactivity/index.js";
export type {
  ReactivitySubscriptionOptions,
  ReactivityEvent,
  ReactivityEventHandler,
  ReactivityErrorHandler,
  ReactivitySubscription,
} from "./reactivity/index.js";
