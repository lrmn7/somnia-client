/**
 * Amount and address formatting utilities.
 */

import { formatEther, formatUnits } from "viem";

/**
 * Formats a wei-denominated bigint into a human-readable string with the native token symbol.
 */
export function formatNativeAmount(weiAmount: bigint, symbol = "SOMI"): string {
  const formatted = formatEther(weiAmount);
  return `${formatted} ${symbol}`;
}

/**
 * Formats a raw token amount using the token's decimals.
 */
export function formatTokenAmount(rawAmount: bigint, decimals: number, symbol?: string): string {
  const formatted = formatUnits(rawAmount, decimals);
  return symbol ? `${formatted} ${symbol}` : formatted;
}

/**
 * Truncates an address for display: 0x1234...abcd
 */
export function truncateAddress(address: string, prefixLen = 6, suffixLen = 4): string {
  if (address.length <= prefixLen + suffixLen) {
    return address;
  }
  return `${address.slice(0, prefixLen)}...${address.slice(-suffixLen)}`;
}

/**
 * Formats a bigint wei value to a fixed number of decimal places.
 */
export function formatEtherFixed(weiAmount: bigint, decimalPlaces = 4): string {
  const full = formatEther(weiAmount);
  const dotIndex = full.indexOf(".");
  if (dotIndex === -1) {
    return `${full}.${"0".repeat(decimalPlaces)}`;
  }
  const intPart = full.slice(0, dotIndex);
  const fracPart = full.slice(dotIndex + 1);
  const padded = fracPart.padEnd(decimalPlaces, "0").slice(0, decimalPlaces);
  return `${intPart}.${padded}`;
}
