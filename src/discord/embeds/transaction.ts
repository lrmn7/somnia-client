/**
 * Transaction-related Discord embeds.
 */

import type { EmbedBuilder } from "discord.js";
import { formatAddressTruncated } from "../formatters/address.js";
import { formatAmountFixed } from "../formatters/amount.js";
import { createErrorEmbed, createInfoEmbed, createSuccessEmbed } from "./generic.js";

export interface TransactionEmbedData {
  hash: string;
  from: string;
  to: string | null;
  value?: bigint;
  status: "confirmed" | "reverted" | "submitted";
  blockNumber?: bigint;
  explorerUrl: string;
  nativeSymbol?: string;
}

/**
 * Creates a transaction notification embed.
 */
export function createTransactionEmbed(data: TransactionEmbedData): EmbedBuilder {
  const symbol = data.nativeSymbol ?? "SOMI";

  const embed =
    data.status === "reverted"
      ? createErrorEmbed("Transaction Reverted")
      : data.status === "confirmed"
        ? createSuccessEmbed("Transaction Confirmed")
        : createInfoEmbed("Transaction Submitted");

  embed.addFields(
    {
      name: "Hash",
      value: `[\`${data.hash.slice(0, 14)}...\`](${data.explorerUrl})`,
      inline: false,
    },
    { name: "From", value: formatAddressTruncated(data.from), inline: true },
    {
      name: "To",
      value: data.to ? formatAddressTruncated(data.to) : "Contract Creation",
      inline: true,
    },
  );

  if (data.value !== undefined && data.value > 0n) {
    embed.addFields({
      name: "Value",
      value: formatAmountFixed(data.value, 6, symbol),
      inline: true,
    });
  }

  if (data.blockNumber !== undefined) {
    embed.addFields({ name: "Block", value: data.blockNumber.toString(), inline: true });
  }

  return embed;
}
