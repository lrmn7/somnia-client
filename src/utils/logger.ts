/**
 * Pluggable logger interface.
 *
 * The package never logs secrets. The default logger is a no-op.
 * Developers can provide their own logger matching this interface.
 */

export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

/**
 * Default no-op logger. Produces no output.
 */
export const noopLogger: Logger = {
  debug() {},
  info() {},
  warn() {},
  error() {},
};

/**
 * Simple console-based logger for development.
 */
export const consoleLogger: Logger = {
  debug(message: string, ...args: unknown[]) {
    console.debug(`[somnia-client] ${message}`, ...args);
  },
  info(message: string, ...args: unknown[]) {
    console.info(`[somnia-client] ${message}`, ...args);
  },
  warn(message: string, ...args: unknown[]) {
    console.warn(`[somnia-client] ${message}`, ...args);
  },
  error(message: string, ...args: unknown[]) {
    console.error(`[somnia-client] ${message}`, ...args);
  },
};
