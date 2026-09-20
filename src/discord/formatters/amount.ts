/**
 * Discord-friendly amount formatting.
 */

import { formatEtherFixed, formatNativeAmount, formatTokenAmount } from "../../utils/formatting.js";

/**
 * Formats a native token amount for Discord display.
 * Shows the value with a bold symbol.
 */
export function formatAmountBold(weiAmount: bigint, symbol = "SOMI"): string {
  const formatted = formatNativeAmount(weiAmount, symbol);
  return `**${formatted}**`;
}

/**
 * Formats a native token amount with fixed decimals for Discord.
 */
export function formatAmountFixed(weiAmount: bigint, decimalPlaces = 4, symbol = "SOMI"): string {
  const value = formatEtherFixed(weiAmount, decimalPlaces);
  return `${value} ${symbol}`;
}

/**
 * Formats a token amount with its symbol for Discord.
 */
export function formatTokenAmountDisplay(
  rawAmount: bigint,
  decimals: number,
  symbol: string,
): string {
  return `**${formatTokenAmount(rawAmount, decimals, symbol)}**`;
}
