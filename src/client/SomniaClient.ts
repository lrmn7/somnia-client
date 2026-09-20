/**
 * SomniaClient – central client for all somnia-client operations.
 *
 * Design:
 * - Lazy initialization: sub-modules created on first access
 * - Explicit lifecycle: connect() / close()
 * - The client does NOT own the user's bot or application
 * - The client provides namespaced access to chain, wallet, tx, contract, token, reactivity
 */

import type {
  Account,
  Chain,
  PrivateKeyAccount,
  PublicClient,
  Transport,
  WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  explorerAddressUrl,
  explorerBlockUrl,
  explorerTokenUrl,
  explorerTxUrl,
} from "../chain/explorer.js";
import { getNetwork } from "../chain/networks.js";
import type { NetworkName } from "../chain/networks.js";
import { createSomniaPublicClient, createSomniaWalletClient } from "../chain/rpc.js";
import type { RpcOptions } from "../chain/rpc.js";
import * as contractOps from "../contract/index.js";
import { NetworkError } from "../errors/index.js";
import * as reactivityOps from "../reactivity/index.js";
import * as tokenOps from "../token/index.js";
import * as txOps from "../transaction/index.js";
import type { Logger } from "../utils/logger.js";
import { noopLogger } from "../utils/logger.js";
import * as walletOps from "../wallet/index.js";

export interface SomniaClientOptions {
  /** Network to connect to. Default: "testnet". */
  network?: NetworkName;
  /** Private key for wallet operations (hex string, 0x-prefixed). */
  privateKey?: `0x${string}`;
  /** Custom RPC URLs. */
  rpc?: RpcOptions;
  /** Logger instance. Default: no-op. */
  logger?: Logger;
}

export class SomniaClient {
  readonly chain: Chain;
  readonly networkName: NetworkName;
  private readonly _logger: Logger;
  private readonly _rpcOptions?: RpcOptions;
  private _publicClient: PublicClient<Transport, Chain> | null = null;
  private _walletClient: WalletClient<Transport, Chain, Account> | null = null;
  private _account: PrivateKeyAccount | null = null;
  private _connected = false;

  constructor(options?: SomniaClientOptions) {
    this.networkName = options?.network ?? "testnet";
    this.chain = getNetwork(this.networkName);
    this._logger = options?.logger ?? noopLogger;
    this._rpcOptions = options?.rpc;

    if (options?.privateKey) {
      this._account = privateKeyToAccount(options.privateKey);
    }
  }

  /**
   * Initializes the underlying viem clients. Must be called before using
   * wallet/tx/contract/token/reactivity methods.
   */
  connect(): this {
    if (this._connected) return this;

    this._publicClient = createSomniaPublicClient(this.chain, this._rpcOptions);

    if (this._account) {
      this._walletClient = createSomniaWalletClient(this.chain, this._account, this._rpcOptions);
    }

    this._connected = true;
    this._logger.info(`Connected to ${this.chain.name} (chain ${this.chain.id})`);
    return this;
  }

  /**
   * Closes all connections and cleans up resources.
   */
  async close(): Promise<void> {
    this._publicClient = null;
    this._walletClient = null;
    this._connected = false;
    this._logger.info("Client closed");
  }

  get connected(): boolean {
    return this._connected;
  }

  private get publicClient(): PublicClient<Transport, Chain> {
    if (!this._publicClient) {
      throw new NetworkError("Client not connected. Call client.connect() first.", {
        operation: "getPublicClient",
        network: this.networkName,
      });
    }
    return this._publicClient;
  }

  private get walletClient(): WalletClient<Transport, Chain, Account> {
    if (!this._walletClient) {
      throw new NetworkError(
        "Wallet client not available. Provide a privateKey in options and call connect().",
        { operation: "getWalletClient", network: this.networkName },
      );
    }
    return this._walletClient;
  }

  /** Returns the account address, or null if no private key was provided. */
  get address(): `0x${string}` | null {
    return this._account?.address ?? null;
  }

  readonly explorer = {
    tx: (hash: string) => explorerTxUrl(this.chain, hash),
    address: (addr: string) => explorerAddressUrl(this.chain, addr),
    block: (blockNumber: bigint | number) => explorerBlockUrl(this.chain, blockNumber),
    token: (tokenAddr: string) => explorerTokenUrl(this.chain, tokenAddr),
  };

  readonly wallet = {
    getBalance: (address: string) => walletOps.getNativeBalance(this.publicClient, address),
    getTokenBalance: (params: { token: string; owner: string }) =>
      walletOps.getTokenBalance(this.publicClient, params),
    transfer: (params: walletOps.TransferParams) => walletOps.transfer(this.walletClient, params),
  };

  readonly tx = {
    get: (hash: string) => txOps.getTransaction(this.publicClient, hash),
    receipt: (hash: string) => txOps.getTransactionReceipt(this.publicClient, hash),
    wait: (hash: string, confirmations?: number) =>
      txOps.waitForTransaction(this.publicClient, hash, confirmations),
    explorerUrl: (hash: string) => txOps.getExplorerUrl(this.chain, hash),
  };

  readonly contract = {
    read: (params: contractOps.ContractCallParams) =>
      contractOps.readContract(this.publicClient, params),
    write: (params: contractOps.ContractWriteParams) =>
      contractOps.writeContract(this.walletClient, params),
    simulate: (params: contractOps.ContractWriteParams) =>
      contractOps.simulateContract(this.publicClient, params),
  };

  readonly token = {
    info: (tokenAddress: string) => tokenOps.getTokenInfo(this.publicClient, tokenAddress),
    transfer: (params: { token: string; to: string; amount: bigint }) =>
      tokenOps.transferToken(this.walletClient, params),
    approve: (params: { token: string; spender: string; amount: bigint }) =>
      tokenOps.approveToken(this.walletClient, params),
  };

  readonly reactivity = {
    subscribe: (
      options: reactivityOps.ReactivitySubscriptionOptions,
      onEvent: reactivityOps.ReactivityEventHandler,
      onError?: reactivityOps.ReactivityErrorHandler,
    ) => reactivityOps.subscribe(this.publicClient, options, onEvent, onError, this._logger),
  };
}
