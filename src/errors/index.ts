/**
 * Error system for somnia-client.
 *
 * Every error includes structured context without leaking secrets.
 * Error messages never contain private keys, session seeds, or tokens.
 */

export interface SomniaErrorContext {
  /** Machine-readable error code. */
  code: string;
  /** The operation that failed. */
  operation?: string;
  /** The network where the error occurred. */
  network?: string;
  /** Whether the operation can be retried. */
  retryable?: boolean;
  /** Transaction hash, if relevant. */
  transactionHash?: string;
  /** Contract address, if relevant. */
  contractAddress?: string;
  /** Event name, if relevant. */
  eventName?: string;
  /** The module that produced the error. */
  module?: string;
}

export class SomniaError extends Error {
  readonly code: string;
  readonly operation?: string;
  readonly network?: string;
  readonly retryable: boolean;
  readonly transactionHash?: string;
  readonly contractAddress?: string;
  readonly eventName?: string;
  readonly module?: string;

  constructor(message: string, context: SomniaErrorContext, cause?: unknown) {
    super(message, { cause });
    this.name = "SomniaError";
    this.code = context.code;
    this.operation = context.operation;
    this.network = context.network;
    this.retryable = context.retryable ?? false;
    this.transactionHash = context.transactionHash;
    this.contractAddress = context.contractAddress;
    this.eventName = context.eventName;
    this.module = context.module;
  }
}

export class NetworkError extends SomniaError {
  constructor(message: string, context: Omit<SomniaErrorContext, "code">, cause?: unknown) {
    super(message, { ...context, code: "NETWORK_ERROR", module: context.module ?? "chain" }, cause);
    this.name = "NetworkError";
  }
}

export class RpcError extends SomniaError {
  constructor(message: string, context: Omit<SomniaErrorContext, "code">, cause?: unknown) {
    super(message, { ...context, code: "RPC_ERROR", module: context.module ?? "chain" }, cause);
    this.name = "RpcError";
  }
}

export class ValidationError extends SomniaError {
  constructor(message: string, context: Omit<SomniaErrorContext, "code">, cause?: unknown) {
    super(
      message,
      {
        ...context,
        code: "VALIDATION_ERROR",
        retryable: false,
        module: context.module ?? "validation",
      },
      cause,
    );
    this.name = "ValidationError";
  }
}

export class WalletError extends SomniaError {
  constructor(message: string, context: Omit<SomniaErrorContext, "code">, cause?: unknown) {
    super(message, { ...context, code: "WALLET_ERROR", module: context.module ?? "wallet" }, cause);
    this.name = "WalletError";
  }
}

export class ContractError extends SomniaError {
  constructor(message: string, context: Omit<SomniaErrorContext, "code">, cause?: unknown) {
    super(
      message,
      { ...context, code: "CONTRACT_ERROR", module: context.module ?? "contract" },
      cause,
    );
    this.name = "ContractError";
  }
}

export class TransactionError extends SomniaError {
  constructor(message: string, context: Omit<SomniaErrorContext, "code">, cause?: unknown) {
    super(
      message,
      { ...context, code: "TRANSACTION_ERROR", module: context.module ?? "transaction" },
      cause,
    );
    this.name = "TransactionError";
  }
}

export class ReactivityError extends SomniaError {
  constructor(message: string, context: Omit<SomniaErrorContext, "code">, cause?: unknown) {
    super(
      message,
      { ...context, code: "REACTIVITY_ERROR", module: context.module ?? "reactivity" },
      cause,
    );
    this.name = "ReactivityError";
  }
}

export class StreamError extends SomniaError {
  constructor(message: string, context: Omit<SomniaErrorContext, "code">, cause?: unknown) {
    super(
      message,
      { ...context, code: "STREAM_ERROR", module: context.module ?? "streams" },
      cause,
    );
    this.name = "StreamError";
  }
}

export class SessionError extends SomniaError {
  constructor(message: string, context: Omit<SomniaErrorContext, "code">, cause?: unknown) {
    super(
      message,
      { ...context, code: "SESSION_ERROR", module: context.module ?? "session" },
      cause,
    );
    this.name = "SessionError";
  }
}

export class MarketError extends SomniaError {
  constructor(message: string, context: Omit<SomniaErrorContext, "code">, cause?: unknown) {
    super(
      message,
      { ...context, code: "MARKET_ERROR", module: context.module ?? "markets" },
      cause,
    );
    this.name = "MarketError";
  }
}

export class DiscordIntegrationError extends SomniaError {
  constructor(message: string, context: Omit<SomniaErrorContext, "code">, cause?: unknown) {
    super(
      message,
      { ...context, code: "DISCORD_ERROR", module: context.module ?? "discord" },
      cause,
    );
    this.name = "DiscordIntegrationError";
  }
}
