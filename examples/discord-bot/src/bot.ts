import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  type TextChannel,
} from "discord.js";
import {
  SomniaClient,
  SomniaError,
  consoleLogger,
} from "somnia-client";
import {
  createErrorEmbed,
  createSuccessEmbed,
  createTransactionEmbed,
  createTransferEmbed,
  createWalletEmbed,
  formatAddressCode,
} from "somnia-client/discord";
import { parseEther } from "viem";

const discordToken = process.env.DISCORD_BOT_TOKEN;
if (!discordToken) {
  console.error("Missing DISCORD_BOT_TOKEN in .env");
  process.exit(1);
}

// 1. Initialize Somnia Client
const networkName = (process.env.SOMNIA_NETWORK as "mainnet" | "testnet") ?? "testnet";
const somnia = new SomniaClient({
  network: networkName,
  privateKey: process.env.SOMNIA_PRIVATE_KEY as `0x${string}` | undefined,
  logger: consoleLogger,
});
somnia.connect();

// 2. Initialize Discord Client
const discord = new Client({
  intents: [GatewayIntentBits.Guilds],
});

discord.once("ready", (client) => {
  console.log(`🤖 Discord bot logged in as ${client.user.tag}`);
  console.log(`⚡ Connected to Somnia: ${somnia.chain.name} (Chain ID: ${somnia.chain.id})`);
  if (somnia.address) {
    console.log(`👛 Bot signing wallet: ${somnia.address}`);
  } else {
    console.log("👁️ Bot running in read-only mode (no private key provided)");
  }
});

// Standard ERC-20 Transfer event ABI for reactivity
const erc20TransferAbi = [
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

discord.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    if (commandName === "balance") {
      await interaction.deferReply();
      const address = interaction.options.getString("address", true);

      const balanceWei = await somnia.wallet.getBalance(address);
      const explorerUrl = somnia.explorer.address(address);

      const embed = createWalletEmbed({
        address,
        nativeBalance: balanceWei,
        nativeSymbol: somnia.chain.nativeCurrency.symbol,
        networkName: somnia.chain.name,
        explorerUrl,
      });

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    if (commandName === "tx") {
      await interaction.deferReply();
      const hash = interaction.options.getString("hash", true);

      const receipt = await somnia.tx.receipt(hash);

      if (!receipt) {
        await interaction.editReply({
          content: `⏳ Transaction ${formatAddressCode(hash)} is pending or was not found.`,
        });
        return;
      }

      const explorerUrl = somnia.explorer.tx(hash);
      const embed = createTransactionEmbed({
        hash: receipt.hash,
        from: receipt.from,
        to: receipt.to,
        status: receipt.status === "reverted" ? "reverted" : "confirmed",
        blockNumber: receipt.blockNumber,
        explorerUrl,
      });

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    if (commandName === "transfer") {
      await interaction.deferReply({ ephemeral: true });

      if (!somnia.address) {
        await interaction.editReply({
          content: "❌ Signing wallet not configured. Set SOMNIA_PRIVATE_KEY in `.env` to enable transfers.",
        });
        return;
      }

      const to = interaction.options.getString("to", true);
      const amountStr = interaction.options.getString("amount", true);
      const amountWei = parseEther(amountStr);

      const txHash = await somnia.wallet.transfer({
        to,
        amount: amountWei,
      });

      const explorerUrl = somnia.explorer.tx(txHash);
      const embed = createTransferEmbed({
        from: somnia.address,
        to,
        amount: amountWei,
        symbol: somnia.chain.nativeCurrency.symbol,
        hash: txHash,
        explorerUrl,
        isNative: true,
      });

      await interaction.editReply({
        content: `✅ Transfer transaction submitted!`,
        embeds: [embed],
      });
      return;
    }

    if (commandName === "watch") {
      await interaction.deferReply();
      const contractAddress = interaction.options.getString("contract", true);
      const channel = interaction.channel as TextChannel | null;

      if (!channel) {
        await interaction.editReply({ content: "❌ Command must be used in a text channel." });
        return;
      }

      const subscription = somnia.reactivity.subscribe(
        {
          address: contractAddress,
          abi: erc20TransferAbi,
          eventName: "Transfer",
        },
        async (event) => {
          const from = (event.log.topics[1] as string) ?? "unknown";
          const to = (event.log.topics[2] as string) ?? "unknown";
          const amount = event.log.data ? BigInt(event.log.data) : 0n;
          const eventTxHash = (event.log.transactionHash as string) ?? "0x";

          const alertEmbed = createTransferEmbed({
            from,
            to,
            amount,
            symbol: "TOKENS",
            hash: eventTxHash,
            explorerUrl: event.log.transactionHash
              ? somnia.explorer.tx(event.log.transactionHash)
              : somnia.explorer.address(contractAddress),
          });

          await channel.send({
            content: `🔔 **Live Event Alert: Transfer on ${formatAddressCode(contractAddress)}**`,
            embeds: [alertEmbed],
          });
        },
        (error) => {
          console.error(`Subscription error for ${contractAddress}:`, error);
        },
      );

      const successEmbed = createSuccessEmbed(
        "Reactivity Subscription Active",
        `Now monitoring **Transfer** events on ${formatAddressCode(contractAddress)} via Somnia WebSocket transport.\nSubscription ID: \`${subscription.id}\``,
      );

      await interaction.editReply({ embeds: [successEmbed] });
      return;
    }
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error);

    const errorMessage = error instanceof SomniaError
      ? `[${error.code}] ${error.message}`
      : error instanceof Error
        ? error.message
        : "An unknown error occurred.";

    const errorEmbed = createErrorEmbed("Command Error", errorMessage);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ embeds: [errorEmbed] });
    } else {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
});

// Graceful shutdown
const cleanup = async () => {
  console.log("\nShutting down bot...");
  await somnia.close();
  discord.destroy();
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

discord.login(discordToken);
