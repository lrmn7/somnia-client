/**
 * Discord adapter – barrel export.
 *
 * This module requires discord.js as a peer dependency.
 * It provides Discord-specific formatting and embed utilities
 * for Somnia blockchain data.
 *
 * Usage:
 *   import { createTransactionEmbed, formatAddressTruncated } from "somnia-client/discord";
 */

export {
  formatAddressCode,
  formatAddressTruncated,
  formatAddressLink,
} from "./formatters/address.js";
export {
  formatAmountBold,
  formatAmountFixed,
  formatTokenAmountDisplay,
} from "./formatters/amount.js";
export {
  formatTimestamp,
  formatDate,
  formatNow,
} from "./formatters/timestamp.js";
export type { TimestampStyle } from "./formatters/timestamp.js";
export {
  createSomniaEmbed,
  createSuccessEmbed,
  createErrorEmbed,
  createInfoEmbed,
  createWarningEmbed,
} from "./embeds/generic.js";
export { createTransactionEmbed } from "./embeds/transaction.js";
export type { TransactionEmbedData } from "./embeds/transaction.js";
export { createTransferEmbed } from "./embeds/transfer.js";
export type { TransferEmbedData } from "./embeds/transfer.js";
export { createWalletEmbed } from "./embeds/wallet.js";
export type { WalletEmbedData } from "./embeds/wallet.js";
