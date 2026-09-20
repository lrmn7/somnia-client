# Architecture & Design Patterns

This document outlines the architectural principles, layers, and module boundaries of `somnia-client`.

---

## 1. High-Level Architecture

`somnia-client` sits above official Somnia protocol interfaces and `viem`, bridging blockchain operations with Discord-friendly abstractions:

```text
┌─────────────────────────────────────────────────────────┐
│              Discord Bot / Application Layer            │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                     somnia-client                       │
│  ┌──────────────────────┐    ┌───────────────────────┐  │
│  │     SomniaClient     │    │  somnia-client/discord│  │
│  │ (namespaced facades) │    │  (embeds, formatters) │  │
│  └──────────┬───────────┘    └───────────┬───────────┘  │
│             │                            │              │
│  ┌──────────▼────────────────────────────▼───────────┐  │
│  │  Core Modules:                                    │  │
│  │  • chain      • wallet      • transaction         │  │
│  │  • contract   • token       • reactivity          │  │
│  │  • errors     • utils       • logger              │  │
│  └──────────────────────┬────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     Protocol Layer                      │
│      • viem (HTTP & WebSocket Public/Wallet Clients)    │
│      • Somnia JSON-RPC & Off-Chain Reactivity           │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Product Boundaries & Philosophy

1. **Non-Invasive**: `somnia-client` does NOT replace your Discord framework or command router. Developers retain complete control over Discord client instantiation, intent configuration, and event routing.
2. **Optional Discord Dependency**: `discord.js` is a peer dependency. Developers who only require Somnia blockchain interactions, wallet scripts, or reactivity pipelines do not need to install `discord.js`.
3. **Conservative Claims**: The SDK wraps only stable, verified protocol capabilities. Experimental or non-public packages (such as early drafts of Data Streams SDK or Session Accounts) remain isolated or deferred until verified against official releases.
4. **Native BigInt**: All blockchain values (balances, token amounts, gas, block numbers) use native JavaScript `bigint` types. No floating-point loss or imprecise numbers.

---

## 3. Namespaced Client Pattern

The `SomniaClient` provides discoverable, namespaced access to core operations:

```ts
const client = new SomniaClient({ network: "testnet" });
client.connect();

// Namespaces:
client.wallet     // getBalance, getTokenBalance, transfer
client.tx         // get, receipt, wait, explorerUrl
client.contract   // read, write, simulate
client.token      // info, transfer, approve
client.reactivity // subscribe (off-chain WebSocket events)
client.explorer   // tx, address, block, token URLs
```

Each namespace calls standalone, pure module functions under `src/`, allowing tree-shaking and standalone import when the full client instance is not desired.

---

## 4. Explicit Lifecycle

`SomniaClient` enforces an explicit lifecycle:

- `connect()`: Prepares the underlying `viem` HTTP and WebSocket clients. Sub-modules guard against invocation before `connect()` with descriptive `NetworkError` exceptions.
- `close()`: Cleans up active client handles and releases underlying resources.
- `connected`: Boolean status indicator.

---

## 5. Structured Error System

All errors thrown by the SDK inherit from `SomniaError`. Each error contains structured, typed metadata:

```ts
export interface SomniaErrorContext {
  code: string;
  operation?: string;
  network?: string;
  retryable?: boolean;
  contractAddress?: string;
  transactionHash?: string;
  [key: string]: unknown;
}
```

### Domain-Specific Subclasses

| Class | Error Code | Example Context |
|---|---|---|
| `NetworkError` | `NETWORK_ERROR` | Connection failed, client not connected |
| `RpcError` | `RPC_ERROR` | RPC HTTP/WS transport failure |
| `ValidationError` | `VALIDATION_ERROR` | Malformed address, invalid tx hash, negative amount |
| `WalletError` | `WALLET_ERROR` | Balance query failed, insufficient funds |
| `ContractError` | `CONTRACT_ERROR` | Contract revert, execution failure, simulation error |
| `TransactionError`| `TRANSACTION_ERROR`| Wait timeout, dropped tx, unconfirmed tx |
| `ReactivityError` | `REACTIVITY_ERROR` | WebSocket subscription failure, unwatch error |
| `StreamError` | `STREAM_ERROR` | Data Streams communication error |
| `SessionError` | `SESSION_ERROR` | Session key / account validation failure |
| `MarketError` | `MARKET_ERROR` | Orderbook / DEX execution error |
| `DiscordIntegrationError` | `DISCORD_ERROR` | Embed generation or formatting failure |

### Cause Chaining & Retryability

Every error preserves the underlying caught exception via standard JavaScript `cause`. The `retryable` boolean allows retry utilities (`withRetry`) to intelligently retry transient network glitches while immediately failing deterministic errors (e.g. invalid inputs or contract reverts).
