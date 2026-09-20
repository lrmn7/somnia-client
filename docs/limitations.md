# Limitations & Product Boundaries

To ensure reliability, security, and maintainability, `somnia-client` enforces clear product boundaries. This document records what the package is, what it is not, and what features are intentionally deferred.

---

## What `somnia-client` Is Not

1. **Not a Discord Bot Framework**:
   `somnia-client` does not provide command registration routers, database ORMs, or shard managers. It provides Somnia client adapters and Discord embeds/formatters that integrate into your existing `discord.js` application.

2. **Not a Replacement for Somnia SDKs**:
   `somnia-client` builds on top of Somnia's protocol interfaces and `viem`. It does not fork or replace official protocol libraries.

3. **Not an On-Chain Reactivity Engine**:
   Somnia's on-chain reactivity involves Solidity contracts storing persistent subscriptions in validator state (`@somnia-chain/reactivity-contracts`). `somnia-client` handles **off-chain reactivity** (WebSocket push event subscriptions for Discord bots and backend services).

4. **Not a Full-Fledged Smart Contract Development Suite**:
   It is designed for consuming and interacting with contracts (reading, writing, simulating, ERC-20 operations), not compiling Solidity or deploying complex contract topologies (use Hardhat/Foundry for contract authoring).

---

## Deferred & Experimental Modules

In accordance with PRD verification rules, features that require unverified, experimental, or unpublished npm packages are deferred from the core client:

| Feature Area | Related Package | Status | Rationale |
|---|---|---|---|
| **Data Streams** | `@somnia-chain/streams` | Deferred | Awaiting verified public npm release and stable API specification. |
| **Session Accounts** | `@somnia-chain/viem-session-account` | Deferred | Experimental protocol feature. Will be offered as an optional adapter once finalized. |
| **DreamDEX / Markets** | `@somnia-chain/markets-sdk` | Planned Adapter | Published (~0.28.1), but kept out of core bundle to prevent heavy DEX dependencies in lightweight bots. |
| **Somnia Agents** | Somnia Agent SDK | Experimental | Research-stage agent framework; isolated from core blockchain functionality. |

---

## Technical Constraints

- **ESM-Only**: The package distributes standard ECMAScript modules (`"type": "module"`). CommonJS (`require()`) is not supported.
- **Node.js >= 22**: Driven by modern Web3 and `discord.js` 14.x requirements.
- **Transport Dependency for Reactivity**: Off-chain event subscriptions require a WebSocket-capable RPC endpoint (available by default on Somnia mainnet and testnet).
