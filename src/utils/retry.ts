/**
 * Bounded exponential backoff retry utility.
 *
 * Only retries operations classified as retryable.
 * Supports AbortSignal for cancellation.
 */

import { NetworkError, SomniaError } from "../errors/index.js";
import type { Logger } from "./logger.js";
import { noopLogger } from "./logger.js";

export interface RetryOptions {
  /** Maximum number of retry attempts. Default: 3. */
  maxRetries?: number;
  /** Initial delay in ms before the first retry. Default: 1000. */
  initialDelayMs?: number;
  /** Maximum delay in ms between retries. Default: 30000. */
  maxDelayMs?: number;
  /** Multiplier for exponential backoff. Default: 2. */
  backoffMultiplier?: number;
  /** AbortSignal for cancellation. */
  signal?: AbortSignal;
  /** Logger instance. */
  logger?: Logger;
}

/**
 * Determines whether an error is retryable.
 */
export function isRetryable(error: unknown): boolean {
  if (error instanceof SomniaError) {
    return error.retryable;
  }
  // Network-level errors are generally retryable
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("econnreset") ||
      msg.includes("econnrefused") ||
      msg.includes("etimedout") ||
      msg.includes("socket hang up") ||
      msg.includes("fetch failed") ||
      msg.includes("network") ||
      msg.includes("502") ||
      msg.includes("503") ||
      msg.includes("504")
    );
  }
  return false;
}

/**
 * Executes a function with bounded exponential backoff retries.
 */
export async function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const initialDelay = options?.initialDelayMs ?? 1000;
  const maxDelay = options?.maxDelayMs ?? 30000;
  const multiplier = options?.backoffMultiplier ?? 2;
  const signal = options?.signal;
  const logger = options?.logger ?? noopLogger;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (signal?.aborted) {
      throw new NetworkError("Operation cancelled", { operation: "retry", retryable: false });
    }

    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !isRetryable(error)) {
        throw error;
      }

      const delay = Math.min(initialDelay * multiplier ** attempt, maxDelay);
      logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);

      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, delay);
        signal?.addEventListener(
          "abort",
          () => {
            clearTimeout(timer);
            reject(
              new NetworkError("Operation cancelled during retry", {
                operation: "retry",
                retryable: false,
              }),
            );
          },
          { once: true },
        );
      });
    }
  }

  throw lastError;
}
