/**
 * Off-chain Reactivity client.
 *
 * Wraps viem's WebSocket-based event watching to provide a Somnia Reactivity-compatible
 * subscription interface. When the native `@somnia-chain/reactivity` SDK is available,
 * this module can be extended to use the `somnia_subscribe` / `somnia_watch` RPC methods
 * directly. The current implementation uses viem's `watchContractEvent` which is
 * functionally equivalent for standard EVM events.
 *
 * Source: https://docs.somnia.network/developer/reactivity
 * Verified: 2026-09-20
 */

import type { Abi, Chain, Log, PublicClient, Transport, WatchContractEventReturnType } from "viem";
import { ReactivityError } from "../errors/index.js";
import type { Logger } from "../utils/logger.js";
import { noopLogger } from "../utils/logger.js";
import { validateAddress } from "../utils/validation.js";
import type {
  ReactivityErrorHandler,
  ReactivityEventHandler,
  ReactivitySubscription,
  ReactivitySubscriptionOptions,
} from "./types.js";

let subscriptionCounter = 0;

/**
 * Creates a reactive event subscription using viem's WebSocket transport.
 *
 * Requires the PublicClient to be configured with a WebSocket transport.
 */
export function subscribe(
  client: PublicClient<Transport, Chain>,
  options: ReactivitySubscriptionOptions,
  onEvent: ReactivityEventHandler,
  onError?: ReactivityErrorHandler,
  logger?: Logger,
): ReactivitySubscription {
  const log = logger ?? noopLogger;
  const address = validateAddress(options.address, "contract address");
  const id = `rxn_${++subscriptionCounter}_${Date.now()}`;
  let closed = false;
  let unwatch: WatchContractEventReturnType | undefined;

  try {
    unwatch = client.watchContractEvent({
      address,
      abi: options.abi as Abi,
      eventName: options.eventName as string | undefined,
      args: options.args as Record<string, unknown> | undefined,
      onLogs: (logs: Log[]) => {
        for (const logEntry of logs) {
          const event = {
            log: logEntry,
            receivedAt: Date.now(),
            subscriptionId: id,
          };
          try {
            const result = onEvent(event);
            // Handle async handlers
            if (result instanceof Promise) {
              result.catch((err) => {
                log.error(`Reactivity handler error in subscription ${id}`, err);
                onError?.(err instanceof Error ? err : new Error(String(err)));
              });
            }
          } catch (err) {
            log.error(`Reactivity handler error in subscription ${id}`, err);
            onError?.(err instanceof Error ? err : new Error(String(err)));
          }
        }
      },
      onError: (err: Error) => {
        log.error(`Reactivity subscription ${id} error`, err);
        onError?.(err);
      },
    });
  } catch (error) {
    throw new ReactivityError(
      "Failed to create subscription",
      {
        operation: "subscribe",
        contractAddress: options.address,
        eventName: options.eventName,
        retryable: true,
      },
      error,
    );
  }

  log.info(`Reactivity subscription ${id} created for ${address}`);

  return {
    id,
    get closed() {
      return closed;
    },
    async unsubscribe() {
      if (closed) return;
      closed = true;
      unwatch?.();
      log.info(`Reactivity subscription ${id} closed`);
    },
  };
}
