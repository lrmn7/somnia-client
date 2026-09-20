# Network Registry & Chain Configuration

`somnia-client` includes typed definitions for Somnia chains, officially verified against [Somnia Developer Documentation](https://docs.somnia.network/developer/network-info).

---

## Network Comparison

| Parameter | Somnia Mainnet | Somnia Shannon Testnet |
|---|---|---|
| **Chain ID** | `5031` | `50312` |
| **Network Name** | `Somnia Mainnet` | `Somnia Shannon Testnet` |
| **Native Currency** | `SOMI` | `STT` (Somnia Testnet Token) |
| **Decimals** | `18` | `18` |
| **HTTP RPC** | `https://api.infra.mainnet.somnia.network/` | `https://api.infra.testnet.somnia.network/` |
| **WebSocket RPC** | `wss://api.infra.mainnet.somnia.network/ws` | `wss://api.infra.testnet.somnia.network/ws` |
| **Block Explorer** | `https://explorer.somnia.network` | `https://shannon-explorer.somnia.network` |

---

## Programmatic Access

You can access raw viem `Chain` definitions or helper functions directly:

```ts
import {
  somniaMainnet,
  somniaTestnet,
  getNetwork,
  getSupportedNetworks,
} from "somnia-client";

// Direct viem Chain objects
console.log(somniaMainnet.id); // 5031
console.log(somniaTestnet.id); // 50312

// Lookup network by name
const testnet = getNetwork("testnet");

// List all supported networks
const networks = getSupportedNetworks();
// [somniaMainnet, somniaTestnet]
```

---

## Explorer URL Builders

Generate verified block explorer URLs for transactions, wallets, blocks, and tokens:

```ts
import {
  somniaTestnet,
  explorerTxUrl,
  explorerAddressUrl,
  explorerBlockUrl,
  explorerTokenUrl,
} from "somnia-client";

const txLink = explorerTxUrl(somniaTestnet, "0x...");
// https://shannon-explorer.somnia.network/tx/0x...

const addrLink = explorerAddressUrl(somniaTestnet, "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
// https://shannon-explorer.somnia.network/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045

const blockLink = explorerBlockUrl(somniaTestnet, 12345n);
// https://shannon-explorer.somnia.network/block/12345

const tokenLink = explorerTokenUrl(somniaTestnet, "0xTokenAddress...");
// https://shannon-explorer.somnia.network/token/0xTokenAddress...
```

When using `SomniaClient`, these builders are pre-bound to your active network:

```ts
const client = new SomniaClient({ network: "mainnet" });

client.explorer.tx("0x...");
client.explorer.address("0x...");
client.explorer.block(12345);
client.explorer.token("0x...");
```
