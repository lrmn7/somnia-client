/**
 * Base Somnia-branded embed helpers.
 *
 * Uses discord.js EmbedBuilder. This file is only imported when discord.js
 * is available as a peer dependency.
 */

import { EmbedBuilder } from "discord.js";

/** Somnia brand color (hex). */
const SOMNIA_COLOR = 0x6366f1; // Indigo-500
const SOMNIA_FOOTER = "Powered by Somnia Network";

/**
 * Creates a base Somnia-branded embed.
 */
export function createSomniaEmbed(title?: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(SOMNIA_COLOR)
    .setFooter({ text: SOMNIA_FOOTER })
    .setTimestamp();

  if (title) {
    embed.setTitle(title);
  }

  return embed;
}

/**
 * Creates a success embed.
 */
export function createSuccessEmbed(title: string, description?: string): EmbedBuilder {
  const embed = createSomniaEmbed(`✅ ${title}`);
  if (description) {
    embed.setDescription(description);
  }
  embed.setColor(0x22c55e); // Green-500
  return embed;
}

/**
 * Creates an error embed.
 */
export function createErrorEmbed(title: string, description?: string): EmbedBuilder {
  const embed = createSomniaEmbed(`❌ ${title}`);
  if (description) {
    embed.setDescription(description);
  }
  embed.setColor(0xef4444); // Red-500
  return embed;
}

/**
 * Creates an info embed.
 */
export function createInfoEmbed(title: string, description?: string): EmbedBuilder {
  const embed = createSomniaEmbed(`ℹ️ ${title}`);
  if (description) {
    embed.setDescription(description);
  }
  return embed;
}

/**
 * Creates a warning embed.
 */
export function createWarningEmbed(title: string, description?: string): EmbedBuilder {
  const embed = createSomniaEmbed(`⚠️ ${title}`);
  if (description) {
    embed.setDescription(description);
  }
  embed.setColor(0xf59e0b); // Amber-500
  return embed;
}
