/**
 * Discord timestamp formatting.
 *
 * Discord supports dynamic timestamps via <t:UNIX:STYLE> syntax.
 * https://discord.com/developers/docs/reference#message-formatting-timestamp-styles
 */

export type TimestampStyle =
  | "t" // Short Time: 16:20
  | "T" // Long Time: 16:20:30
  | "d" // Short Date: 20/04/2021
  | "D" // Long Date: 20 April 2021
  | "f" // Short Date/Time: 20 April 2021 16:20
  | "F" // Long Date/Time: Tuesday, 20 April 2021 16:20
  | "R"; // Relative: 2 months ago

/**
 * Formats a Unix timestamp (seconds) as a Discord dynamic timestamp.
 */
export function formatTimestamp(unixSeconds: number, style: TimestampStyle = "R"): string {
  return `<t:${Math.floor(unixSeconds)}:${style}>`;
}

/**
 * Formats a Date object as a Discord dynamic timestamp.
 */
export function formatDate(date: Date, style: TimestampStyle = "R"): string {
  return formatTimestamp(Math.floor(date.getTime() / 1000), style);
}

/**
 * Returns the current time as a Discord timestamp.
 */
export function formatNow(style: TimestampStyle = "R"): string {
  return formatTimestamp(Math.floor(Date.now() / 1000), style);
}
