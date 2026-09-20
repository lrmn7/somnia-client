# somnia-client

Discord-first client and abstraction layer for [Somnia](https://somnia.network) blockchain development.

[![npm version](https://img.shields.io/badge/npm-v0.1.0-CB3837?logo=npm&logoColor=white)](https://www.npmjs.com/package/somnia-client)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22-5FA04E?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Module](https://img.shields.io/badge/module-pure_ESM-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
[![Somnia Network](https://img.shields.io/badge/Somnia-EVM_Compatible-7C3AED?logo=ethereum&logoColor=white)](https://somnia.network)
[![Chain IDs](https://img.shields.io/badge/chain_IDs-5031_%7C_50312-0EA5E9)](./docs/network.md)
[![viem](https://img.shields.io/badge/blockchain-viem_v2.21+-1E293B?logo=ethereum&logoColor=white)](https://viem.sh)
[![discord.js](https://img.shields.io/badge/discord.js-v14.16+-5865F2?logo=discord&logoColor=white)](https://discord.js.org)
[![Reactivity](https://img.shields.io/badge/reactivity-WebSocket_Push-10B981?logo=socketdotio&logoColor=white)](./docs/feature-support.md)
[![Tests](https://img.shields.io/badge/tests-145_passing-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![Code Style: Biome](https://img.shields.io/badge/code_style-Biome-60A5FA?logo=biome&logoColor=white)](https://biomejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?logo=opensourceinitiative&logoColor=white)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://makeapullrequest.com)

## What is this?

`somnia-client` makes it significantly easier for Discord developers to build Somnia-powered backend applications, bots, automations, wallet trackers, and reactive notification systems.

**This is NOT:**
- A replacement for Somnia's official SDKs
- A Discord bot framework
- A new blockchain framework

**This IS:**
- A Discord-first abstraction layer built on top of Somnia's official protocol interfaces

## Features

- **Chain Management** Type-safe network registry for Somnia Mainnet & Shannon Testnet
- **Wallet Operations** Native token & ERC-20 balance queries, transfers
- **Transaction Lifecycle** Send, wait, receipt, status normalization
- **Contract Interaction** Read, write, simulate with any ABI
- **Token Helpers** ERC-20 metadata, transfer, approve
- **Reactivity** WebSocket-based event subscriptions (Somnia off-chain reactivity)
- **Discord Adapter** Ready-to-use embeds and formatters for Discord bots
- **Retry System** Bounded exponential backoff with retryable classification
- **Error System** Typed error hierarchy with structured context
- **Zero Config** Works out of the box with sensible defaults

## Installation

```bash
npm install somnia-client
```

For Discord features:
```bash
npm install somnia-client discord.js
```

## Quick Start

```typescript
import { SomniaClient } from "somnia-client";

// Create a client (defaults to Shannon testnet)
const client = new SomniaClient({
  network: "testnet",
  // privateKey: "0x..." // for write operations
});

// Connect to the network
client.connect();

// Check a wallet balance
const balance = await client.wallet.getBalance("0x...");
console.log(balance); // bigint in wei

// Get explorer URL
const url = client.explorer.tx("0x...");
console.log(url); // https://shannon-explorer.somnia.network/tx/0x...

// Clean up
await client.close();
```

### Environment Configuration

For Discord bot tokens, custom RPC endpoints, or optional signing keys, refer to the provided [`.env.example`](./.env.example) template:

```bash
cp .env.example .env
```

> **Security Note:** Never commit real private keys, API keys, or bot tokens to version control. Keep `.env` strictly in your local development environment.

## Discord Integration

```typescript
import { SomniaClient } from "somnia-client";
import {
  createWalletEmbed,
  createTransactionEmbed,
  formatAddressTruncated,
  formatTimestamp,
} from "somnia-client/discord";

// In a slash command handler:
const client = new SomniaClient({ network: "mainnet" }).connect();
const balance = await client.wallet.getBalance(userAddress);

const embed = createWalletEmbed({
  address: userAddress,
  nativeBalance: balance,
  explorerUrl: client.explorer.address(userAddress),
  networkName: client.chain.name,
});

await interaction.reply({ embeds: [embed] });
```

## Reactivity (Real-time Events)

```typescript
const subscription = client.reactivity.subscribe(
  {
    address: "0x...",       // contract address
    abi: myContractAbi,
    eventName: "Transfer",  // specific event
  },
  (event) => {
    console.log("Transfer detected!", event.log);
    // Send Discord notification, update database, etc.
  },
  (error) => {
    console.error("Subscription error:", error);
  },
);

// Later: clean up
await subscription.unsubscribe();
```

## Network Configuration

| Network | Chain ID | Token | RPC |
|---------|----------|-------|-----|
| Mainnet | 5031 | SOMI | `https://api.infra.mainnet.somnia.network/` |
| Shannon Testnet | 50312 | STT | `https://api.infra.testnet.somnia.network/` |

## API Reference

### SomniaClient

| Namespace | Method | Description |
|-----------|--------|-------------|
| `wallet` | `getBalance(address)` | Get native token balance |
| `wallet` | `getTokenBalance({token, owner})` | Get ERC-20 balance |
| `wallet` | `transfer({to, amount})` | Send native tokens |
| `tx` | `get(hash)` | Get transaction by hash |
| `tx` | `receipt(hash)` | Get normalized receipt |
| `tx` | `wait(hash, confirmations?)` | Wait for confirmation |
| `contract` | `read(params)` | Call view/pure function |
| `contract` | `write(params)` | Send state-changing tx |
| `contract` | `simulate(params)` | Dry-run a write |
| `token` | `info(address)` | Get name, symbol, decimals |
| `token` | `transfer({token, to, amount})` | ERC-20 transfer |
| `token` | `approve({token, spender, amount})` | ERC-20 approve |
| `reactivity` | `subscribe(options, handler, errorHandler?)` | Subscribe to events |
| `explorer` | `tx(hash)` / `address(addr)` / `block(num)` / `token(addr)` | Explorer URLs |

### Discord Adapter (`somnia-client/discord`)

**Formatters:** `formatAddressCode`, `formatAddressTruncated`, `formatAddressLink`, `formatAmountBold`, `formatAmountFixed`, `formatTokenAmountDisplay`, `formatTimestamp`, `formatDate`, `formatNow`

**Embeds:** `createSomniaEmbed`, `createSuccessEmbed`, `createErrorEmbed`, `createInfoEmbed`, `createWarningEmbed`, `createTransactionEmbed`, `createTransferEmbed`, `createWalletEmbed`

## Error Handling

All errors extend `SomniaError` with structured context:

```typescript
try {
  await client.wallet.getBalance("invalid");
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(error.code);       // "VALIDATION_ERROR"
    console.log(error.operation);  // "validateAddress"
    console.log(error.retryable);  // false
  }
}
```

## Documentation

Comprehensive guides and technical documentation are available in the [`docs/`](./docs) directory:

- [Getting Started Guide](./docs/getting-started.md) — Installation and quickstart examples
- [Architecture & Design](./docs/architecture.md) — Module hierarchy and patterns
- [Client Configuration](./docs/configuration.md) — RPC options, private keys, and logging
- [Network Registry](./docs/network.md) — Somnia Mainnet and Testnet endpoints
- [Security Best Practices](./docs/security.md) — Key security, permissions, rate limits
- [Limitations & Boundaries](./docs/limitations.md) — Supported vs deferred features
- [Compatibility Matrix](./docs/compatibility.md) — Engine and framework support
- [Feature Support Matrix](./docs/feature-support.md) — Status and testing provenance

## Development

```bash
npm install          # Install dependencies
npm run typecheck    # Type checking
npm run test         # Run tests
npm run build        # Build for production
npm run lint         # Lint with Biome
```

## Requirements

- Node.js >= 22
- TypeScript >= 5.6

## License

[MIT](./LICENSE)
