# Security Best Practices

Building Web3 applications and Discord bots involves distinct security boundaries. This document details recommended patterns when using `somnia-client`.

---

## 1. Private Key Management

### Keep Private Keys Out of Code & Git
- **Never hardcode private keys** in source files or configuration committed to version control.
- Use environment variables (`process.env.SOMNIA_PRIVATE_KEY`) or secret managers (e.g. AWS Secrets Manager, HashiCorp Vault).
- Always include `.env` in `.gitignore`.

### Use Read-Only Mode When Possible
If your Discord bot only looks up balances, tracks transactions, queries tokens, or listens to events, **do not provide a private key**:

```ts
// Secure read-only bot – no private key provided
const client = new SomniaClient({ network: "testnet" });
client.connect();
```

Any attempt to call state-changing methods without a private key will immediately fail with a clean `NetworkError` before reaching the network.

---

## 2. Discord Bot Authorization & Access Control

### Restrict State-Changing Commands
If your bot performs automated actions (faucets, transfers, reward distributions), restrict access to authorized roles or Discord administrators:

```ts
import { PermissionFlagsBits } from "discord.js";

// Slash command definition with permission restriction
export const transferCommand = {
  name: "transfer",
  description: "Send STT to an address (Admin only)",
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  // ...
};
```

### Protect Against Sybil / Abuse on Discord
- Never allow unverified or anonymous Discord users to trigger unmetered native or token transfers.
- Implement rate limiting (cooldowns) on Discord slash commands.
- Use Discord user ID tracking and database-backed transaction logs.

### Ephemeral Responses for Sensitive Feedback
For operations involving personal balances or internal states, use ephemeral replies:

```ts
await interaction.reply({
  embeds: [walletEmbed],
  ephemeral: true, // Only visible to the requesting user
});
```

---

## 3. Input Validation

`somnia-client` includes built-in validators for addresses, transaction hashes, and amounts:

```ts
import { validateAddress, validateTxHash, validateAmount } from "somnia-client";

// Validates Ethereum/Somnia checksum address format
const addr = validateAddress(rawInput, "recipient");

// Validates 66-character 0x-prefixed hex string
const hash = validateTxHash(rawHash);

// Enforces non-negative bigint
const amount = validateAmount(rawBigInt);
```

Every public SDK method automatically validates arguments before executing contract calls or submitting transactions, throwing structured `ValidationError` instances if input criteria fail.

---

## 4. RPC & Transport Safety

- **Bounded Retries**: Use `withRetry` with bounded attempts (e.g. 3 attempts) and exponential delays to prevent hammering public RPC nodes.
- **WebSocket Resilience**: The Reactivity module safely catches asynchronous handler rejections and routes them to error callbacks without crashing the process.
- **Resource Cleanup**: Always call `client.close()` or `subscription.unsubscribe()` during process shutdown (e.g. `SIGINT`, `SIGTERM`) to release WebSocket connections cleanly.
