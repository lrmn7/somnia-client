/**
 * Discord-friendly address formatting.
 */

import { truncateAddress } from "../../utils/formatting.js";

/**
 * Formats an address as an inline code block for Discord.
 */
export function formatAddressCode(address: string): string {
  return `\`${address}\``;
}

/**
 * Formats an address as a truncated inline code block.
 */
export function formatAddressTruncated(address: string, prefixLen = 6, suffixLen = 4): string {
  return `\`${truncateAddress(address, prefixLen, suffixLen)}\``;
}

/**
 * Formats an address as a clickable explorer link for Discord.
 */
export function formatAddressLink(address: string, explorerUrl: string): string {
  const truncated = truncateAddress(address);
  return `[${truncated}](${explorerUrl})`;
}
