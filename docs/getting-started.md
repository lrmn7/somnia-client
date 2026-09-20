# Getting Started with `somnia-client`

`somnia-client` is a Discord-first client and abstraction layer for building applications on the [Somnia](https://somnia.network) EVM L1 blockchain.

It sits above official Somnia protocol interfaces and `viem`, giving Discord bot developers, automation engineers, and Web3 builders a typed, intuitive API with built-in Discord embeds, formatters, and off-chain event reactivity.

---

## Prerequisites

- **Node.js**: `>= 22.0.0` (ESM only)
- **Package Manager**: `npm`, `pnpm`, or `yarn`

---

## Installation

Install `somnia-client` and its peer dependency `viem`:

```bash
npm install somnia-client viem
```

If you are building a Discord bot, also install `discord.js`:

```bash
npm install discord.js
```

> **Note**: `discord.js` is an optional peer dependency. Core blockchain functionality (queries, transfers, contract calls, reactivity) works without `discord.js`.

---

## Quickstart 1: Basic Balance & Transaction Query

```ts
import { SomniaClient, formatNativeAmount, truncateAddress } from "somnia-client";

// Initialize client for Shannon testnet (default) or mainnet
const client = new SomniaClient({
  network: "testnet", // or "mainnet"
});

// Explicit connection lifecycle
client.connect();

// Query native STT balance
const address = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
const balanceWei = await client.wallet.getBalance(address);

console.log(`Address: ${truncateAddress(address)}`);
console.log(`Balance: ${formatNativeAmount(balanceWei, "STT")}`);

// Fetch transaction details
const txHash = "0x...";
const receipt = await client.tx.receipt(txHash);

if (receipt) {
  console.log(`Status: ${receipt.status}`);
  console.log(`Gas used: ${receipt.gasUsed}`);
  console.log(`Explorer: ${client.explorer.tx(txHash)}`);
}

// Clean up connections when finished
await client.close();
```

---

## Quickstart 2: Discord Slash Command with Somnia Embed

```ts
import { Client, GatewayIntentBits, ChatInputCommandInteraction } from "discord.js";
import { SomniaClient } from "somnia-client";
import { createWalletEmbed, formatAddressCode } from "somnia-client/discord";

const somnia = new SomniaClient({ network: "testnet" });
somnia.connect();

const discord = new Client({
  intents: [GatewayIntentBits.Guilds],
});

discord.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "balance") {
    const targetAddress = interaction.options.getString("address", true);

    try {
      await interaction.deferReply();

      const balanceWei = await somnia.wallet.getBalance(targetAddress);
      const explorerUrl = somnia.explorer.address(targetAddress);

      // Create a branded Discord embed
      const embed = createWalletEmbed({
        address: targetAddress,
        nativeBalance: balanceWei,
        nativeSymbol: "STT",
        networkName: somnia.chain.name,
        explorerUrl,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({
        content: `❌ Failed to fetch balance for ${formatAddressCode(targetAddress)}: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }
});

discord.login(process.env.DISCORD_BOT_TOKEN);
```

---

## Quickstart 3: Off-Chain Reactivity (Live Event Alerts)

Somnia's high-throughput off-chain reactivity enables listening to contract events via WebSockets without polling:

```ts
import { SomniaClient } from "somnia-client";
import { createTransferEmbed } from "somnia-client/discord";
import type { TextChannel } from "discord.js";

const somnia = new SomniaClient({ network: "testnet" });
somnia.connect();

// ERC-20 Transfer event ABI
const transferEventAbi = [
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { type: "address", name: "from", indexed: true },
      { type: "address", name: "to", indexed: true },
      { type: "uint256", name: "value", indexed: false },
    ],
  },
] as const;

// Subscribe to contract events
const sub = somnia.reactivity.subscribe(
  {
    address: "0xTokenContractAddress...",
    abi: transferEventAbi,
    eventName: "Transfer",
  },
  async (event) => {
    console.log(`New transfer event received at ${event.receivedAt}:`, event.log);

    // Send formatted embed to a Discord channel
    const channel = discord.channels.cache.get("CHANNEL_ID") as TextChannel;
    if (channel) {
      const embed = createTransferEmbed({
        from: event.log.topics[1] as string,
        to: event.log.topics[2] as string,
        amount: BigInt(event.log.data),
        symbol: "SOM",
        hash: event.log.transactionHash!,
        explorerUrl: somnia.explorer.tx(event.log.transactionHash!),
      });
      await channel.send({ embeds: [embed] });
    }
  },
  (err) => {
    console.error("Reactivity subscription error:", err);
  },
);

// To unsubscribe later:
// await sub.unsubscribe();
```

---

## Next Steps

- Check [Architecture](architecture.md) for structural overview and design patterns.
- Read [Configuration](configuration.md) for custom RPC, private key handling, and logging options.
- Read [Security](security.md) for private key protection and safe Discord bot architecture.
