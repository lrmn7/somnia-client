/**
 * Wallet balance Discord embed.
 */

import type { EmbedBuilder } from "discord.js";
import { formatAddressTruncated } from "../formatters/address.js";
import { formatAmountFixed } from "../formatters/amount.js";
import { createSomniaEmbed } from "./generic.js";

export interface WalletEmbedData {
  address: string;
  nativeBalance: bigint;
  nativeSymbol?: string;
  explorerUrl: string;
  networkName: string;
  tokens?: Array<{
    symbol: string;
    balance: string; // Pre-formatted
  }>;
}

/**
 * Creates a wallet balance embed.
 */
export function createWalletEmbed(data: WalletEmbedData): EmbedBuilder {
  const symbol = data.nativeSymbol ?? "SOMI";

  const embed = createSomniaEmbed("💰 Wallet Balance");

  embed.setDescription(
    `**Address:** ${formatAddressTruncated(data.address)}\n**Network:** ${data.networkName}`,
  );

  embed.addFields({
    name: `${symbol} Balance`,
    value: formatAmountFixed(data.nativeBalance, 6, symbol),
    inline: true,
  });

  if (data.tokens && data.tokens.length > 0) {
    for (const token of data.tokens) {
      embed.addFields({ name: token.symbol, value: token.balance, inline: true });
    }
  }

  embed.addFields({
    name: "Explorer",
    value: `[View on Explorer](${data.explorerUrl})`,
    inline: false,
  });

  return embed;
}
