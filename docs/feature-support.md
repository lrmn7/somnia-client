# Feature Support Matrix

This matrix documents the implementation status, test coverage, and verification provenance of all features in `somnia-client`.

---

## Supported & Implemented Features

| Feature | Category | Implementation Module | Status | Unit Tested | Verified Source |
|---|---|---|---|---|---|
| **Network Registry** | Chain | `src/chain/networks.ts` | **Full** | Yes (`12 tests`) | Somnia Developer Docs |
| **Explorer Builders** | Chain | `src/chain/explorer.ts` | **Full** | Yes (`6 tests`) | Somnia Developer Docs |
| **RPC Client Factories** | Chain | `src/chain/rpc.ts` | **Full** | Yes (`7 tests`) | viem / Somnia RPC |
| **Native Balance** | Wallet | `src/wallet/index.ts` | **Full** | Yes (`3 tests`) | Ethereum / Somnia RPC |
| **Native Transfer** | Wallet | `src/wallet/index.ts` | **Full** | Yes (`3 tests`) | Ethereum / Somnia RPC |
| **ERC-20 Balance** | Wallet | `src/wallet/index.ts` | **Full** | Yes (`3 tests`) | OpenZeppelin / ERC-20 ABI |
| **ERC-20 Metadata** | Token | `src/token/index.ts` | **Full** | Yes (`3 tests`) | ERC-20 Standard |
| **ERC-20 Transfer** | Token | `src/token/index.ts` | **Full** | Yes (`3 tests`) | ERC-20 Standard |
| **ERC-20 Approve** | Token | `src/token/index.ts` | **Full** | Yes (`3 tests`) | ERC-20 Standard |
| **Contract Read** | Contract | `src/contract/index.ts` | **Full** | Yes (`3 tests`) | viem `readContract` |
| **Contract Write** | Contract | `src/contract/index.ts` | **Full** | Yes (`2 tests`) | viem `writeContract` |
| **Contract Simulate** | Contract | `src/contract/index.ts` | **Full** | Yes (`2 tests`) | viem `simulateContract` |
| **Transaction Query** | Transaction | `src/transaction/index.ts` | **Full** | Yes (`3 tests`) | Somnia JSON-RPC |
| **Receipt Normalization** | Transaction | `src/transaction/index.ts` | **Full** | Yes (`4 tests`) | Somnia JSON-RPC |
| **Transaction Wait** | Transaction | `src/transaction/index.ts` | **Full** | Yes (`2 tests`) | viem `waitForTransactionReceipt` |
| **Address Formatters** | Discord | `src/discord/formatters/address.ts` | **Full** | Yes (`5 tests`) | Discord Markdown Spec |
| **Amount Formatters** | Discord | `src/discord/formatters/amount.ts` | **Full** | Yes (`4 tests`) | Discord Markdown Spec |
| **Timestamp Formatters** | Discord | `src/discord/formatters/timestamp.ts` | **Full** | Yes (`3 tests`) | Discord `<t:timestamp:style>` Spec |
| **Branded Embeds** | Discord | `src/discord/embeds/` | **Full** | Yes (`9 tests`) | discord.js EmbedBuilder |
| **Off-chain Reactivity** | Reactivity | `src/reactivity/client.ts` | **Full** | Yes (`7 tests`) | Somnia Reactivity Docs |
| **Error Hierarchy** | Errors | `src/errors/index.ts` | **Full** | Yes (`11 tests`) | SomniaError Architecture |
| **Input Validation** | Utilities | `src/utils/validation.ts` | **Full** | Yes (`12 tests`) | viem validators |
| **BigInt Formatting** | Utilities | `src/utils/formatting.ts` | **Full** | Yes (`13 tests`) | viem formatEther |
| **Retry Backoff** | Utilities | `src/utils/retry.ts` | **Full** | Yes (`9 tests`) | Exponential backoff spec |
| **Pluggable Logger** | Utilities | `src/utils/logger.ts` | **Full** | Yes (`2 tests`) | Logger Interface |
| **SomniaClient Facade** | Client | `src/client/SomniaClient.ts` | **Full** | Yes (`12 tests`) | Client Lifecycle |

---

## Deferred Features

| Feature | Target Module | Reason for Deferral | Resolution Plan |
|---|---|---|---|
| **Data Streams** | `src/streams/` | Requires official public release of `@somnia-chain/streams`. | Implement adapter once package is generally available on npm. |
| **Session Accounts** | `src/session/` | Requires stable `@somnia-chain/viem-session-account`. | Implement adapter when specification stabilizes. |
| **DreamDEX / Markets** | `src/markets/` | To keep core client lightweight, DEX integrations will be provided via separate optional package. | Create `@somnia-client/markets` companion package. |
| **Somnia Agents** | `src/agents/` | Somnia AI agent framework is currently experimental. | Provide examples and adapter once APIs are finalized. |
