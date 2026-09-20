/**
 * Transfer notification Discord embed.
 */

import type { EmbedBuilder } from "discord.js";
import { formatAddressTruncated } from "../formatters/address.js";
import { formatAmountFixed, formatTokenAmountDisplay } from "../formatters/amount.js";
import { createSuccessEmbed } from "./generic.js";

export interface TransferEmbedData {
  from: string;
  to: string;
  amount: bigint;
  symbol: string;
  decimals?: number;
  hash: string;
  explorerUrl: string;
  isNative?: boolean;
}

/**
 * Creates a transfer notification embed.
 */
export function createTransferEmbed(data: TransferEmbedData): EmbedBuilder {
  const amountStr = data.isNative
    ? formatAmountFixed(data.amount, 6, data.symbol)
    : formatTokenAmountDisplay(data.amount, data.decimals ?? 18, data.symbol);

  const embed = createSuccessEmbed("Transfer Complete");

  embed.setDescription(
    `${formatAddressTruncated(data.from)} → ${formatAddressTruncated(data.to)}\n\n**${amountStr}**`,
  );

  embed.addFields({
    name: "Transaction",
    value: `[\`View on Explorer\`](${data.explorerUrl})`,
    inline: false,
  });

  return embed;
}
