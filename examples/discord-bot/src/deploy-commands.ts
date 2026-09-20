import "dotenv/config";
import {
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
} from "discord.js";

const commands = [
  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Query Somnia native balance for an address")
    .addStringOption((opt) =>
      opt
        .setName("address")
        .setDescription("The 0x... EVM address to inspect")
        .setRequired(true),
    ),

  new SlashCommandBuilder()
    .setName("tx")
    .setDescription("Look up a Somnia transaction by hash")
    .addStringOption((opt) =>
      opt
        .setName("hash")
        .setDescription("The 0x... transaction hash")
        .setRequired(true),
    ),

  new SlashCommandBuilder()
    .setName("transfer")
    .setDescription("Send native Somnia tokens (Admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((opt) =>
      opt
        .setName("to")
        .setDescription("Recipient address (0x...)")
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName("amount")
        .setDescription("Amount in STT/SOMI (e.g. 0.5)")
        .setRequired(true),
    ),

  new SlashCommandBuilder()
    .setName("watch")
    .setDescription("Subscribe to live ERC-20 Transfer events via Reactivity")
    .addStringOption((opt) =>
      opt
        .setName("contract")
        .setDescription("Contract address to monitor")
        .setRequired(true),
    ),
].map((cmd) => cmd.toJSON());

async function main() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token || !clientId) {
    console.error("Missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID in .env");
    process.exit(1);
  }

  const rest = new REST({ version: "10" }).setToken(token);

  console.log(`Started refreshing ${commands.length} application (/) commands.`);

  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    console.log(`Successfully registered commands to guild: ${guildId}`);
  } else {
    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });
    console.log("Successfully registered global application commands.");
  }
}

main().catch(console.error);
