# Client Configuration

`SomniaClient` provides a flexible configuration interface that defaults to zero-config Shannon Testnet settings while supporting custom RPC endpoints, private keys, and pluggable logging.

---

## Configuration Options

```ts
import { SomniaClient, type SomniaClientOptions } from "somnia-client";

const options: SomniaClientOptions = {
  // Network selection: "testnet" (default) or "mainnet"
  network: "testnet",

  // Optional: Private key for signing transactions (hex string, 0x-prefixed)
  // Omit for read-only bots/trackers
  privateKey: process.env.SOMNIA_PRIVATE_KEY as `0x${string}`,

  // Optional: Override default RPC endpoints
  rpc: {
    httpUrl: "https://my-custom-somnia-node.example.com",
    wsUrl: "wss://my-custom-somnia-node.example.com/ws",
  },

  // Optional: Pluggable logger (default: noopLogger)
  logger: consoleLogger,
};

const client = new SomniaClient(options);
client.connect();
```

---

## Options Reference

| Option | Type | Default | Description |
|---|---|---|---|
| `network` | `"mainnet" \| "testnet"` | `"testnet"` | Selects chain ID (5031 vs 50312), default RPCs, native tokens, and explorer links. |
| `privateKey` | `0x${string}` | `undefined` | Required only when performing state-changing operations (`wallet.transfer`, `contract.write`, `token.transfer`, `token.approve`). |
| `rpc.httpUrl` | `string` | Official default | Custom JSON-RPC HTTP endpoint. Useful for dedicated nodes or private gateways. |
| `rpc.wsUrl` | `string` | Official default | Custom WebSocket RPC endpoint. Used for off-chain reactivity and event watching. |
| `logger` | `Logger` | `noopLogger` | Custom logger implementing `{ debug, info, warn, error }`. `consoleLogger` is provided out of the box. |

---

## Recommended `.env` Structure

For production Discord applications, manage configuration through environment variables:

```env
# Network selection
SOMNIA_NETWORK=testnet

# Wallet Signing (KEEP SECRET - NEVER COMMIT TO GIT)
SOMNIA_PRIVATE_KEY=0x...

# Optional Custom RPC
SOMNIA_HTTP_RPC=https://api.infra.testnet.somnia.network/
SOMNIA_WS_RPC=wss://api.infra.testnet.somnia.network/ws

# Discord Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_application_id_here
DISCORD_GUILD_ID=optional_dev_guild_id
```

### Loading Environment Variables

```ts
import "dotenv/config";
import { SomniaClient, consoleLogger } from "somnia-client";

const client = new SomniaClient({
  network: (process.env.SOMNIA_NETWORK as "mainnet" | "testnet") ?? "testnet",
  privateKey: process.env.SOMNIA_PRIVATE_KEY as `0x${string}` | undefined,
  rpc: {
    httpUrl: process.env.SOMNIA_HTTP_RPC,
    wsUrl: process.env.SOMNIA_WS_RPC,
  },
  logger: process.env.NODE_ENV === "development" ? consoleLogger : undefined,
});
```

---

## Custom Logger Integration

You can easily bind popular logging frameworks like `pino` or `winston`:

```ts
import pino from "pino";
import { SomniaClient, type Logger } from "somnia-client";

const pinoInstance = pino();

const logger: Logger = {
  debug: (msg, ...args) => pinoInstance.debug({ args }, msg),
  info: (msg, ...args) => pinoInstance.info({ args }, msg),
  warn: (msg, ...args) => pinoInstance.warn({ args }, msg),
  error: (msg, ...args) => pinoInstance.error({ args }, msg),
};

const client = new SomniaClient({ logger });
```
